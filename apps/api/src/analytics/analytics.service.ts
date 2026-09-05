import { Injectable, NotFoundException } from "@nestjs/common";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { PrismaService } from "src/prisma/service";
import { AnalyticsFilterDto } from "./dto/analytics.dto";

const PRODUCT_TIME_ZONE = "America/Sao_Paulo";

@Injectable()
export class AnalyticsService {
	constructor(private readonly prisma: PrismaService) {}

	async getByCountry(linkId: string, userId: string) {
		await this.validateOwnership(linkId, userId);

		const result = await this.prisma.linkAccess.groupBy({
			by: ["country"],
			where: {
				linkId,
			},
			_count: {
				country: true,
			},
		});

		return result.map((item) => ({
			country: item.country ?? "Unknown",
			clicks: item._count.country,
		}));
	}

	async getByDevice(linkId: string, userId: string) {
		await this.validateOwnership(linkId, userId);

		const result = await this.prisma.linkAccess.groupBy({
			by: ["deviceType"],
			where: {
				linkId,
			},
			_count: {
				deviceType: true,
			},
		});

		return result.map((item) => ({
			deviceType: item.deviceType ?? "Unknown",
			clicks: item._count.deviceType,
		}));
	}

	async getByReferrer(linkId: string, userId: string) {
		await this.validateOwnership(linkId, userId);

		const result = await this.prisma.linkAccess.groupBy({
			by: ["referer"],
			where: {
				linkId,
			},
			_count: {
				_all: true,
			},
		});

		return result.map((item) => ({
			referer: item.referer ?? "Direct",
			clicks: item._count._all,
		}));
	}

	async getClicksPerDay(
		linkId: string,
		userId: string,
		filter: AnalyticsFilterDto,
	) {
		await this.validateOwnership(linkId, userId);

		const from = filter.from
			? fromZonedTime(`${filter.from}T00:00:00`, PRODUCT_TIME_ZONE)
			: undefined;
		const toExclusive = filter.to
			? fromZonedTime(
					`${this.addDaysToDateString(filter.to, 1)}T00:00:00`,
					PRODUCT_TIME_ZONE,
				)
			: undefined;

		const where = {
			linkId,
			createdAt: {
				...(from && {
					gte: from,
				}),
				...(toExclusive && {
					lt: toExclusive,
				}),
			},
		};

		const clicks = await this.prisma.linkAccess.findMany({
			where,
			select: {
				createdAt: true,
			},
			orderBy: {
				createdAt: "asc",
			},
		});

		const grouped = clicks.reduce(
			(acc, click) => {
				const date = formatInTimeZone(
					click.createdAt,
					PRODUCT_TIME_ZONE,
					"yyyy-MM-dd",
				);

				acc[date] = (acc[date] || 0) + 1;

				return acc;
			},
			{} as Record<string, number>,
		);

		return Object.entries(grouped).map(([date, clicks]) => ({
			date,
			clicks,
		}));
	}

	async findSummary(userId: string) {
		const today = formatInTimeZone(new Date(), PRODUCT_TIME_ZONE, "yyyy-MM-dd");
		const startOfToday = fromZonedTime(`${today}T00:00:00`, PRODUCT_TIME_ZONE);
		const startOfTomorrow = fromZonedTime(
			`${this.addDaysToDateString(today, 1)}T00:00:00`,
			PRODUCT_TIME_ZONE,
		);

		const [totalClicks, totalClicksToday, mostAccessedLink] = await Promise.all(
			[
				this.prisma.linkAccess.count({
					where: {
						link: { userId },
					},
				}),
				this.prisma.linkAccess.count({
					where: {
						link: { userId },
						createdAt: {
							gte: startOfToday,
							lt: startOfTomorrow,
						},
					},
				}),
				this.prisma.link.findFirst({
					where: { userId },
					select: {
						id: true,
						shortCode: true,
						originalUrl: true,
						_count: {
							select: { linkAccesses: true },
						},
					},
					orderBy: {
						linkAccesses: { _count: "desc" },
					},
				}),
			],
		);

		return {
			totalClicks,
			totalClicksToday,
			mostAccessedLink: mostAccessedLink
				? {
						id: mostAccessedLink.id,
						shortCode: mostAccessedLink.shortCode,
						originalUrl: mostAccessedLink.originalUrl,
						totalClicks: mostAccessedLink._count.linkAccesses,
					}
				: null,
		};
	}

	private addDaysToDateString(dateString: string, days: number): string {
		const [year, month, day] = dateString.split("-").map(Number);
		const date = new Date(Date.UTC(year, month - 1, day + days));

		return date.toISOString().slice(0, 10);
	}

	private async validateOwnership(
		linkId: string,
		userId: string,
	): Promise<void> {
		const link = await this.prisma.link.findFirst({
			where: {
				id: linkId,
				userId,
			},
		});

		if (!link) {
			throw new NotFoundException("Link não encontrado");
		}
	}
}
