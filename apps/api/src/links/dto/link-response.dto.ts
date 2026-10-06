import { ApiProperty } from '@nestjs/swagger';

export class CreatedLinkResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uri', example: 'https://example.com/artigo' })
  originalUrl: string;

  @ApiProperty({ example: 'aB3xYz' })
  shortCode: string;

  @ApiProperty({ format: 'date-time', nullable: true })
  expiresAt: Date | null;

  @ApiProperty({ example: 'G-XXXXXXXXXX', nullable: true })
  ga4MeasurementId: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ format: 'date-time' })
  updatedAt: Date;

  @ApiProperty({ format: 'uuid' })
  userId: string;
}

export class LinkResponseDto extends CreatedLinkResponseDto {
  @ApiProperty({ example: 42, minimum: 0 })
  clicks: number;
}

export class LinkListItemResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uri', example: 'https://example.com/artigo' })
  originalUrl: string;

  @ApiProperty({ example: 'aB3xYz' })
  shortCode: string;

  @ApiProperty({ format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ format: 'date-time', nullable: true })
  expiresAt: Date | null;

  @ApiProperty({ example: 'G-XXXXXXXXXX', nullable: true })
  ga4MeasurementId: string | null;

  @ApiProperty({ example: 42, minimum: 0 })
  clicks: number;
}
