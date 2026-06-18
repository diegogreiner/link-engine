import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsOptional } from "class-validator";

export class AnalyticsFilterDto {
	@ApiPropertyOptional({
		example: "2026-08-01",
		description: "Data inicial do período",
	})
	@IsOptional()
	@IsDateString()
	from?: string;

	@ApiPropertyOptional({
		example: "2026-08-31",
		description: "Data final do período",
	})
	@IsOptional()
	@IsDateString()
	to?: string;
}
