import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { MeResponseDto } from './dto/me-response.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@ApiTags('users')
@Controller()
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class UsersController {
  constructor(private users: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user with profile, doctor, subscription' })
  async me(@CurrentUser() user: JwtPayload): Promise<MeResponseDto> {
    return this.users.me(user.sub);
  }
}
