import { ApiProperty } from '@nestjs/swagger';

class ProfileDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  fullName: string;
  @ApiProperty({ required: false })
  avatarUrl?: string;
  @ApiProperty({ required: false })
  bio?: string;
  @ApiProperty({ required: false })
  city?: string;
}

class DoctorDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  specialty: string;
  @ApiProperty()
  rating: number;
  @ApiProperty()
  yearsExp: number;
  @ApiProperty()
  verified: boolean;
  @ApiProperty({ required: false })
  links?: Record<string, unknown>;
}

class SubscriptionDto {
  @ApiProperty()
  id: string;
  @ApiProperty({ enum: ['APPLE', 'GOOGLE', 'STRIPE'] })
  provider: string;
  @ApiProperty({ enum: ['ACTIVE', 'EXPIRED', 'CANCELLED', 'PENDING'] })
  status: string;
  @ApiProperty({ required: false })
  planId?: string;
  @ApiProperty({ required: false })
  expiresAt?: string;
  @ApiProperty({ required: false })
  externalRef?: string;
}

class DoctorApplicationDto {
  @ApiProperty()
  id: string;
  @ApiProperty({ enum: ['PENDING', 'APPROVED', 'REJECTED'] })
  status: string;
  @ApiProperty({ required: false })
  phone?: string;
  @ApiProperty({ required: false })
  nationalId?: string;
  @ApiProperty({ required: false })
  location?: string;
  @ApiProperty({ required: false, enum: ['RESIDENT', 'UROLOGIST', 'OTHER'] })
  doctorType?: string;
  @ApiProperty({ required: false })
  specialty?: string;
  @ApiProperty({ required: false })
  subspecialty?: string;
  @ApiProperty({ required: false })
  avatarUrl?: string;
  @ApiProperty()
  createdAt: string;
  @ApiProperty()
  updatedAt: string;
}

class FeeSummaryLineDto {
  @ApiProperty()
  paidCents: number;
  @ApiProperty()
  pendingCents: number;
}

class FeesSummaryDto {
  @ApiProperty()
  currency: string;
  @ApiProperty()
  colegiatura: FeeSummaryLineDto;
  @ApiProperty()
  congresos: FeeSummaryLineDto;
}

export class MeResponseDto {
  @ApiProperty()
  user: { id: string; email: string; role: string };
  @ApiProperty()
  profile: ProfileDto;
  @ApiProperty({ required: false })
  doctor?: DoctorDto;
  @ApiProperty({ required: false })
  subscription?: SubscriptionDto;
  @ApiProperty({ required: false })
  doctorApplication?: DoctorApplicationDto;
  @ApiProperty()
  feesSummary: FeesSummaryDto;
}
