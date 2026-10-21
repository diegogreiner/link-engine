import { ExecutionContext, Injectable } from "@nestjs/common";
import {
	ThrottlerGuard,
	ThrottlerLimitDetail,
	ThrottlerStorage,
	ThrottlerStorageService,
} from "@nestjs/throttler";
import { ThrottlerStorageRecord } from "@nestjs/throttler/dist/throttler-storage-record.interface";

type DestroyableStorage = ThrottlerStorage & {
	onModuleDestroy?: () => void | Promise<void>;
};

export class ResilientThrottlerStorage implements ThrottlerStorage {
	private readonly fallback = new ThrottlerStorageService();
	private redisUnavailableUntil = 0;

	constructor(private readonly primary: ThrottlerStorage) {}

	async increment(
		key: string,
		ttl: number,
		limit: number,
		blockDuration: number,
		throttlerName: string,
	): Promise<ThrottlerStorageRecord> {
		const args = [key, ttl, limit, blockDuration, throttlerName] as const;

		if (Date.now() < this.redisUnavailableUntil) {
			return this.fallback.increment(...args);
		}

		try {
			return await this.primary.increment(...args);
		} catch {
			this.redisUnavailableUntil = Date.now() + 30_000;
			return this.fallback.increment(...args);
		}
	}

	async onModuleDestroy(): Promise<void> {
		this.fallback.onApplicationShutdown();

		await (this.primary as DestroyableStorage).onModuleDestroy?.();
	}
}

@Injectable()
export class RateLimitGuard extends ThrottlerGuard {
	protected override async throwThrottlingException(
		context: ExecutionContext,
		detail: ThrottlerLimitDetail,
	): Promise<void> {
		const { res } = this.getRequestResponse(context);

		this.setResponseHeader(res, "Retry-After", detail.timeToBlockExpire);
		this.setResponseHeader(res, "X-RateLimit-Limit", detail.limit);
		this.setResponseHeader(res, "X-RateLimit-Remaining", 0);
		this.setResponseHeader(res, "X-RateLimit-Reset", detail.timeToExpire);

		await super.throwThrottlingException(context, detail);
	}
}
