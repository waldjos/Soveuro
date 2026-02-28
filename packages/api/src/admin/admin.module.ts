import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { DoctorApplicationsModule } from '../doctor-applications/doctor-applications.module';
import { RolesGuard } from '../common/guards/roles.guard';
import { AdminController } from './admin.controller';

@Module({
  imports: [PrismaModule, DoctorApplicationsModule],
  controllers: [AdminController],
  providers: [RolesGuard],
})
export class AdminModule {}

