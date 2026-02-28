import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DoctorsModule } from './doctors/doctors.module';
import { EventsModule } from './events/events.module';
import { PaymentsModule } from './payments/payments.module';
import { HealthModule } from './health/health.module';
import { DoctorApplicationsModule } from './doctor-applications/doctor-applications.module';
import { AdminModule } from './admin/admin.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    DoctorsModule,
    EventsModule,
    PaymentsModule,
    HealthModule,
    DoctorApplicationsModule,
    AdminModule,
    UploadsModule,
  ],
})
export class AppModule {}
