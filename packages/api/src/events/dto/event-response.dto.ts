import { ApiProperty } from '@nestjs/swagger';

export class EventItemDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  title: string;
  @ApiProperty({ required: false })
  description?: string;
  @ApiProperty()
  startsAt: string;
  @ApiProperty({ required: false })
  imageUrl?: string;
}

export class EventListResponseDto {
  @ApiProperty({ type: [EventItemDto] })
  items: EventItemDto[];
}
