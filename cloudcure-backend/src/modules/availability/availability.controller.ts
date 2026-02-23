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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AvailabilityService } from './availability.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { AddExceptionDto } from './dto/add-exception.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';

@ApiTags('Availability')
@Controller('availability')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Post()
  @ApiOperation({ summary: 'Set doctor availability (Doctor only)' })
  @ApiResponse({ status: 201, description: 'Availability set successfully' })
  @ApiResponse({ status: 400, description: 'Invalid time range' })
  create(@Body() createAvailabilityDto: CreateAvailabilityDto) {
    return this.availabilityService.create(createAvailabilityDto);
  }

  @Get('doctor/:doctorId')
  @ApiOperation({ summary: 'Get doctor availability schedule' })
  @ApiResponse({ status: 200, description: 'Doctor availability schedule' })
  findByDoctor(@Param('doctorId') doctorId: string) {
    return this.availabilityService.findByDoctor(doctorId);
  }

  @Get('slots/:doctorId')
  @ApiOperation({ summary: 'Get available time slots for a specific date' })
  @ApiQuery({
    name: 'date',
    required: true,
    description: 'Date in YYYY-MM-DD format',
  })
  @ApiResponse({ status: 200, description: 'Available time slots' })
  async getAvailableSlots(
    @Param('doctorId') doctorId: string,
    @Query('date') date: string,
  ) {
    // TODO: Fetch booked appointments for this doctor on this date
    // For now, returning slots without booking check
    const slots = await this.availabilityService.getAvailableSlots(
      doctorId,
      date,
      [],
    );
    return { date, doctorId, slots };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get availability by ID' })
  @ApiResponse({ status: 200, description: 'Availability details' })
  @ApiResponse({ status: 404, description: 'Availability not found' })
  findOne(@Param('id') id: string) {
    return this.availabilityService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update availability' })
  @ApiResponse({ status: 200, description: 'Availability updated' })
  @ApiResponse({ status: 404, description: 'Availability not found' })
  update(
    @Param('id') id: string,
    @Body() updateAvailabilityDto: UpdateAvailabilityDto,
  ) {
    return this.availabilityService.update(id, updateAvailabilityDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete availability' })
  @ApiResponse({ status: 200, description: 'Availability deleted' })
  @ApiResponse({ status: 404, description: 'Availability not found' })
  remove(@Param('id') id: string) {
    return this.availabilityService.remove(id);
  }

  @Post('exceptions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Block a specific date for doctor' })
  @ApiResponse({ status: 200, description: 'Date blocked successfully' })
  addException(@Body() addExceptionDto: AddExceptionDto) {
    return this.availabilityService.addException(addExceptionDto);
  }

  @Delete('exceptions/:doctorId/:date')
  @ApiOperation({ summary: 'Remove blocked date' })
  @ApiResponse({ status: 200, description: 'Exception removed' })
  removeException(
    @Param('doctorId') doctorId: string,
    @Param('date') date: string,
  ) {
    return this.availabilityService.removeException(doctorId, date);
  }
}
