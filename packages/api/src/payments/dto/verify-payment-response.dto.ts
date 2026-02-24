import { ApiProperty } from '@nestjs/swagger';

class SubscriptionResponseDto {
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

export class VerifyPaymentResponseDto {
  @ApiProperty({ type: SubscriptionResponseDto })
  subscription: SubscriptionResponseDto;
}
