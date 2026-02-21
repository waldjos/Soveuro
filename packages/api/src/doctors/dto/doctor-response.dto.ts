import { ApiProperty } from '@nestjs/swagger';

export class DoctorItemDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  fullName: string;
  @ApiProperty({ required: false })
  avatarUrl?: string;
  @ApiProperty()
  specialty: string;
  @ApiProperty()
  rating: number;
  @ApiProperty()
  yearsExp: number;
  @ApiProperty()
  verified: boolean;
  @ApiProperty({ required: false })
  city?: string;
}

export class DoctorListResponseDto {
  @ApiProperty({ type: [DoctorItemDto] })
  items: DoctorItemDto[];
  @ApiProperty()
  total: number;
  @ApiProperty()
  page: number;
  @ApiProperty()
  limit: number;
}

export class DoctorDetailResponseDto extends DoctorItemDto {
  @ApiProperty({ required: false })
  bio?: string;
  @ApiProperty({ required: false })
  links?: Record<string, unknown>;
}
