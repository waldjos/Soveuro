import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpsertDoctorApplicationDto {
  @ApiPropertyOptional({ example: '+58 414 0000000' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiPropertyOptional({ example: 'V-12345678' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  nationalId?: string;

  @ApiPropertyOptional({ example: 'Caracas, Venezuela' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  location?: string;

  @ApiPropertyOptional({ example: 'RESIDENT', enum: ['RESIDENT', 'UROLOGIST', 'OTHER'] })
  @IsOptional()
  @IsIn(['RESIDENT', 'UROLOGIST', 'OTHER'])
  doctorType?: 'RESIDENT' | 'UROLOGIST' | 'OTHER';

  @ApiPropertyOptional({ example: 'Urología' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  specialty?: string;

  @ApiPropertyOptional({ example: 'Uro-oncología' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  subspecialty?: string;

  @ApiPropertyOptional({ example: 'https://.../uploads/avatar.png' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatarUrl?: string;
}

