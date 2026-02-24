import { SubscriptionProvider } from '@prisma/client';
import { SubscriptionStatus } from '@prisma/client';
import { VerificationResult } from './verification-result.interface';

/**
 * Stub verifier: simulates ACTIVE subscription for 7 days.
 * Used when PAYMENTS_STUB=true (no real Apple/Google credentials).
 */
export function stubVerify(provider: 'APPLE' | 'GOOGLE', planId: string, externalRef: string): VerificationResult {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  return {
    provider: provider === 'APPLE' ? SubscriptionProvider.APPLE : SubscriptionProvider.GOOGLE,
    status: SubscriptionStatus.ACTIVE,
    planId,
    expiresAt,
    externalRef,
  };
}
