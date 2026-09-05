import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsOptional, Matches } from "class-validator";

export class AnalyticsFilterDto {
	@ApiPropertyOptional({
		example: "2026-08-01",
		description:
			"Primeiro dia do período, inclusivo, no fuso America/Sao_Paulo",
	})
	@IsOptional()
	@IsDateString()
	@Matches(/^\d{4}-\d{2}-\d{2}$/)
	from?: string;

	@ApiPropertyOptional({
		example: "2026-08-31",
		description: "Último dia do período, inclusivo, no fuso America/Sao_Paulo",
	})
	@IsOptional()
	@IsDateString()
	@Matches(/^\d{4}-\d{2}-\d{2}$/)
	to?: string;
}
