import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { PaginationDto } from '@common/dto/pagination.dto';
import { AppointmentStatus } from './schemas/appointment.schema';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { Role } from '@common/enums/role.enum';
import { PatientService } from '../patient/patient.service';
import { PatientDocument } from '../patient/schemas/patient.schema';
import { DoctorService } from '../doctor/doctor.service';

interface AuthenticatedRequest {
  user: {
    userId: string;
    sub: string;
    role: Role;
  };
}

@ApiTags('Appointments')
@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AppointmentsController {
  constructor(
    private readonly appointmentsService: AppointmentsService,
    private readonly patientService: PatientService,
    private readonly doctorService: DoctorService,
  ) { }

  @Roles(Role.ADMIN, Role.DOCTOR, Role.PATIENT)
  @Post()
  @ApiOperation({ summary: 'Book a new appointment' })
  @ApiResponse({ status: 201, description: 'Appointment booked successfully' })
  @ApiResponse({ status: 400, description: 'Bad request or time slot conflict' })
  create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentsService.create(createAppointmentDto);
  }

  @Roles(Role.ADMIN, Role.DOCTOR, Role.PATIENT)
  @Get()
  @ApiOperation({ summary: 'Get all appointments with filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'patient', required: false, type: String, description: 'Filter by patient ID (Automatically applied for Patient role)' })
  @ApiQuery({ name: 'doctor', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: AppointmentStatus })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of appointments' })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Request() req: AuthenticatedRequest,
    @Query('patient') patient?: string,
    @Query('doctor') doctor?: string,
    @Query('status') status?: AppointmentStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filter: any = {
      patient,
      doctor,
      status,
      startDate,
      endDate,
    };

    // If user is a patient, strictly filter by their own patient document ID
    if (req.user.role === Role.PATIENT) {
      const patientDoc = await this.patientService.findByUserId(req.user.sub);
      const patientIds: string[] = [req.user.sub];
      if (patientDoc) {
        patientIds.push(String((patientDoc as PatientDocument)._id));
      }
      filter.patient = { $in: patientIds };
    }

    // If user is a doctor, strictly filter by their own doctor document ID
    if (req.user.role === Role.DOCTOR) {
      const doctorDoc = await this.doctorService.findByUserId(req.user.sub);
      const doctorIds: string[] = [req.user.sub];
      if (doctorDoc) {
        doctorIds.push(String((doctorDoc as any)._id));
      }
      filter.doctor = { $in: doctorIds };
    }

    return this.appointmentsService.findAll(paginationDto, filter);
  }

  @Get('slots')
  @ApiOperation({ summary: 'Get slot availability for a doctor on a given date' })
  @ApiQuery({ name: 'doctorId', required: true, type: String })
  @ApiQuery({ name: 'date', required: true, type: String, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'duration', required: false, type: Number, description: 'Slot length in minutes (default 30)' })
  @ApiResponse({ status: 200, description: 'Array of slot availability objects' })
  getSlots(
    @Query('doctorId') doctorId: string,
    @Query('date') date: string,
    @Query('duration') duration?: string,
  ) {
    return this.appointmentsService.getSlotAvailability(
      doctorId,
      date,
      duration ? parseInt(duration, 10) : 30,
    );
  }

  @Roles(Role.ADMIN, Role.DOCTOR, Role.PATIENT)
  @Get(':id')
  @ApiOperation({ summary: 'Get appointment by ID' })
  @ApiResponse({ status: 200, description: 'Appointment details' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Roles(Role.ADMIN, Role.DOCTOR, Role.PATIENT)
  @Patch(':id')
  @ApiOperation({ summary: 'Update appointment' })
  @ApiResponse({ status: 200, description: 'Appointment updated successfully' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @Request() req: AuthenticatedRequest,
  ) {
    // If user is a patient, ensure they own the appointment
    if (req.user.role === Role.PATIENT) {
      const appointment = await this.appointmentsService.findOne(id);

      // Get the User ID associated with the appointment's patient
      // It could be in patient.user._id (enriched) or patient (raw legacy ID)
      const appointmentPatientUserId =
        (appointment.patient as any)?.user?._id ||
        (appointment.patient as any)?.user ||
        appointment.patient;

      if (String(appointmentPatientUserId) !== String(req.user.sub)) {
        throw new ForbiddenException('You can only update your own appointments');
      }

      // Patients can only update date, time, and notes
      const allowedUpdates: (keyof UpdateAppointmentDto)[] = [
        'scheduledDate',
        'scheduledTime',
        'notes',
      ];
      const updates = Object.keys(updateAppointmentDto);
      const disallowed = updates.filter(
        (key) => !allowedUpdates.includes(key as keyof UpdateAppointmentDto),
      );

      if (disallowed.length > 0) {
        throw new ForbiddenException(
          `Patients are not allowed to update: ${disallowed.join(', ')}`,
        );
      }
    }

    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  @Roles(Role.ADMIN, Role.DOCTOR, Role.PATIENT)
  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel an appointment (patient or doctor)' })
  @ApiResponse({ status: 200, description: 'Appointment cancelled' })
  cancel(@Param('id') id: string) {
    return this.appointmentsService.cancel(id);
  }

  @Roles(Role.ADMIN, Role.DOCTOR)
  @Patch(':id/start')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Start an appointment — status: scheduled → in_progress (Doctor only)' })
  @ApiResponse({ status: 200, description: 'Appointment started' })
  start(@Param('id') id: string) {
    return this.appointmentsService.startAppointment(id);
  }

  @Roles(Role.ADMIN, Role.DOCTOR)
  @Patch(':id/end')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'End an appointment — status: in_progress → completed (Doctor only)' })
  @ApiBody({
    schema: {
      properties: {
        doctorNotes: { type: 'string' },
        actualDuration: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Appointment ended and marked completed' })
  end(
    @Param('id') id: string,
    @Body('doctorNotes') doctorNotes?: string,
    @Body('actualDuration') actualDuration?: number,
  ) {
    return this.appointmentsService.endAppointment(id, doctorNotes, actualDuration);
  }

  @Roles(Role.ADMIN, Role.DOCTOR)
  @Patch(':id/terminate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Terminate an appointment — status: in_progress → terminated (Doctor only)' })
  @ApiBody({
    schema: {
      properties: {
        reason: { type: 'string', description: 'Reason for termination' },
      },
      required: ['reason'],
    },
  })
  @ApiResponse({ status: 200, description: 'Appointment terminated' })
  terminate(
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    return this.appointmentsService.terminateAppointment(id, reason);
  }

  @Roles(Role.ADMIN, Role.DOCTOR)
  @Patch(':id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark appointment as completed (alias for end — Doctor only)' })
  @ApiResponse({ status: 200, description: 'Appointment marked as completed' })
  complete(
    @Param('id') id: string,
    @Body('doctorNotes') doctorNotes?: string,
    @Body('actualDuration') actualDuration?: number,
  ) {
    return this.appointmentsService.endAppointment(id, doctorNotes, actualDuration);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete an appointment' })
  @ApiResponse({ status: 200, description: 'Appointment deleted' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }
}
