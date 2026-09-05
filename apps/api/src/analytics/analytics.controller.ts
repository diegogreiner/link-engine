import { Controller, Get, Param, Query, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { Request } from "express";
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
	getClicksPerDay(
		@Param("id") linkId: string,
		@Query() filter: AnalyticsFilterDto,
		@Req() req: AuthenticatedRequest,
	) {
		return this.analyticsService.getClicksPerDay(linkId, req.user.sub, filter);
	}

	@Get(":id/by-country")
	getByCountry(@Param("id") linkId: string, @Req() req: AuthenticatedRequest) {
		return this.analyticsService.getByCountry(linkId, req.user.sub);
	}

	@Get(":id/by-device")
	getByDevice(@Param("id") linkId: string, @Req() req: AuthenticatedRequest) {
		return this.analyticsService.getByDevice(linkId, req.user.sub);
	}

	@Get(":id/by-referrer")
	getByReferrer(@Param("id") linkId: string, @Req() req: AuthenticatedRequest) {
		return this.analyticsService.getByReferrer(linkId, req.user.sub);
	}
}
