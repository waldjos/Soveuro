import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SubscriptionProvider } from '@prisma/client';
import { SubscriptionStatus } from '@prisma/client';
import { VerificationResult } from './verification-result.interface';

@Injectable()
export class AppleVerifier {
  constructor(private config: ConfigService) {}

  async verify(receipt: string, productId: string, planId: string): Promise<VerificationResult> {
    const sharedSecret = this.config.get<string>('APPLE_SHARED_SECRET');
    const bundleId = this.config.get<string>('APPLE_BUNDLE_ID');
    const isProduction = this.config.get<string>('NODE_ENV') === 'production';

    if (!sharedSecret || !bundleId) {
      throw new Error('Apple verification not configured: APPLE_SHARED_SECRET and APPLE_BUNDLE_ID required');
    }

    // App Store Server API: verifyReceipt (legacy) or JWT-based new API
    // https://developer.apple.com/documentation/appstorereceipts/verifyreceipt
    const url = isProduction
      ? 'https://buy.itunes.apple.com/verifyReceipt'
      : 'https://sandbox.itunes.apple.com/verifyReceipt';

    const body = {
      'receipt-data': receipt,
      password: sharedSecret,
      'exclude-old-transactions': true,
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = (await res.json()) as {
      status: number;
      latest_receipt_info?: Array<{
        product_id: string;
        expires_date_ms?: string;
        transaction_id?: string;
        cancellation_date_ms?: string;
      }>;
      receipt?: { in_app?: Array<{ product_id: string; expires_date_ms?: string; transaction_id?: string }> };
    };

    if (data.status !== 0 && data.status !== 21007) {
      if (data.status === 21007 && !isProduction) {
        return this.verify(receipt, productId, planId); // retry with sandbox
      }
      throw new Error(`Apple verifyReceipt failed: status ${data.status}`);
    }

    const receipts = data.latest_receipt_info ?? data.receipt?.in_app ?? [];
    const match = receipts.find((r) => r.product_id === productId);
    if (!match) {
      return {
        provider: SubscriptionProvider.APPLE,
        status: SubscriptionStatus.PENDING,
        planId,
        expiresAt: null,
        externalRef: null,
      };
    }

    const cancelled = 'cancellation_date_ms' in match && match.cancellation_date_ms;
    const expiresMs = match.expires_date_ms;
    const expiresAt = expiresMs ? new Date(parseInt(expiresMs, 10)) : null;
    const now = new Date();
    let status: SubscriptionStatus = SubscriptionStatus.ACTIVE;
    if (cancelled) status = SubscriptionStatus.CANCELLED;
    else if (expiresAt && expiresAt < now) status = SubscriptionStatus.EXPIRED;

    return {
      provider: SubscriptionProvider.APPLE,
      status,
      planId,
      expiresAt,
      externalRef: match.transaction_id ?? null,
    };
  }
}
