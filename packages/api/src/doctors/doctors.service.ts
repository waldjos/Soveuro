import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DoctorListResponseDto, DoctorDetailResponseDto } from './dto/doctor-response.dto';

interface ListOptions {
  page: number;
  limit: number;
  specialty?: string;
  city?: string;
}

@Injectable()
export class DoctorsService {
  constructor(private prisma: PrismaService) {}

  async list(opts: ListOptions): Promise<DoctorListResponseDto> {
    const { page, limit, specialty, city } = opts;
    const skip = (page - 1) * limit;

    const where: { specialty?: string; user?: { profile?: { city?: string } } } = {};
    if (specialty) where.specialty = specialty;
    if (city) where.user = { profile: { city } };

    const [items, total] = await Promise.all([
      this.prisma.doctor.findMany({
        where,
        include: { user: { include: { profile: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.doctor.count({ where }),
    ]);

    return {
      items: items.map((d) => ({
        id: d.id,
        fullName: d.user.profile?.fullName ?? '',
        avatarUrl: d.user.profile?.avatarUrl ?? undefined,
        specialty: d.specialty,
        rating: d.rating,
        yearsExp: d.yearsExp,
        verified: d.verified,
        city: d.user.profile?.city ?? undefined,
      })),
      total,
      page,
      limit,
    };
  }

  async getById(id: string): Promise<DoctorDetailResponseDto> {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
      include: { user: { include: { profile: true } } },
    });
    if (!doctor) throw new NotFoundException('Doctor not found');

    const profile = doctor.user.profile;
    return {
      id: doctor.id,
      fullName: profile?.fullName ?? '',
      avatarUrl: profile?.avatarUrl ?? undefined,
      specialty: doctor.specialty,
      rating: doctor.rating,
      yearsExp: doctor.yearsExp,
      verified: doctor.verified,
      city: profile?.city ?? undefined,
      bio: profile?.bio ?? undefined,
      links: (doctor.links as Record<string, unknown>) ?? undefined,
    };
  }
}
