import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { DoctorApplicationsController } from './doctor-applications.controller';
import { DoctorApplicationsService } from './doctor-applications.service';

@Module({
  imports: [PrismaModule],
  controllers: [DoctorApplicationsController],
  providers: [DoctorApplicationsService],
  exports: [DoctorApplicationsService],
})
export class DoctorApplicationsModule {}

