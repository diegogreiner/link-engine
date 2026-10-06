import { ApiProperty } from '@nestjs/swagger';

export class DailyAnalyticsResponseDto {
  @ApiProperty({ format: 'date', example: '2026-08-01' })
  date: string;

  @ApiProperty({ example: 12, minimum: 0 })
  clicks: number;
}

export class CountryAnalyticsResponseDto {
  @ApiProperty({ example: 'Brazil' })
  country: string;

  @ApiProperty({ example: 12, minimum: 0 })
  clicks: number;
}

export class DeviceAnalyticsResponseDto {
  @ApiProperty({ example: 'desktop' })
  deviceType: string;

  @ApiProperty({ example: 12, minimum: 0 })
  clicks: number;
}

export class ReferrerAnalyticsResponseDto {
  @ApiProperty({ example: 'https://google.com' })
  referer: string;

  @ApiProperty({ example: 12, minimum: 0 })
  clicks: number;
}

export class MostAccessedLinkResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'aB3xYz' })
  shortCode: string;

  @ApiProperty({ format: 'uri' })
  originalUrl: string;

  @ApiProperty({ example: 42, minimum: 0 })
  totalClicks: number;
}

export class AnalyticsSummaryResponseDto {
  @ApiProperty({ example: 120, minimum: 0 })
  totalClicks: number;

  @ApiProperty({ example: 8, minimum: 0 })
  totalClicksToday: number;

  @ApiProperty({
    type: 'object',
    nullable: true,
    required: ['id', 'shortCode', 'originalUrl', 'totalClicks'],
    properties: {
      id: { type: 'string', format: 'uuid' },
      shortCode: { type: 'string', example: 'aB3xYz' },
      originalUrl: { type: 'string', format: 'uri' },
      totalClicks: { type: 'number', example: 42, minimum: 0 },
    },
  })
  mostAccessedLink: MostAccessedLinkResponseDto | null;
}
