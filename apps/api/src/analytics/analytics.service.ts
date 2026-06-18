import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/service";
import { AnalyticsFilterDto } from "./dto/analytics.dto";

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
				referer: true,
			},
		});

		return result.map((item) => ({
			referer: item.referer ?? "Direct",
			clicks: item._count.referer,
		}));
	}

	async getClicksPerDay(
		linkId: string,
		userId: string,
		filter: AnalyticsFilterDto,
	) {
		await this.validateOwnership(linkId, userId);

		const where = {
			linkId,
			clickedAt: {
				...(filter.from && {
					gte: new Date(filter.from),
				}),
				...(filter.to && {
					lte: new Date(filter.to),
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
				const date = click.createdAt.toISOString().split("T")[0];

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
