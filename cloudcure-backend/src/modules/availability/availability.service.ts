import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Availability,
  AvailabilityDocument,
  DateException,
} from './schemas/availability.schema';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { AddExceptionDto } from './dto/add-exception.dto';

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

@Injectable()
export class AvailabilityService {
  private readonly logger = new Logger(AvailabilityService.name);

  constructor(
    @InjectModel(Availability.name)
    private availabilityModel: Model<AvailabilityDocument>,
  ) {
    this.logger.log('AvailabilityService initialized');
  }

  async create(
    createAvailabilityDto: CreateAvailabilityDto,
  ): Promise<AvailabilityDocument> {
    this.logger.log(
      `Setting availability for doctor: ${createAvailabilityDto.doctor}`,
    );

    // Validate time range
    if (createAvailabilityDto.startTime >= createAvailabilityDto.endTime) {
      throw new BadRequestException('End time must be after start time');
    }

    const availability = new this.availabilityModel(createAvailabilityDto);
    return availability.save();
  }

  async findByDoctor(doctorId: string): Promise<AvailabilityDocument[]> {
    return this.availabilityModel
      .find({ doctor: new Types.ObjectId(doctorId), isActive: true })
      .sort({ dayOfWeek: 1 })
      .exec();
  }

  async findOne(id: string): Promise<AvailabilityDocument> {
    const availability = await this.availabilityModel.findById(id).exec();

    if (!availability) {
      throw new NotFoundException(`Availability with ID ${id} not found`);
    }

    return availability;
  }

  async update(
    id: string,
    updateAvailabilityDto: UpdateAvailabilityDto,
  ): Promise<AvailabilityDocument> {
    const availability = await this.availabilityModel.findById(id).exec();

    if (!availability) {
      throw new NotFoundException(`Availability with ID ${id} not found`);
    }

    // Validate time range if both are provided
    const startTime = updateAvailabilityDto.startTime || availability.startTime;
    const endTime = updateAvailabilityDto.endTime || availability.endTime;

    if (startTime >= endTime) {
      throw new BadRequestException('End time must be after start time');
    }

    Object.assign(availability, updateAvailabilityDto);
    return availability.save();
  }

  async remove(id: string): Promise<AvailabilityDocument> {
    const availability = await this.availabilityModel
      .findByIdAndDelete(id)
      .exec();

    if (!availability) {
      throw new NotFoundException(`Availability with ID ${id} not found`);
    }

    return availability;
  }

  async addException(addExceptionDto: AddExceptionDto): Promise<void> {
    const { doctor, date, reason } = addExceptionDto;

    const exception: DateException = {
      date: new Date(date),
      reason,
    };

    await this.availabilityModel
      .updateMany(
        { doctor: new Types.ObjectId(doctor) },
        { $push: { exceptions: exception } },
      )
      .exec();

    this.logger.log(`Added exception for doctor ${doctor} on ${date}`);
  }

  async removeException(doctorId: string, date: string): Promise<void> {
    await this.availabilityModel
      .updateMany(
        { doctor: new Types.ObjectId(doctorId) },
        { $pull: { exceptions: { date: new Date(date) } } },
      )
      .exec();

    this.logger.log(`Removed exception for doctor ${doctorId} on ${date}`);
  }

  /**
   * Calculate available time slots for a doctor on a specific date
   */
  async getAvailableSlots(
    doctorId: string,
    date: string,
    bookedSlots: { time: string; duration: number }[] = [],
  ): Promise<TimeSlot[]> {
    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay();

    // Get availability for this day of week
    const availabilities = await this.availabilityModel
      .find({
        doctor: new Types.ObjectId(doctorId),
        dayOfWeek,
        isActive: true,
      })
      .exec();

    if (availabilities.length === 0) {
      return [];
    }

    const slots: TimeSlot[] = [];

    for (const availability of availabilities) {
      // Check if this date is in exceptions
      const isBlocked = availability.exceptions.some(
        (exception) => exception.date.toISOString().split('T')[0] === date,
      );

      if (isBlocked) {
        this.logger.debug(`Date ${date} is blocked for doctor ${doctorId}`);
        continue;
      }

      // Generate time slots
      const generatedSlots = this.generateTimeSlots(
        availability.startTime,
        availability.endTime,
        availability.slotDuration,
      );

      // Mark unavailable slots based on booked appointments
      const slotsWithAvailability = generatedSlots.map((slot) => ({
        ...slot,
        available: !this.isSlotBooked(slot, bookedSlots),
      }));

      slots.push(...slotsWithAvailability);
    }

    return slots;
  }

  /**
   * Generate time slots between start and end time
   */
  private generateTimeSlots(
    startTime: string,
    endTime: string,
    slotDuration: number,
  ): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);

    let currentMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;

    while (currentMinutes + slotDuration <= endTotalMinutes) {
      const slotStart = this.minutesToTime(currentMinutes);
      const slotEnd = this.minutesToTime(currentMinutes + slotDuration);

      slots.push({
        start: slotStart,
        end: slotEnd,
        available: true,
      });

      currentMinutes += slotDuration;
    }

    return slots;
  }

  /**
   * Check if a time slot overlaps with any booked appointments
   */
  private isSlotBooked(
    slot: TimeSlot,
    bookedSlots: { time: string; duration: number }[],
  ): boolean {
    const slotStartMinutes = this.timeToMinutes(slot.start);
    const slotEndMinutes = this.timeToMinutes(slot.end);

    return bookedSlots.some((booked) => {
      const bookedStart = this.timeToMinutes(booked.time);
      const bookedEnd = bookedStart + booked.duration;

      // Check for overlap
      return (
        (slotStartMinutes >= bookedStart && slotStartMinutes < bookedEnd) ||
        (slotEndMinutes > bookedStart && slotEndMinutes <= bookedEnd) ||
        (slotStartMinutes <= bookedStart && slotEndMinutes >= bookedEnd)
      );
    });
  }

  /**
   * Convert time string (HH:mm) to minutes since midnight
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Convert minutes since midnight to time string (HH:mm)
   */
  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }
}
