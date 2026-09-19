import {
	Controller,
	Get,
	Param,
	Query,
	Req,
	Res,
	UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import type { Request, Response } from "express";
import { JwtAuthGuard } from "src/auth/jwt/jwt-auth.guard";
import { AnalyticsService } from "./analytics.service";
import { AnalyticsFilterDto } from "./dto/analytics.dto";

type AuthenticatedRequest = Request & {
	user: {
		sub: string;
		email: string;
	};
};

@ApiTags("Analytics")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("analytics")
export class AnalyticsController {
	constructor(private readonly analyticsService: AnalyticsService) {}

	@Get("summary")
	findSummary(@Req() req: AuthenticatedRequest) {
		return this.analyticsService.findSummary(req.user.sub);
	}

	@Get(":id/clicks-per-day")
	async getClicksPerDay(
		@Param("id") linkId: string,
		@Query() filter: AnalyticsFilterDto,
		@Req() req: AuthenticatedRequest,
		@Res({ passthrough: true }) res: Response,
	) {
		const result = await this.analyticsService.getClicksPerDay(
			linkId,
			req.user.sub,
			filter,
		);

		res.setHeader("X-Cache", result.cacheStatus);

		return result.data;
	}

	@Get(":id/by-country")
	async getByCountry(
		@Param("id") linkId: string,
		@Req() req: AuthenticatedRequest,
		@Res({ passthrough: true }) res: Response,
	) {
		const result = await this.analyticsService.getByCountry(
			linkId,
			req.user.sub,
		);

		res.setHeader("X-Cache", result.cacheStatus);

		return result.data;
	}

	@Get(":id/by-device")
	async getByDevice(
		@Param("id") linkId: string,
		@Req() req: AuthenticatedRequest,
		@Res({ passthrough: true }) res: Response,
	) {
		const result = await this.analyticsService.getByDevice(
			linkId,
			req.user.sub,
		);

		res.setHeader("X-Cache", result.cacheStatus);

		return result.data;
	}

	@Get(":id/by-referrer")
	async getByReferrer(
		@Param("id") linkId: string,
		@Req() req: AuthenticatedRequest,
		@Res({ passthrough: true }) res: Response,
	) {
		const result = await this.analyticsService.getByReferrer(
			linkId,
			req.user.sub,
		);

		res.setHeader("X-Cache", result.cacheStatus);

		return result.data;
	}
}