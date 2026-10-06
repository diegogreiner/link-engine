import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { Cache } from "@nestjs/cache-manager";
import { AnalyticsCacheService } from "./analytics-cache.service";

describe("AnalyticsCacheService", () => {
	let cache: {
		get: jest.Mock<
			(key: string) => Promise<string | undefined>
		>;
		set: jest.Mock<
			(key: string, value: string, ttl?: number) => Promise<string>
		>;
		del: jest.Mock<
			(key: string) => Promise<boolean>
		>;
	};
	let service: AnalyticsCacheService;

	beforeEach(() => {
		cache = {
			get: jest.fn<
				(key: string) => Promise<string | undefined>
			>(),
			set: jest.fn<
				(
					key: string,
					value: string,
					ttl?: number,
				) => Promise<string>
			>(),
			del: jest.fn<
				(key: string) => Promise<boolean>
			>(),
		};

		service = new AnalyticsCacheService(cache as unknown as Cache);
	});


	it("should delete the cache version for the provided user and link", async () => {
		await service.deleteAnalyticsCacheVersion("user-1", "link-1")

		expect(cache.del).toHaveBeenCalledTimes(1);
		expect(cache.del).toHaveBeenCalledWith(
			"analytics-version:user-1:link-1",
		);
	})

	it("should return the existing version without creating a new one", async () => {
		cache.get.mockResolvedValue("version-123");

		const result = await service.getCacheVersion("user-1", "link-1");

		expect(result).toBe("version-123");
		expect(cache.get).toHaveBeenCalledTimes(1);
		expect(cache.get).toHaveBeenCalledWith(
			"analytics-version:user-1:link-1",
		);
		expect(cache.set).not.toHaveBeenCalled();
	});

	it("should create and save a version when one does not exist", async () => {
		cache.get.mockResolvedValue(undefined);

		const result = await service.getCacheVersion(
			"user-1",
			"link-1",
		);

		expect(result).toEqual(expect.any(String));
		expect(result).not.toBe("");

		expect(cache.get).toHaveBeenCalledWith(
			"analytics-version:user-1:link-1",
		);

		expect(cache.set).toHaveBeenCalledTimes(1);
		expect(cache.set).toHaveBeenCalledWith(
			"analytics-version:user-1:link-1",
			result,
			0,
		);
	});

	it("should replace the version when invalidating analytics", async () => {
		await service.invalidateAnalyticsCache(
			"user-1",
			"link-1",
		);

		expect(cache.set).toHaveBeenCalledTimes(1);
		expect(cache.set).toHaveBeenCalledWith(
			"analytics-version:user-1:link-1",
			expect.any(String),
			0,
		);

		const savedVersion = cache.set.mock.calls[0][1];

		expect(savedVersion).not.toBe("");
		expect(cache.get).not.toHaveBeenCalled();
		expect(cache.del).not.toHaveBeenCalled();
	});
});
