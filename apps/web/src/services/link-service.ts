import { api } from "@/src/lib/api";

export type LinkDto = {
	originalUrl: string;
	expiresAt?: string;
	ga4MeasurementId?: string;
};

export type Link = {
	id: string;
	originalUrl: string;
	shortCode: string;
	clicks?: number;
	createdAt?: string;
	expiresAt?: string | null;
	ga4MeasurementId?: string | null;
};

export class LinksService {
	static async findAll(): Promise<Link[]> {
		const { data } = await api.get("/links");
		return data;
	}

	static async findOne(id: string): Promise<Link> {
		const { data } = await api.get(`/links/${id}`);
		return data;
	}

	static async create(dto: LinkDto): Promise<Link> {
		const { data } = await api.post("/links", dto);
		return data;
	}

	static async update(id: string, dto: LinkDto): Promise<Link> {
		const { data } = await api.patch(`/links/${id}`, dto);
		return data;
	}

	static async remove(id: string): Promise<void> {
		await api.delete(`/links/${id}`);
	}

	static getPublicUrl(shortCode: string) {
		return `${process.env.NEXT_PUBLIC_APP_URL}/${shortCode}`;
	}
}
