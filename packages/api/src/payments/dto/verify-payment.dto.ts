import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum PaymentProvider {
  APPLE = 'APPLE',
  GOOGLE = 'GOOGLE',
}

export class VerifyPaymentDto {
  @ApiProperty({ enum: PaymentProvider })
  @IsEnum(PaymentProvider)
  provider: PaymentProvider;

  @ApiProperty()
  @IsString()
  planId: string;

  @ApiProperty({ description: 'Apple: base64 receipt' })
  @IsOptional()
  @IsString()
  receipt?: string;

  @ApiProperty({ description: 'Google: purchase token' })
  @IsOptional()
  @IsString()
  purchaseToken?: string;

  @ApiProperty()
  @IsString()
  productId: string;
}
