import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventListResponseDto } from './dto/event-response.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async list(): Promise<EventListResponseDto> {
    const items = await this.prisma.event.findMany({
      orderBy: { startsAt: 'desc' },
    });
    return {
      items: items.map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description ?? undefined,
        startsAt: e.startsAt.toISOString(),
        imageUrl: e.imageUrl ?? undefined,
      })),
    };
  }
}
