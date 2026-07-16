import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsOptional, IsString, IsUrl } from "class-validator";

export class CreateLinkDto {
  @ApiProperty({ example: "https://google.com" })
  @IsUrl()
  originalUrl: string;

  @ApiProperty({ example: "2025-12-31", required: false })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiProperty({ example: "G-XXXXXXXXXX", required: false })
  @IsOptional()
  @IsString()
  ga4MeasurementId?: string;
}
