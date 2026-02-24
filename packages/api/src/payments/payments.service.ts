import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionProvider } from '@prisma/client';
import { SubscriptionStatus } from '@prisma/client';
import { VerifyPaymentDto, PaymentProvider } from './dto/verify-payment.dto';
import { AppleVerifier } from './verifiers/apple.verifier';
import { GoogleVerifier } from './verifiers/google.verifier';
import { stubVerify } from './verifiers/stub.verifier';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private appleVerifier: AppleVerifier,
    private googleVerifier: GoogleVerifier,
  ) {}

  async verify(userId: string, dto: VerifyPaymentDto) {
    const useStub = this.config.get<string>('PAYMENTS_STUB') === 'true';

    if (dto.provider === PaymentProvider.APPLE) {
      if (!dto.receipt) throw new BadRequestException('receipt is required for Apple');
    } else if (dto.provider === PaymentProvider.GOOGLE) {
      if (!dto.purchaseToken) throw new BadRequestException('purchaseToken is required for Google');
    } else {
      throw new BadRequestException('Invalid provider');
    }

    let result;
    if (useStub) {
      const externalRef = dto.receipt ?? dto.purchaseToken ?? 'stub-' + Date.now();
      result = stubVerify(dto.provider, dto.planId, externalRef);
    } else if (dto.provider === PaymentProvider.APPLE) {
      result = await this.appleVerifier.verify(dto.receipt!, dto.productId, dto.planId);
    } else {
      result = await this.googleVerifier.verify(dto.purchaseToken!, dto.productId, dto.planId);
    }

    const subscription = await this.upsertSubscription(userId, {
      provider: result.provider as SubscriptionProvider,
      status: result.status,
      planId: result.planId,
      expiresAt: result.expiresAt,
      externalRef: result.externalRef,
    });

    return {
      subscription: {
        provider: subscription.provider,
        status: subscription.status,
        planId: subscription.planId ?? undefined,
        expiresAt: subscription.expiresAt?.toISOString(),
        externalRef: subscription.externalRef ?? undefined,
      },
    };
  }

  private async upsertSubscription(
    userId: string,
    data: {
      provider: SubscriptionProvider;
      status: SubscriptionStatus;
      planId: string;
      expiresAt: Date | null;
      externalRef: string | null;
    },
  ) {
    return this.prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        provider: data.provider,
        status: data.status,
        planId: data.planId,
        expiresAt: data.expiresAt,
        externalRef: data.externalRef,
      },
      update: {
        provider: data.provider,
        status: data.status,
        planId: data.planId,
        expiresAt: data.expiresAt,
        externalRef: data.externalRef,
      },
    });
  }
}
