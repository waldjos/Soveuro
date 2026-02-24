import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PaymentsService } from './payments.service';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { VerifyPaymentResponseDto } from './dto/verify-payment-response.dto';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@ApiTags('payments')
@Controller('payments')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class PaymentsController {
  constructor(private payments: PaymentsService) {}

  @Post('verify')
  @ApiOperation({ summary: 'Verify in-app purchase (Apple receipt or Google purchase token)' })
  @ApiBody({ type: VerifyPaymentDto })
  async verify(
    @CurrentUser() user: JwtPayload & { id?: string },
    @Body() dto: VerifyPaymentDto,
  ): Promise<VerifyPaymentResponseDto> {
    const userId = user.id ?? user.sub;
    return this.payments.verify(userId, dto);
  }
}
