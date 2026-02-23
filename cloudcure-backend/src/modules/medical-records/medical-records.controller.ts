import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
  Request,
  Patch,
  Delete,
} from '@nestjs/common';
import { PaginationDto } from '@common/dto/pagination.dto';
import { MedicalRecordsService } from './medical-records.service';
import { PatientService } from '@modules/patient/patient.service';
import { PatientDocument } from '@modules/patient/schemas/patient.schema';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { Role } from '@common/enums/role.enum';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

interface AuthenticatedRequest {
  user: {
    userId: string;
    sub: string;
    role: Role;
  };
}

@ApiTags('Medical Records')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('medical-records')
export class MedicalRecordsController {
  constructor(
    private readonly medicalRecordsService: MedicalRecordsService,
    private readonly patientService: PatientService,
  ) {}

  @Roles(Role.DOCTOR, Role.ADMIN)
  @Post()
  create(@Body() createMedicalRecordDto: CreateMedicalRecordDto) {
    return this.medicalRecordsService.create(createMedicalRecordDto);
  }

  @Roles(Role.DOCTOR, Role.ADMIN, Role.PATIENT)
  @Get()
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const filter: { patient?: string; doctor?: string } = {};

    if (req.user.role === Role.PATIENT) {
      const patient = await this.patientService.findByUserId(req.user.sub);
      if (!patient) {
        return {
          items: [],
          totalItems: 0,
          currentPage: 1,
          totalPages: 0,
        };
      }
      filter.patient = String((patient as PatientDocument)._id);
    }

    return this.medicalRecordsService.findAll(paginationDto, filter);
  }

  @Roles(Role.DOCTOR, Role.ADMIN, Role.PATIENT)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.medicalRecordsService.findOne(id);
  }

  @Roles(Role.DOCTOR, Role.ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMedicalRecordDto: Partial<CreateMedicalRecordDto>,
  ) {
    return this.medicalRecordsService.update(id, updateMedicalRecordDto);
  }

  @Roles(Role.DOCTOR, Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.medicalRecordsService.remove(id);
  }
}
