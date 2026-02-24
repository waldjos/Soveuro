import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { AppleVerifier } from './verifiers/apple.verifier';
import { GoogleVerifier } from './verifiers/google.verifier';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, AppleVerifier, GoogleVerifier],
  exports: [PaymentsService],
})
export class PaymentsModule {}
