import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MeResponseDto } from './dto/me-response.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async me(userId: string): Promise<MeResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true, doctor: true, subscription: true },
    });
    if (!user) throw new NotFoundException('User not found');
    if (!user.profile) throw new NotFoundException('Profile not found');

    return {
      user: { id: user.id, email: user.email, role: user.role },
      profile: {
        id: user.profile.id,
        fullName: user.profile.fullName,
        avatarUrl: user.profile.avatarUrl ?? undefined,
        bio: user.profile.bio ?? undefined,
        city: user.profile.city ?? undefined,
      },
      doctor: user.doctor
        ? {
            id: user.doctor.id,
            specialty: user.doctor.specialty,
            rating: user.doctor.rating,
            yearsExp: user.doctor.yearsExp,
            verified: user.doctor.verified,
            links: (user.doctor.links as Record<string, unknown>) ?? undefined,
          }
        : undefined,
      subscription: user.subscription
        ? {
            id: user.subscription.id,
            provider: user.subscription.provider,
            status: user.subscription.status,
            planId: user.subscription.planId ?? undefined,
            expiresAt: user.subscription.expiresAt?.toISOString(),
            externalRef: user.subscription.externalRef ?? undefined,
          }
        : undefined,
    };
  }
}
