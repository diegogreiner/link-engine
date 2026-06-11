import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsOptional, IsUrl } from "class-validator";

export class CreateLinkDto {
  @ApiProperty({ example: "https://google.com" })
  @IsUrl()
  originalUrl: string;

  @ApiProperty({ example: "2025-12-31", required: false })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}