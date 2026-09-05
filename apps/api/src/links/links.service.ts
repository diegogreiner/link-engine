import { GoneException, Injectable, NotFoundException } from "@nestjs/common";
import { nanoid } from "nanoid";
import { PrismaService } from "src/prisma/service";
import { UAParser } from "ua-parser-js";
import { CreateLinkDto } from "./dto/create-link.dto";
import { UpdateLinkDto } from "./dto/update-link.dto";

@Injectable()
export class LinksService {
	constructor(private prisma: PrismaService) {}

	async create(dto: CreateLinkDto, userId: string) {
		const shortCode = await this.generateShortCode();

		return this.prisma.link.create({
			data: {
				userId,
				shortCode,
				originalUrl: dto.originalUrl,
				expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
				ga4MeasurementId: dto.ga4MeasurementId || null,
			},
		});
	}

	async update(id: string, dto: UpdateLinkDto, userId: string) {
		const result = await this.prisma.link.updateMany({
			where: {
				id,
				userId,
			},
			data: {
				...dto,
				expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
				ga4MeasurementId: dto.ga4MeasurementId ?? undefined,
			},
		});

		if (result.count === 0) {
			throw new NotFoundException("Link não encontrado");
		}

		return this.findOne(id, userId);
	}

	async remove(id: string, userId: string) {
		const result = await this.prisma.link.deleteMany({
			where: {
				id,
				userId,
			},
		});

		if (result.count === 0) {
			throw new NotFoundException("Link não encontrado");
		}

		return { message: "Link excluído com sucesso" };
	}

	async findAll(userId: string) {
		const links = await this.prisma.link.findMany({
			where: {
				userId,
			},
			include: {
				_count: {
					select: {
						linkAccesses: true,
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		return links.map((i) => ({
			id: i.id,
			originalUrl: i.originalUrl,
			shortCode: i.shortCode,
			createdAt: i.createdAt,
			expiresAt: i.expiresAt,
			ga4MeasurementId: i.ga4MeasurementId,
			clicks: i._count.linkAccesses,
		}));
	}

	async findOne(id: string, userId: string) {
		const link = await this.prisma.link.findFirst({
			where: {
				id,
				userId,
			},
			include: {
				_count: {
					select: {
						linkAccesses: true,
					},
				},
			},
		});

		if (!link) {
			throw new NotFoundException("Nenhum link encontrado");
		}

		const { _count, ...linkData } = link;

		return {
			...linkData,
			clicks: _count.linkAccesses,
		};
	}

	async findByShortCode(shortCode: string) {
		const link = await this.prisma.link.findUnique({
			where: {
				shortCode,
			},
		});

		if (!link) {
			throw new NotFoundException("Link não encontrado");
		}

		if (link.expiresAt && link.expiresAt < new Date()) {
			throw new GoneException("Link expirado");
		}

		return link;
	}

	async registerAccess(
		linkId: string,
		data: { ip: string; userAgent: string; referer: string },
	) {
		try {
			const parser = new UAParser(data?.userAgent);

			const browser = parser.getBrowser();
			const os = parser.getOS();
			const device = parser.getDevice();

			let country: string | null = null;
			let city: string | null = null;

			if (data.ip) {
				try {
					const response = await fetch(
						`http://ip-api.com/json/${data.ip}?fields=status,country,city`,
					);

					const geo = await response.json();

					if (geo.status === "success") {
						country = geo.country;
						city = geo.city;
					}
				} catch {}
			}

			await this.prisma.linkAccess.create({
				data: {
					linkId,
					country,
					city,
					ip: data.ip,
					referer: data.referer,
					browser: browser.name,
					browserVersion: browser.version,
					os: os.name,
					osVersion: os.version,
					deviceType: device.type ?? "desktop",
				},
			});
		} catch (error) {
			console.error("Erro ao registrar analytics", error);
		}
	}

	private async generateShortCode() {
		let shortCode: string;
		let exists: boolean;

		do {
			shortCode = nanoid(6);

			const link = await this.prisma.link.findUnique({
				where: {
					shortCode,
				},
			});

			exists = !!link;
		} while (exists);

		return shortCode;
	}
}
