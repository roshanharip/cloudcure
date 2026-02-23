import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Patch,
  Delete,
} from '@nestjs/common';
import { PatientService } from './patient.service';
import { PaginationDto } from '@common/dto/pagination.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { Req } from '@nestjs/common';
import { Role } from '@common/enums/role.enum';
import { Request } from 'express';
import { ApiTags } from '@nestjs/swagger';

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    email: string;
    role: Role;
  };
}

@ApiTags('Patients')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('patients')
export class PatientController {
  constructor(private readonly patientService: PatientService) { }

  @Roles(Role.ADMIN, Role.PATIENT)
  @Post()
  create(@Body() createPatientDto: any) {
    return this.patientService.create(createPatientDto);
  }

  @Roles(Role.PATIENT)
  @Get('me')
  getMe(@Req() req: AuthenticatedRequest) {
    return this.patientService.getProfile(req.user.sub);
  }

  @Roles(Role.PATIENT)
  @Patch('me')
  updateMe(@Req() req: AuthenticatedRequest, @Body() updateData: any) {
    return this.patientService.updateProfile(req.user.sub, updateData);
  }

  @Roles(Role.PATIENT)
  @Delete('me')
  async deleteMe(@Req() req: AuthenticatedRequest) {
    // This will cascade delete patient profile too
    await this.patientService.removeByUserId(req.user.sub);
    return { success: true, message: 'Account deleted successfully' };
  }

  @Roles(Role.ADMIN, Role.DOCTOR)
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.patientService.findAll(paginationDto);
  }

  @Roles(Role.ADMIN, Role.DOCTOR, Role.PATIENT)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.patientService.findOne(id);
  }

  @Roles(Role.ADMIN, Role.PATIENT)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePatientDto: Record<string, unknown>,
  ) {
    return this.patientService.update(id, updatePatientDto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.patientService.remove(id);
  }
}
