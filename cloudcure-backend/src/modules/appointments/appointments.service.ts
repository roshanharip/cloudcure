import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Appointment,
  AppointmentDocument,
  AppointmentStatus,
} from './schemas/appointment.schema';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Patient, PatientDocument } from '../patient/schemas/patient.schema';
import { Doctor, DoctorDocument } from '../doctor/schemas/doctor.schema';
import { PaginationDto } from '@common/dto/pagination.dto';
import { BasePaginationResponse } from '@common/interfaces/base-pagination-response.interface';
import { SocketGateway } from '../socket/socket.gateway';

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);

  constructor(
    @InjectModel(Appointment.name)
    private appointmentModel: Model<AppointmentDocument>,
    @InjectModel(Patient.name)
    private patientModel: Model<PatientDocument>,
    @InjectModel(Doctor.name)
    private doctorModel: Model<DoctorDocument>,
    @Inject(forwardRef(() => SocketGateway))
    private readonly socketGateway: SocketGateway,
  ) {
    this.logger.log('AppointmentsService initialized');
  }

  /**
   * Resolve user-level IDs to patient/doctor profile IDs.
   */
  private async resolveParticipantIds(dto: CreateAppointmentDto): Promise<void> {
    try {
      if (Types.ObjectId.isValid(dto.patient)) {
        const pRecord = await this.patientModel
          .findOne({ $or: [{ _id: dto.patient }, { user: dto.patient }] } as any)
          .exec();
        if (pRecord) dto.patient = pRecord._id.toString();
      }
      if (Types.ObjectId.isValid(dto.doctor)) {
        const dRecord = await this.doctorModel
          .findOne({ $or: [{ _id: dto.doctor }, { user: dto.doctor }] } as any)
          .exec();
        if (dRecord) dto.doctor = dRecord._id.toString();
      }
    } catch (e) {
      this.logger.warn('Error resolving participant IDs: ' + e);
    }
  }

  /**
   * Resolve patient and doctor user IDs from appointment for socket emissions.
   */
  private async resolveUserIds(
    appointment: AppointmentDocument,
  ): Promise<{ patientUserId: string; doctorUserId: string }> {
    const [patientRecord, doctorRecord] = await Promise.all([
      this.patientModel
        .findById(appointment.patient)
        .select('user')
        .exec(),
      this.doctorModel
        .findById(appointment.doctor)
        .select('user')
        .exec(),
    ]);

    return {
      patientUserId: patientRecord?.user?.toString() ?? appointment.patient.toString(),
      doctorUserId: doctorRecord?.user?.toString() ?? appointment.doctor.toString(),
    };
  }

  /**
   * Emit appointment event to both patient and doctor.
   */
  private async emitAppointmentEvent(
    appointment: AppointmentDocument,
    event: string,
    message: string,
  ): Promise<void> {
    try {
      const { patientUserId, doctorUserId } =
        await this.resolveUserIds(appointment);

      const payload = {
        appointmentId: appointment._id.toString(),
        status: appointment.status,
        message,
        timestamp: new Date().toISOString(),
      };

      this.socketGateway.emitToUsers([patientUserId, doctorUserId], event, payload);
    } catch (e) {
      this.logger.warn('Failed to emit appointment event: ' + e);
    }
  }

  async create(
    createAppointmentDto: CreateAppointmentDto,
  ): Promise<AppointmentDocument> {
    await this.resolveParticipantIds(createAppointmentDto);

    this.logger.log(
      `Creating appointment for patient: ${createAppointmentDto.patient} with doctor: ${createAppointmentDto.doctor}`,
    );

    const appointmentDate = new Date(createAppointmentDto.scheduledDate);
    if (appointmentDate < new Date()) {
      throw new BadRequestException('Cannot book appointments in the past');
    }

    const conflict = await this.checkConflict(
      createAppointmentDto.doctor,
      createAppointmentDto.scheduledDate,
      createAppointmentDto.scheduledTime,
      createAppointmentDto.duration || 30,
    );

    if (conflict) {
      throw new BadRequestException('This time slot is already booked');
    }

    const appointment = new this.appointmentModel(createAppointmentDto);
    const saved = await appointment.save();

    await this.emitAppointmentEvent(
      saved,
      'appointment:created',
      'A new appointment has been booked',
    );

    return saved;
  }

  async findAll(
    paginationDto: PaginationDto = { page: 1, limit: 10 },
    filters?: {
      patient?: string;
      doctor?: string;
      status?: AppointmentStatus;
      startDate?: string;
      endDate?: string;
    },
  ): Promise<BasePaginationResponse<Appointment>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    // Use a flexible query type to support $in for mixed BSON types
    const query: Record<string, unknown> = {};

    if (filters?.patient) {
      // Appointments may be stored with patient as a plain String OR as ObjectId.
      // $in matches both so existing data and future data are returned correctly.
      const pid = filters.patient;
      if (Types.ObjectId.isValid(pid)) {
        query['patient'] = { $in: [pid, new Types.ObjectId(pid)] };
      } else {
        query['patient'] = pid;
      }
    }

    if (filters?.doctor) {
      const did = filters.doctor;
      if (Types.ObjectId.isValid(did)) {
        query['doctor'] = { $in: [did, new Types.ObjectId(did)] };
      } else {
        query['doctor'] = did;
      }
    }

    if (filters?.status) {
      query['status'] = filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
      const dateFilter: { $gte?: Date; $lte?: Date } = {};
      if (filters.startDate) dateFilter.$gte = new Date(filters.startDate);
      if (filters.endDate) dateFilter.$lte = new Date(filters.endDate);
      query['scheduledDate'] = dateFilter;
    }

    const [items, totalItems] = await Promise.all([
      this.appointmentModel
        .find(query)
        .populate({
          path: 'patient',
          select: 'user dateOfBirth bloodGroup allergies emergencyContact',
          populate: { path: 'user', select: 'name email phone' },
        })
        .populate({
          path: 'doctor',
          select: 'user specialization licenseNumber yearsOfExperience consultationFee',
          populate: { path: 'user', select: 'name email' },
        })
        .populate('prescription')
        .sort({ scheduledDate: -1, scheduledTime: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.appointmentModel.countDocuments(query).exec(),
    ]);

    const enriched = await this.enrichLegacyAppointments(items);

    return {
      items: enriched as unknown as AppointmentDocument[],
      totalItems,
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
    };
  }

  /**
   * Old appointments stored patient/doctor as plain User ID strings.
   * Mongoose populate only works on ObjectId-typed fields, so it returns null
   * for string-stored IDs. This method manually enriches those documents.
   */
  private async enrichLegacyAppointments(
    appointments: AppointmentDocument[],
  ): Promise<AppointmentDocument[]> {
    const results = await Promise.all(
      appointments.map(async (apt) => {
        const obj = apt.toObject ? (apt.toObject() as Record<string, unknown>) : ({ ...apt } as Record<string, unknown>);

        const rawPatientId = apt.populated ? apt.populated('patient') || apt.get('patient') : apt.get('patient');

        // patient is null when stored as plain string or missing profile
        if (!obj['patient'] && rawPatientId) {
          const rawId = rawPatientId.toString();
          if (Types.ObjectId.isValid(rawId)) {
            const patientRecord = await this.patientModel
              .findOne({ $or: [{ _id: rawId }, { user: rawId }] } as any)
              .populate('user', 'name email phone')
              .exec();

            if (patientRecord) {
              obj['patient'] = patientRecord.toObject();
            } else {
              // No Patient profile — try to fetch User directly
              try {
                const userRecord = await this.patientModel.db.model('User').findById(rawId).select('name email phone').lean().exec();
                if (userRecord) {
                  obj['patient'] = { _id: rawId, user: userRecord };
                } else {
                  obj['patient'] = { _id: rawId, user: { _id: rawId } };
                }
              } catch (e) {
                obj['patient'] = { _id: rawId, user: { _id: rawId } };
              }
            }
          }
        }

        const rawDoctorId = apt.populated ? apt.populated('doctor') || apt.get('doctor') : apt.get('doctor');

        // doctor is null when stored as plain string or missing profile
        if (!obj['doctor'] && rawDoctorId) {
          const rawId = rawDoctorId.toString();
          if (Types.ObjectId.isValid(rawId)) {
            const doctorRecord = await this.doctorModel
              .findOne({ $or: [{ _id: rawId }, { user: rawId }] } as any)
              .populate('user', 'name email')
              .exec();

            if (doctorRecord) {
              obj['doctor'] = doctorRecord.toObject();
            } else {
              // No Doctor profile — try to fetch User directly
              try {
                const userRecord = await this.doctorModel.db.model('User').findById(rawId).select('name email').lean().exec();
                if (userRecord) {
                  obj['doctor'] = { _id: rawId, user: userRecord };
                } else {
                  obj['doctor'] = { _id: rawId, user: { _id: rawId } };
                }
              } catch (e) {
                obj['doctor'] = { _id: rawId, user: { _id: rawId } };
              }
            }
          }
        }

        return obj;
      }),
    );

    return results as unknown as AppointmentDocument[];
  }

  async findOne(id: string): Promise<AppointmentDocument> {
    const appointment = await this.appointmentModel
      .findById(id)
      .populate({
        path: 'patient',
        select: 'user dateOfBirth bloodGroup allergies emergencyContact',
        populate: { path: 'user', select: 'name email phone' },
      })
      .populate({
        path: 'doctor',
        select: 'user specialization licenseNumber yearsOfExperience consultationFee',
        populate: { path: 'user', select: 'name email' },
      })
      .populate('prescription')
      .exec();

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    const enriched = await this.enrichLegacyAppointments([appointment]);
    return enriched[0];
  }

  async update(
    id: string,
    updateAppointmentDto: UpdateAppointmentDto,
  ): Promise<AppointmentDocument> {
    const appointment = await this.appointmentModel.findById(id).exec();

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    if (
      updateAppointmentDto.scheduledDate ||
      updateAppointmentDto.scheduledTime
    ) {
      const conflict = await this.checkConflict(
        appointment.doctor.toString(),
        updateAppointmentDto.scheduledDate ||
        appointment.scheduledDate.toISOString(),
        updateAppointmentDto.scheduledTime || appointment.scheduledTime,
        updateAppointmentDto.duration || appointment.duration,
        id,
      );

      if (conflict) {
        throw new BadRequestException('This time slot is already booked');
      }
    }

    Object.assign(appointment, updateAppointmentDto);
    const saved = await appointment.save();

    await this.emitAppointmentEvent(
      saved,
      'appointment:updated',
      'An appointment has been updated',
    );

    return saved;
  }

  async cancel(id: string): Promise<AppointmentDocument> {
    const appointment = await this.appointmentModel.findById(id).exec();

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    const allowedStatuses: AppointmentStatus[] = [
      AppointmentStatus.SCHEDULED,
    ];
    if (!allowedStatuses.includes(appointment.status)) {
      throw new BadRequestException(
        `Cannot cancel an appointment with status "${appointment.status}"`,
      );
    }

    appointment.status = AppointmentStatus.CANCELLED;
    const saved = await appointment.save();

    await this.emitAppointmentEvent(
      saved,
      'appointment:cancelled',
      'An appointment has been cancelled',
    );

    return saved;
  }

  /**
   * Start an appointment — status: scheduled → in_progress
   */
  async startAppointment(id: string): Promise<AppointmentDocument> {
    const appointment = await this.appointmentModel.findById(id).exec();

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    if (appointment.status !== AppointmentStatus.SCHEDULED) {
      throw new BadRequestException(
        `Cannot start an appointment with status "${appointment.status}"`,
      );
    }

    appointment.status = AppointmentStatus.IN_PROGRESS;
    appointment.startedAt = new Date();
    const saved = await appointment.save();

    await this.emitAppointmentEvent(
      saved,
      'appointment:started',
      'Your appointment has started',
    );

    return saved;
  }

  /**
   * End an appointment (complete) — status: in_progress → completed
   */
  async endAppointment(
    id: string,
    doctorNotes?: string,
    actualDuration?: number,
  ): Promise<AppointmentDocument> {
    const appointment = await this.appointmentModel.findById(id).exec();

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    if (appointment.status !== AppointmentStatus.IN_PROGRESS) {
      throw new BadRequestException(
        `Cannot end an appointment with status "${appointment.status}"`,
      );
    }

    appointment.status = AppointmentStatus.COMPLETED;
    appointment.endedAt = new Date();

    if (doctorNotes) {
      appointment.doctorNotes = doctorNotes;
    }

    if (actualDuration && actualDuration > 0) {
      appointment.actualDuration = actualDuration;
      const ratePerMinute = appointment.consultationFee / appointment.duration;
      appointment.finalFee = Math.round(ratePerMinute * actualDuration);
    } else {
      appointment.finalFee = appointment.consultationFee;
    }

    const saved = await appointment.save();

    await this.emitAppointmentEvent(
      saved,
      'appointment:ended',
      'Your appointment has been completed',
    );

    return saved;
  }

  /**
   * Terminate an appointment — status: in_progress → terminated
   */
  async terminateAppointment(
    id: string,
    reason: string,
  ): Promise<AppointmentDocument> {
    const appointment = await this.appointmentModel.findById(id).exec();

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    if (appointment.status !== AppointmentStatus.IN_PROGRESS) {
      throw new BadRequestException(
        `Cannot terminate an appointment with status "${appointment.status}"`,
      );
    }

    appointment.status = AppointmentStatus.TERMINATED;
    appointment.terminatedAt = new Date();
    appointment.terminationReason = reason;

    const saved = await appointment.save();

    await this.emitAppointmentEvent(
      saved,
      'appointment:terminated',
      `Appointment was terminated: ${reason}`,
    );

    return saved;
  }

  async complete(
    id: string,
    doctorNotes?: string,
    actualDuration?: number,
  ): Promise<AppointmentDocument> {
    return this.endAppointment(id, doctorNotes, actualDuration);
  }

  async remove(id: string): Promise<AppointmentDocument> {
    const appointment = await this.appointmentModel
      .findByIdAndDelete(id)
      .exec();

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    return appointment;
  }

  /**
   * Return the availability status for every standard time slot on a given day.
   * Booked / in-progress slots are flagged so the frontend can disable them.
   */
  async getSlotAvailability(
    doctorId: string,
    date: string,
    slotDurationMinutes = 30,
  ): Promise<{ time: string; status: 'available' | 'booked' | 'in_progress'; appointmentId?: string }[]> {
    const appointmentDate = new Date(date);

    // Pull all active appointments for this doctor on this date
    const existing = await this.appointmentModel
      .find({
        doctor: { $in: [doctorId, Types.ObjectId.isValid(doctorId) ? new Types.ObjectId(doctorId) : doctorId] },
        scheduledDate: appointmentDate,
        status: { $nin: [AppointmentStatus.CANCELLED, AppointmentStatus.TERMINATED] },
      })
      .select('scheduledTime duration status _id')
      .exec();

    // Standard slot grid: 09:00 – 17:00 in slotDurationMinutes increments
    const allSlots: string[] = [];
    for (let h = 9; h < 17; h++) {
      for (let m = 0; m < 60; m += slotDurationMinutes) {
        allSlots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      }
    }

    return allSlots.map((slotTime) => {
      const [sh, sm] = slotTime.split(':').map(Number);
      const slotStart = sh * 60 + sm;
      const slotEnd = slotStart + slotDurationMinutes;

      for (const apt of existing) {
        const [ah, am] = apt.scheduledTime.split(':').map(Number);
        const aptStart = ah * 60 + am;
        const aptEnd = aptStart + (apt.duration ?? slotDurationMinutes);

        const overlaps =
          (slotStart >= aptStart && slotStart < aptEnd) ||
          (slotEnd > aptStart && slotEnd <= aptEnd) ||
          (slotStart <= aptStart && slotEnd >= aptEnd);

        if (overlaps) {
          return {
            time: slotTime,
            status: apt.status === AppointmentStatus.IN_PROGRESS ? 'in_progress' : 'booked',
            appointmentId: (apt._id as { toString(): string }).toString(),
          };
        }
      }

      return { time: slotTime, status: 'available' };
    });
  }

  private async checkConflict(
    doctorId: string,
    date: string,
    time: string,
    duration: number,
    excludeAppointmentId?: string,
  ): Promise<boolean> {
    const appointmentDate = new Date(date);

    interface ConflictQuery {
      doctor: Types.ObjectId;
      scheduledDate: Date;
      status: { $nin: AppointmentStatus[] };
      _id?: { $ne: Types.ObjectId };
    }

    const query: ConflictQuery = {
      doctor: new Types.ObjectId(doctorId),
      scheduledDate: appointmentDate,
      status: {
        $nin: [AppointmentStatus.CANCELLED, AppointmentStatus.TERMINATED],
      },
    };

    if (excludeAppointmentId) {
      query._id = { $ne: new Types.ObjectId(excludeAppointmentId) };
    }

    const existingAppointments = await this.appointmentModel.find(query).exec();

    const [hours, minutes] = time.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + duration;

    for (const existing of existingAppointments) {
      const [existingHours, existingMinutes] = existing.scheduledTime
        .split(':')
        .map(Number);
      const existingStart = existingHours * 60 + existingMinutes;
      const existingEnd = existingStart + existing.duration;

      if (
        (startMinutes >= existingStart && startMinutes < existingEnd) ||
        (endMinutes > existingStart && endMinutes <= existingEnd) ||
        (startMinutes <= existingStart && endMinutes >= existingEnd)
      ) {
        return true;
      }
    }

    return false;
  }
}
