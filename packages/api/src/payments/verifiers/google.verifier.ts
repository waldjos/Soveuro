import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SubscriptionProvider } from '@prisma/client';
import { SubscriptionStatus } from '@prisma/client';
import { VerificationResult } from './verification-result.interface';

@Injectable()
export class GoogleVerifier {
  constructor(private config: ConfigService) {}

  async verify(purchaseToken: string, productId: string, planId: string): Promise<VerificationResult> {
    const packageName = this.config.get<string>('GOOGLE_PACKAGE_NAME');
    const serviceAccountJson = this.config.get<string>('GOOGLE_SERVICE_ACCOUNT_JSON');

    if (!packageName || !serviceAccountJson) {
      throw new Error(
        'Google verification not configured: GOOGLE_PACKAGE_NAME and GOOGLE_SERVICE_ACCOUNT_JSON required',
      );
    }

    // Google Play Developer API: purchases.subscriptions.get
    // https://developers.google.com/android-publisher/api-ref/rest/v3/purchases.subscriptions
    let credentials: { client_email?: string; private_key?: string };
    try {
      credentials = JSON.parse(serviceAccountJson) as { client_email?: string; private_key?: string };
    } catch {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON must be valid JSON');
    }

    const jwt = await this.createJwt(credentials);
    const accessToken = await this.getAccessToken(jwt);

    const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(packageName)}/purchases/subscriptions/${encodeURIComponent(productId)}/tokens/${encodeURIComponent(purchaseToken)}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const err = (await res.json()) as { error?: { message?: string } };
      throw new Error(err?.error?.message ?? `Google API error: ${res.status}`);
    }

    const data = (await res.json()) as {
      expiryTimeMillis?: string;
      cancelReason?: number;
      userCancellationTimeMillis?: string;
      orderId?: string;
    };

    const cancelled = (data.cancelReason !== undefined && data.cancelReason !== 0) || !!data.userCancellationTimeMillis;
    const expiresAt = data.expiryTimeMillis ? new Date(parseInt(data.expiryTimeMillis, 10)) : null;
    const now = new Date();
    let status: SubscriptionStatus = SubscriptionStatus.ACTIVE;
    if (cancelled) status = SubscriptionStatus.CANCELLED;
    else if (expiresAt && expiresAt < now) status = SubscriptionStatus.EXPIRED;

    return {
      provider: SubscriptionProvider.GOOGLE,
      status,
      planId,
      expiresAt,
      externalRef: data.orderId ?? null,
    };
  }

  private async createJwt(credentials: { client_email?: string; private_key?: string }): Promise<string> {
    const { createSign } = await import('crypto');
    const header = { alg: 'RS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: credentials.client_email,
      scope: 'https://www.googleapis.com/auth/androidpublisher',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    };
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const privateKey = credentials.private_key?.replace(/\\n/g, '\n');
    if (!privateKey) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON missing private_key');
    const signature = createSign('RSA-SHA256')
      .update(`${encodedHeader}.${encodedPayload}`)
      .sign(privateKey, 'base64url');
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  private async getAccessToken(jwt: string): Promise<string> {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    });
    if (!res.ok) throw new Error(`Google OAuth failed: ${res.status}`);
    const data = (await res.json()) as { access_token: string };
    return data.access_token;
  }
}
