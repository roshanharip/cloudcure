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
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { Doctor, DoctorDocument } from './schemas/doctor.schema';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { Model, Types } from 'mongoose';
import { DoctorService } from './doctor.service';
import { PaginationDto } from '@common/dto/pagination.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { Role } from '@common/enums/role.enum';

import { ApiTags } from '@nestjs/swagger';

@ApiTags('Doctors')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('doctors')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) { }

  @Roles(Role.DOCTOR)
  @Get('dashboard/stats')
  getDashboardStats(@Request() req: any) {
    return this.doctorService.getDashboardStats(req.user.sub);
  }

  @Roles(Role.DOCTOR)
  @Get('profile/me')
  getProfile(@Request() req: any) {
    return this.doctorService.getDoctorProfile(req.user.sub);
  }

  @Roles(Role.DOCTOR)
  @Patch('availability')
  updateAvailability(@Request() req: any, @Body() updateAvailabilityDto: UpdateAvailabilityDto) {
    return this.doctorService.updateAvailability(req.user.sub, updateAvailabilityDto);
  }

  @Roles(Role.ADMIN, Role.DOCTOR)
  @Post()
  create(@Body() createDoctorDto: CreateDoctorDto) {
    return this.doctorService.create(createDoctorDto);
  }

  @Roles(Role.ADMIN, Role.DOCTOR, Role.PATIENT)
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.doctorService.findAll(paginationDto);
  }

  @Roles(Role.ADMIN, Role.DOCTOR, Role.PATIENT)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.doctorService.findOne(id);
  }

  @Roles(Role.ADMIN, Role.DOCTOR)
  @Patch(':id')
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateDoctorDto: Record<string, unknown>,
  ) {
    if (req.user.role !== Role.ADMIN) {
      const doctor = await this.doctorService.findOne(id);

      // Handle the case where doctor.user is populated object or just ID
      const doctorUser = doctor?.user as any;
      const doctorUserId = doctorUser?._id ? doctorUser._id.toString() : doctorUser?.toString();

      if (doctorUserId !== req.user.sub) {
        throw new ForbiddenException('You can only update your own profile');
      }
    }
    return this.doctorService.update(id, updateDoctorDto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.doctorService.remove(id);
  }
}
