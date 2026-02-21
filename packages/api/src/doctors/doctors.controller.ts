import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { DoctorsService } from './doctors.service';
import { DoctorListResponseDto, DoctorDetailResponseDto } from './dto/doctor-response.dto';

@ApiTags('doctors')
@Controller('doctors')
export class DoctorsController {
  constructor(private doctors: DoctorsService) {}

  @Get()
  @ApiOperation({ summary: 'List doctors (public, paginated)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'specialty', required: false })
  @ApiQuery({ name: 'city', required: false })
  async list(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('specialty') specialty?: string,
    @Query('city') city?: string,
  ): Promise<DoctorListResponseDto> {
    return this.doctors.list({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? Math.min(parseInt(limit, 10), 50) : 20,
      specialty: specialty || undefined,
      city: city || undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get doctor by id (public)' })
  async getById(@Param('id') id: string): Promise<DoctorDetailResponseDto> {
    return this.doctors.getById(id);
  }
}
