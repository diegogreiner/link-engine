import {
	Controller,
	Get,
	Param,
	Query,
	Req,
	Res,
	UseGuards,
} from "@nestjs/common";
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiForbiddenResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiTags,
	ApiTooManyRequestsResponse,
	ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import type { Request, Response } from "express";
import { JwtAuthGuard } from "src/auth/jwt/jwt-auth.guard";
import { ErrorResponseDto } from "src/common/dto/error-response.dto";
import { AnalyticsService } from "./analytics.service";
import { AnalyticsFilterDto } from "./dto/analytics.dto";
import {
	AnalyticsSummaryResponseDto,
	CountryAnalyticsResponseDto,
	DailyAnalyticsResponseDto,
	DeviceAnalyticsResponseDto,
	ReferrerAnalyticsResponseDto,
} from "./dto/analytics-response.dto";

export type AuthenticatedRequest = Request & {
	user: {
		sub: string;
		email: string;
	};
};

@ApiTags("Analytics")
@ApiBearerAuth("bearer")
@ApiUnauthorizedResponse({ type: ErrorResponseDto })
@ApiForbiddenResponse({ type: ErrorResponseDto })
@ApiTooManyRequestsResponse({ type: ErrorResponseDto })
@UseGuards(JwtAuthGuard)
@Controller("analytics")
export class AnalyticsController {
	constructor(private readonly analyticsService: AnalyticsService) {}

	@Get("summary")
	@ApiOperation({ summary: "Consultar o resumo de analytics do usuário" })
	@ApiOkResponse({ type: AnalyticsSummaryResponseDto })
	findSummary(@Req() req: AuthenticatedRequest) {
		return this.analyticsService.findSummary(req.user.sub);
	}

	@Get(":id/clicks-per-day")
	@ApiOperation({ summary: "Consultar cliques diários de um link" })
	@ApiParam({ name: "id", format: "uuid", description: "ID do link" })
	@ApiOkResponse({
		type: DailyAnalyticsResponseDto,
		isArray: true,
		headers: {
			"X-Cache": {
				description: "Informa se o resultado veio do cache",
				schema: { type: "string", enum: ["HIT", "MISS"] },
			},
		},
	})
	@ApiBadRequestResponse({ type: ErrorResponseDto })
	@ApiNotFoundResponse({ type: ErrorResponseDto })
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
	@ApiOperation({ summary: "Agrupar os cliques de um link por país" })
	@ApiParam({ name: "id", format: "uuid", description: "ID do link" })
	@ApiOkResponse({
		type: CountryAnalyticsResponseDto,
		isArray: true,
		headers: {
			"X-Cache": {
				description: "Informa se o resultado veio do cache",
				schema: { type: "string", enum: ["HIT", "MISS"] },
			},
		},
	})
	@ApiNotFoundResponse({ type: ErrorResponseDto })
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
	@ApiOperation({ summary: "Agrupar os cliques de um link por dispositivo" })
	@ApiParam({ name: "id", format: "uuid", description: "ID do link" })
	@ApiOkResponse({
		type: DeviceAnalyticsResponseDto,
		isArray: true,
		headers: {
			"X-Cache": {
				description: "Informa se o resultado veio do cache",
				schema: { type: "string", enum: ["HIT", "MISS"] },
			},
		},
	})
	@ApiNotFoundResponse({ type: ErrorResponseDto })
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
	@ApiOperation({ summary: "Agrupar os cliques de um link por origem" })
	@ApiParam({ name: "id", format: "uuid", description: "ID do link" })
	@ApiOkResponse({
		type: ReferrerAnalyticsResponseDto,
		isArray: true,
		headers: {
			"X-Cache": {
				description: "Informa se o resultado veio do cache",
				schema: { type: "string", enum: ["HIT", "MISS"] },
			},
		},
	})
	@ApiNotFoundResponse({ type: ErrorResponseDto })
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
