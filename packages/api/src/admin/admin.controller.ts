import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '../common/enums/role.enum';
import { DoctorApplicationsService } from '../doctor-applications/doctor-applications.service';
import { PrismaService } from '../prisma/prisma.service';
import { FeeKind, FeeStatus, PaymentMethod } from '@prisma/client';

@ApiTags('admin')
@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
@Roles(Role.ADMIN)
export class AdminController {
  constructor(
    private doctorApps: DoctorApplicationsService,
    private prisma: PrismaService,
  ) {}

  @Get('doctor-applications')
  @ApiOperation({ summary: 'List doctor applications (admin)' })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'APPROVED', 'REJECTED'] })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async listDoctorApplications(
    @Query('status') status?: 'PENDING' | 'APPROVED' | 'REJECTED',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const p = page ? Math.max(parseInt(page, 10), 1) : 1;
    const l = limit ? Math.min(Math.max(parseInt(limit, 10), 1), 50) : 20;
    return this.doctorApps.adminList({
      status: status as any,
      page: p,
      limit: l,
    });
  }

  @Get('doctor-applications/:id')
  @ApiOperation({ summary: 'Get doctor application (admin)' })
  async getDoctorApplication(@Param('id') id: string) {
    return this.doctorApps.adminGet(id);
  }

  @Patch('doctor-applications/:id/approve')
  @ApiOperation({ summary: 'Approve doctor application (admin)' })
  async approveDoctorApplication(@Param('id') id: string) {
    return this.doctorApps.adminApprove(id);
  }

  @Patch('doctor-applications/:id/reject')
  @ApiOperation({ summary: 'Reject doctor application (admin)' })
  async rejectDoctorApplication(@Param('id') id: string, @Body() body: { reason?: string }) {
    return this.doctorApps.adminReject(id, body?.reason);
  }

  @Get('audit')
  @ApiOperation({ summary: 'Recent activity (admin)' })
  @ApiQuery({ name: 'limit', required: false })
  async audit(@Query('limit') limit?: string) {
    const l = limit ? Math.min(Math.max(parseInt(limit, 10), 1), 100) : 30;
    const items = await this.prisma.auditEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: l,
      include: { user: true },
    });
    return items.map((e) => ({
      id: e.id,
      type: e.type,
      userId: e.userId,
      userEmail: e.user?.email ?? undefined,
      createdAt: e.createdAt,
      meta: e.meta ?? undefined,
    }));
  }

  @Post('fees')
  @ApiOperation({ summary: 'Create fee record (admin)' })
  async createFee(
    @Body()
    body: {
      userId: string;
      kind: FeeKind;
      method: PaymentMethod;
      status?: FeeStatus;
      amountCents: number;
      currency?: string;
      note?: string;
    },
  ) {
    const fee = await this.prisma.fee.create({
      data: {
        userId: body.userId,
        kind: body.kind,
        method: body.method,
        status: body.status ?? FeeStatus.PENDING,
        amountCents: body.amountCents,
        currency: body.currency ?? 'USD',
        note: body.note,
      },
    });
    return { id: fee.id };
  }
}

