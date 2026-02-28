import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '../common/enums/role.enum';
import { AuditEventType } from '@prisma/client';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: Role.PATIENT,
        profile: {
          create: { fullName: dto.fullName },
        },
      },
      include: { profile: true },
    });

    await this.prisma.auditEvent
      .create({
        data: {
          type: AuditEventType.REGISTER_SUCCESS,
          userId: user.id,
        },
      })
      .catch(() => {});

    return this.issueTokens(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { profile: true },
    });
    if (!user || !user.isActive) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    await this.prisma.auditEvent
      .create({
        data: {
          type: AuditEventType.LOGIN_SUCCESS,
          userId: user.id,
        },
      })
      .catch(() => {});

    return this.issueTokens(user);
  }

  async refresh(refreshToken: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: { include: { profile: true } } },
    });
    if (!stored || stored.expiresAt < new Date()) {
      if (stored) await this.prisma.refreshToken.delete({ where: { id: stored.id } }).catch(() => {});
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = stored.user;
    if (!user.isActive) {
      await this.prisma.refreshToken.delete({ where: { id: stored.id } });
      throw new UnauthorizedException('User inactive');
    }

    await this.prisma.refreshToken.delete({ where: { id: stored.id } });
    return this.issueTokens(user);
  }

  private async issueTokens(user: { id: string; email: string; role: Role }) {
    const accessSecret =
      this.config.get<string>('JWT_ACCESS_SECRET') ?? this.config.get<string>('JWT_SECRET');
    const refreshSecret = this.config.get<string>('JWT_REFRESH_SECRET');
    const accessExpires =
      this.config.get<string>('JWT_ACCESS_EXPIRES_IN') ??
      this.config.get<string>('JWT_EXPIRES_IN') ??
      '15m';
    const refreshExpires =
      this.config.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d';

    const accessToken = this.jwt.sign(
      { sub: user.id, email: user.email, role: user.role, type: 'access' },
      { secret: accessSecret, expiresIn: accessExpires },
    );

    const refreshToken = this.jwt.sign(
      { sub: user.id, type: 'refresh' },
      { secret: refreshSecret, expiresIn: refreshExpires },
    );

    const expiresAt = new Date();
    const days = refreshExpires.match(/^(\d+)d$/)?.[1];
    if (days) expiresAt.setDate(expiresAt.getDate() + parseInt(days, 10));
    else expiresAt.setTime(expiresAt.getTime() + 7 * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt },
    });

    return { accessToken, refreshToken };
  }
}
