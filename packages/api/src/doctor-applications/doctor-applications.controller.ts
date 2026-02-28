import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { DoctorApplicationsService } from './doctor-applications.service';
import { UpsertDoctorApplicationDto } from './dto/upsert-doctor-application.dto';

@ApiTags('doctor-applications')
@Controller('doctor-applications')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class DoctorApplicationsController {
  constructor(private svc: DoctorApplicationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create or update my doctor application (PENDING)' })
  async upsert(@CurrentUser() user: JwtPayload & { id?: string }, @Body() dto: UpsertDoctorApplicationDto) {
    const userId = user.id ?? user.sub;
    return this.svc.upsertForUser(userId, dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get my doctor application' })
  async me(@CurrentUser() user: JwtPayload & { id?: string }) {
    const userId = user.id ?? user.sub;
    return this.svc.getMe(userId);
  }
}

