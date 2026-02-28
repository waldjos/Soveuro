import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertDoctorApplicationDto } from './dto/upsert-doctor-application.dto';
import { AuditEventType, DoctorApplicationStatus, DoctorType, Role } from '@prisma/client';

@Injectable()
export class DoctorApplicationsService {
  constructor(private prisma: PrismaService) {}

  async upsertForUser(userId: string, dto: UpsertDoctorApplicationDto) {
    const application = await this.prisma.doctorApplication.upsert({
      where: { userId },
      create: {
        userId,
        status: DoctorApplicationStatus.PENDING,
        phone: dto.phone,
        nationalId: dto.nationalId,
        location: dto.location,
        doctorType: dto.doctorType ? (dto.doctorType as DoctorType) : undefined,
        specialty: dto.specialty,
        subspecialty: dto.subspecialty,
        avatarUrl: dto.avatarUrl,
      },
      update: {
        status: DoctorApplicationStatus.PENDING,
        phone: dto.phone,
        nationalId: dto.nationalId,
        location: dto.location,
        doctorType: dto.doctorType ? (dto.doctorType as DoctorType) : undefined,
        specialty: dto.specialty,
        subspecialty: dto.subspecialty,
        avatarUrl: dto.avatarUrl,
      },
      include: { user: { include: { profile: true } } },
    });

    await this.prisma.auditEvent.create({
      data: {
        type: AuditEventType.DOCTOR_APP_SUBMITTED,
        userId,
        meta: { applicationId: application.id },
      },
    });

    return {
      id: application.id,
      status: application.status,
      phone: application.phone,
      nationalId: application.nationalId,
      location: application.location,
      doctorType: application.doctorType,
      specialty: application.specialty,
      subspecialty: application.subspecialty,
      avatarUrl: application.avatarUrl,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
    };
  }

  async getMe(userId: string) {
    const application = await this.prisma.doctorApplication.findUnique({ where: { userId } });
    if (!application) throw new NotFoundException('Doctor application not found');
    return application;
  }

  async adminList(params: { status?: DoctorApplicationStatus; page: number; limit: number }) {
    const { status, page, limit } = params;
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};

    const [items, total] = await Promise.all([
      this.prisma.doctorApplication.findMany({
        where,
        include: { user: { include: { profile: true } } },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.doctorApplication.count({ where }),
    ]);

    return {
      items: items.map((a) => ({
        id: a.id,
        status: a.status,
        fullName: a.user.profile?.fullName ?? '',
        email: a.user.email,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      })),
      total,
      page,
      limit,
    };
  }

  async adminGet(id: string) {
    const a = await this.prisma.doctorApplication.findUnique({
      where: { id },
      include: { user: { include: { profile: true } } },
    });
    if (!a) throw new NotFoundException('Doctor application not found');

    return {
      id: a.id,
      status: a.status,
      fullName: a.user.profile?.fullName ?? '',
      email: a.user.email,
      phone: a.phone,
      nationalId: a.nationalId,
      location: a.location,
      doctorType: a.doctorType,
      specialty: a.specialty,
      subspecialty: a.subspecialty,
      avatarUrl: a.avatarUrl ?? a.user.profile?.avatarUrl ?? null,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    };
  }

  async adminApprove(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const a = await tx.doctorApplication.findUnique({ where: { id } });
      if (!a) throw new NotFoundException('Doctor application not found');
      if (!a.specialty || a.specialty.trim().length < 2) {
        throw new BadRequestException('Specialty is required to approve');
      }

      await tx.doctorApplication.update({
        where: { id },
        data: { status: DoctorApplicationStatus.APPROVED },
      });

      await tx.user.update({
        where: { id: a.userId },
        data: { role: Role.DOCTOR },
      });

      await tx.doctor.upsert({
        where: { userId: a.userId },
        create: {
          userId: a.userId,
          specialty: a.specialty,
          verified: true,
        },
        update: {
          specialty: a.specialty,
          verified: true,
        },
      });

      await tx.profile.updateMany({
        where: { userId: a.userId },
        data: {
          avatarUrl: a.avatarUrl ?? undefined,
          city: a.location ?? undefined,
        },
      });

      await tx.auditEvent.create({
        data: {
          type: AuditEventType.DOCTOR_APP_APPROVED,
          userId: a.userId,
          meta: { applicationId: id },
        },
      });

      return { ok: true };
    });
  }

  async adminReject(id: string, reason?: string) {
    return this.prisma.$transaction(async (tx) => {
      const a = await tx.doctorApplication.findUnique({ where: { id } });
      if (!a) throw new NotFoundException('Doctor application not found');

      await tx.doctorApplication.update({
        where: { id },
        data: { status: DoctorApplicationStatus.REJECTED },
      });

      await tx.auditEvent.create({
        data: {
          type: AuditEventType.DOCTOR_APP_REJECTED,
          userId: a.userId,
          meta: { applicationId: id, reason },
        },
      });

      return { ok: true };
    });
  }
}

