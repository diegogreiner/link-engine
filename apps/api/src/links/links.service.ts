import { GoneException, Injectable, NotFoundException } from "@nestjs/common";
import { nanoid } from "nanoid";
import { PrismaService } from "src/prisma/service";
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
			},
		});
	}

	async update(id: string, dto: UpdateLinkDto) {
		return this.prisma.link.update({
			where: {
				id,
			},
			data: {
				...dto,
				expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
			},
		});
	}

	async remove(id: string) {
		return this.prisma.link.delete({
			where: {
				id,
			},
		});
	}

	async findAll() {
		const links = await this.prisma.link.findMany({
			orderBy: {
				createdAt: "desc",
			},
		});

		return links.map((i) => ({
			originalUrl: i.originalUrl,
			shortCode: i.shortCode,
		}));
	}

	async findOne(id: string) {
		try {
			const link = await this.prisma.link.findUnique({
				where: {
					id,
				},
			});

			const { userId } = link;

			return link;
		} catch (error) {
			throw new NotFoundException("Nenhum link encontrado");
		}
	}

	async findByShortCode(shortCode: string) {
		const link = await this.prisma.link.findUnique({
			where: {
				shortCode,
			},
		});

		if (link.expiresAt && link.expiresAt < new Date()) {
			throw new GoneException("Link expirado");
		}

		if (!link) {
			throw new NotFoundException("Link não encontrado");
		}

		return link;
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
