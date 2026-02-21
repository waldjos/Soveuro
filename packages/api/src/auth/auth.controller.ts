import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { TokensResponseDto } from './dto/tokens-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new patient' })
  async register(@Body() dto: RegisterDto): Promise<TokensResponseDto> {
    return this.auth.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login' })
  async login(@Body() dto: LoginDto): Promise<TokensResponseDto> {
    return this.auth.login(dto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() dto: RefreshDto): Promise<TokensResponseDto> {
    return this.auth.refresh(dto.refreshToken);
  }
}
