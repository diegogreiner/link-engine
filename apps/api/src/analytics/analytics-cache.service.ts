import { randomUUID } from "node:crypto";
import { CACHE_MANAGER, Cache } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class AnalyticsCacheService {
	constructor(
		@Inject(CACHE_MANAGER)
		private readonly cacheManager: Cache,
	) {}

	async getCacheVersion(userId: string, linkId: string): Promise<string> {
		const versionKey = `analytics-version:${userId}:${linkId}`;

		const cachedVersion = await this.cacheManager.get<string>(versionKey);

		if (cachedVersion !== undefined) {
			return cachedVersion;
		}

		const initialVersion = randomUUID();

		await this.cacheManager.set(versionKey, initialVersion, 0);

		return initialVersion;
	}

	async invalidateAnalyticsCache(
		userId: string,
		linkId: string,
	): Promise<void> {
		const versionKey = `analytics-version:${userId}:${linkId}`;

		const newVersion = randomUUID();

		await this.cacheManager.set(versionKey, newVersion, 0);
	}

	async deleteAnalyticsCacheVersion(
		userId: string,
		linkId: string,
	): Promise<void> {
		const versionKey = `analytics-version:${userId}:${linkId}`;

		await this.cacheManager.del(versionKey);
	}
}
