import { Module } from '@nestjs/common';
import { CommonModule } from '@common/common.module';
import { UsersModule } from '@modules/users/users.module';
import { AuthModule } from '@modules/auth/auth.module';
import { AppConfigModule } from '@config/app-config.module';
import { DatabaseModule } from '@config/database.module';
import { ModelsModule } from '@config/models.module';
import { AdminModule } from '@modules/admin/admin.module';
import { MedicalRecordsModule } from '@modules/medical-records/medical-records.module';
import { PrescriptionsModule } from '@modules/prescriptions/prescriptions.module';
import { LoggerModule } from '@common/logger/logger.module';
import { DoctorModule } from '@modules/doctor/doctor.module';
import { PatientModule } from '@modules/patient/patient.module';
import { StatsModule } from '@modules/stats/stats.module';
import { AppointmentsModule } from '@modules/appointments/appointments.module';
import { AvailabilityModule } from '@modules/availability/availability.module';
import { MessagesModule } from '@modules/messages/messages.module';
import { SocketModule } from '@modules/socket/socket.module';
import { PaymentsModule } from '@modules/payments/payments.module';

@Module({
  imports: [
    LoggerModule,
    AppConfigModule,
    DatabaseModule,
    ModelsModule,
    CommonModule,
    UsersModule,
    AuthModule,
    AdminModule,
    DoctorModule,
    PatientModule,
    MedicalRecordsModule,
    PrescriptionsModule,
    StatsModule,
    AppointmentsModule,
    AvailabilityModule,
    MessagesModule,
    SocketModule,
    PaymentsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
