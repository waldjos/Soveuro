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
}
