import { SubscriptionProvider } from '@prisma/client';
import { SubscriptionStatus } from '@prisma/client';

export interface VerificationResult {
  status: SubscriptionStatus;
  planId: string;
  expiresAt: Date | null;
  externalRef: string | null;
  provider: SubscriptionProvider;
}
