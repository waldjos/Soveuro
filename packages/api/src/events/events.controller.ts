import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { EventListResponseDto } from './dto/event-response.dto';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private events: EventsService) {}

  @Get()
  @ApiOperation({ summary: 'List events (public)' })
  async list(): Promise<EventListResponseDto> {
    return this.events.list();
  }
}
