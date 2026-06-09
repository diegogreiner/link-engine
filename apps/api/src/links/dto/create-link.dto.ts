import { IsDateString, IsOptional, IsUrl } from "class-validator";

export class CreateLinkDto {
	@IsUrl()
	originalUrl: string;

	@IsOptional()
	@IsDateString()
	expiresAt?: string;
}
