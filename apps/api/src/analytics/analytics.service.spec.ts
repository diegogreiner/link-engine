import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { Cache } from "@nestjs/cache-manager";
import type { PrismaService } from "src/prisma/service";
import {
	ANALYTICS_CACHE_TTL,
	DAILY_CACHE_TTL,
} from "./analytics.constants";
import { AnalyticsService } from "./analytics.service";
import type { AnalyticsCacheService } from "./analytics-cache.service";
import type {
	CountryAnalytics,
	DailyAnalytics,
	DeviceAnalytics,
	ReferrerAnalytics,
} from "./cache-result.types";

type IAnalyticsServiceTypes = {
	prisma: {
		linkAccess: (args: unknown) => Promise<unknown>;
		findFirst: (args: unknown) => Promise<{ id: string } | unknown>;
		findMany: (args: unknown) => Promise<unknown>;
		count: (args: unknown) => Promise<number>;
	};
	cache: {
		get: (key: string) => Promise<unknown | undefined>;
		set: (
			key: string,
			value: unknown,
			ttl?: number,
		) => Promise<unknown | undefined>;
	};
	analyticsCache: {
		getCacheVersion: (userId: string, linkId: string) => Promise<string>;
	};
};

describe("AnalyticsService", () => {
	let prisma: {
		linkAccess: {
			groupBy: jest.Mock<IAnalyticsServiceTypes["prisma"]["linkAccess"]>;
			findMany: jest.Mock<IAnalyticsServiceTypes["prisma"]["findMany"]>;
			count: jest.Mock<IAnalyticsServiceTypes["prisma"]["count"]>;
		};
		link: {
			findFirst: jest.Mock<IAnalyticsServiceTypes["prisma"]["findFirst"]>;
		};
	};

	let cache: {
		get: jest.Mock<IAnalyticsServiceTypes["cache"]["get"]>;
		set: jest.Mock<IAnalyticsServiceTypes["cache"]["set"]>;
	};

	let analyticsCache: {
		getCacheVersion: jest.Mock<
			IAnalyticsServiceTypes["analyticsCache"]["getCacheVersion"]
		>;
	};

	let service: AnalyticsService;

	beforeEach(() => {
		cache = {
			get: jest.fn<IAnalyticsServiceTypes["cache"]["get"]>(),
			set: jest.fn<IAnalyticsServiceTypes["cache"]["set"]>(),
		};
		prisma = {
			linkAccess: {
				groupBy: jest.fn<IAnalyticsServiceTypes["prisma"]["linkAccess"]>(),
				findMany: jest.fn<IAnalyticsServiceTypes["prisma"]["findMany"]>(),
				count: jest.fn<IAnalyticsServiceTypes["prisma"]["count"]>(),
			},
			link: {
				findFirst: jest.fn<IAnalyticsServiceTypes["prisma"]["findFirst"]>(),
			},
		};
		analyticsCache = {
			getCacheVersion:
				jest.fn<IAnalyticsServiceTypes["analyticsCache"]["getCacheVersion"]>(),
		};

		service = new AnalyticsService(
			prisma as unknown as PrismaService,
			cache as unknown as Cache,
			analyticsCache as unknown as AnalyticsCacheService,
		);
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	const version = "1";
	const userId = "user-1";
	const linkId = "link-1";
	const ownedLink = { id: linkId, userId };

	const buildCacheKey = (dimension: "country" | "device" | "referrer") =>
		`analytics:${userId}:${linkId}:v${version}:${dimension}`;
	const buildDailyCacheKey = (from: string, to: string) =>
		`analytics:${userId}:${linkId}:v${version}:daily:${from}:${to}`;

	it("getByCountry should return a cache HIT without querying Prisma", async () => {
		const cachedData: CountryAnalytics[] = [
			{
				country: "Brasil",
				clicks: 12,
			},
		];
		const cacheKey = buildCacheKey("country");

		analyticsCache.getCacheVersion.mockResolvedValue(version);

		cache.get.mockResolvedValue(cachedData);

		const result = await service.getByCountry(linkId, userId);

		expect(analyticsCache.getCacheVersion).toHaveBeenCalledWith(userId, linkId);
		expect(cache.get).toHaveBeenCalledWith(cacheKey);

		expect(result).toEqual({
			data: cachedData,
			cacheStatus: "HIT",
		});

		expect(prisma.linkAccess.groupBy).not.toHaveBeenCalled();
		expect(prisma.link.findFirst).not.toHaveBeenCalled();
		expect(cache.set).not.toHaveBeenCalled();
	});

	it("getByCountry should return a cache MISS, query Prisma, and cache the result", async () => {
		const prismaResult = [
			{
				country: "Brasil",
				_count: {
					country: 12,
				},
			},
		];

		const expectedData: CountryAnalytics[] = [
			{
				country: "Brasil",
				clicks: 12,
			},
		];
		const cacheKey = buildCacheKey("country");

		analyticsCache.getCacheVersion.mockResolvedValue(version);

		cache.get.mockResolvedValue(undefined);

		prisma.link.findFirst.mockResolvedValue(ownedLink);

		prisma.linkAccess.groupBy.mockResolvedValue(prismaResult);

		const result = await service.getByCountry(linkId, userId);

		expect(analyticsCache.getCacheVersion).toHaveBeenCalledWith(userId, linkId);

		expect(cache.get).toHaveBeenCalledWith(cacheKey);

		expect(prisma.link.findFirst).toHaveBeenCalledWith({
			where: {
				id: linkId,
				userId,
			},
		});

		expect(prisma.linkAccess.groupBy).toHaveBeenCalledWith({
			by: ["country"],
			where: {
				linkId,
			},
			_count: {
				country: true,
			},
		});

		expect(cache.set).toHaveBeenCalledWith(
			cacheKey,
			expectedData,
			ANALYTICS_CACHE_TTL,
		);

		expect(result).toEqual({
			data: expectedData,
			cacheStatus: "MISS",
		});
	});

	it("getByDevice should return a cache HIT without querying Prisma", async () => {
		const cachedData: DeviceAnalytics[] = [
			{
				clicks: 12,
				deviceType: "smartphone",
			},
		];

		const cacheKey = buildCacheKey("device");

		analyticsCache.getCacheVersion.mockResolvedValue(version);

		cache.get.mockResolvedValue(cachedData);

		const result = await service.getByDevice(linkId, userId);

		expect(analyticsCache.getCacheVersion).toHaveBeenCalledWith(userId, linkId);
		expect(cache.get).toHaveBeenCalledWith(cacheKey);
		expect(result).toEqual({
			data: cachedData,
			cacheStatus: "HIT",
		});
		expect(prisma.linkAccess.groupBy).not.toHaveBeenCalled();
		expect(prisma.link.findFirst).not.toHaveBeenCalled();
		expect(cache.set).not.toHaveBeenCalled();
	});

	it("getByDevice should return a cache MISS, query Prisma, and cache the result", async () => {
		const expectedData: DeviceAnalytics[] = [
			{
				clicks: 12,
				deviceType: "smartphone",
			},
		];

		const prismaResult = [
			{
				deviceType: "smartphone",
				_count: {
					deviceType: 12,
				},
			},
		];

		const cacheKey = buildCacheKey("device");

		analyticsCache.getCacheVersion.mockResolvedValue(version);

		cache.get.mockResolvedValue(undefined);

		prisma.link.findFirst.mockResolvedValue(ownedLink);

		prisma.linkAccess.groupBy.mockResolvedValue(prismaResult);

		const result = await service.getByDevice(linkId, userId);

		expect(analyticsCache.getCacheVersion).toHaveBeenCalledWith(userId, linkId);

		expect(cache.get).toHaveBeenCalledWith(cacheKey);

		expect(cache.set).toHaveBeenCalledWith(
			cacheKey,
			expectedData,
			ANALYTICS_CACHE_TTL,
		);

		expect(prisma.link.findFirst).toHaveBeenCalledWith({
			where: {
				id: linkId,
				userId,
			},
		});

		expect(prisma.linkAccess.groupBy).toHaveBeenCalledWith({
			by: ["deviceType"],
			where: {
				linkId,
			},
			_count: {
				deviceType: true,
			},
		});

		expect(result).toEqual({
			data: expectedData,
			cacheStatus: "MISS",
		});
	});

	it("getByReferrer should return a cache HIT without querying Prisma", async () => {
		const cachedData: ReferrerAnalytics[] = [
			{
				referer: "google.com",
				clicks: 12,
			},
		];
		const cacheKey = buildCacheKey("referrer");

		analyticsCache.getCacheVersion.mockResolvedValue(version);
		cache.get.mockResolvedValue(cachedData);

		const result = await service.getByReferrer(linkId, userId);

		expect(analyticsCache.getCacheVersion).toHaveBeenCalledWith(userId, linkId);
		expect(cache.get).toHaveBeenCalledWith(cacheKey);
		expect(result).toEqual({
			data: cachedData,
			cacheStatus: "HIT",
		});
		expect(prisma.linkAccess.groupBy).not.toHaveBeenCalled();
		expect(prisma.link.findFirst).not.toHaveBeenCalled();
		expect(cache.set).not.toHaveBeenCalled();
	});

	it("getByReferrer should return a cache MISS, query Prisma, and cache the result", async () => {
		const prismaResult = [
			{
				referer: "google.com",
				_count: {
					_all: 12,
				},
			},
		];
		const expectedData: ReferrerAnalytics[] = [
			{
				referer: "google.com",
				clicks: 12,
			},
		];
		const cacheKey = buildCacheKey("referrer");

		analyticsCache.getCacheVersion.mockResolvedValue(version);
		cache.get.mockResolvedValue(undefined);
		prisma.link.findFirst.mockResolvedValue(ownedLink);
		prisma.linkAccess.groupBy.mockResolvedValue(prismaResult);

		const result = await service.getByReferrer(linkId, userId);

		expect(analyticsCache.getCacheVersion).toHaveBeenCalledWith(userId, linkId);
		expect(cache.get).toHaveBeenCalledWith(cacheKey);
		expect(prisma.link.findFirst).toHaveBeenCalledWith({
			where: {
				id: linkId,
				userId,
			},
		});
		expect(prisma.linkAccess.groupBy).toHaveBeenCalledWith({
			by: ["referer"],
			where: {
				linkId,
			},
			_count: {
				_all: true,
			},
		});
		expect(cache.set).toHaveBeenCalledWith(
			cacheKey,
			expectedData,
			ANALYTICS_CACHE_TTL,
		);
		expect(result).toEqual({
			data: expectedData,
			cacheStatus: "MISS",
		});
	});

	it("getClicksPerDay should return a cache HIT without querying Prisma", async () => {
		const from = "2026-08-01";
		const to = "2026-08-02";
		const cacheKey = buildDailyCacheKey(from, to);

		const cachedData: DailyAnalytics[] = [
			{
				date: "2026-08-02",
				clicks: 12,
			},
		];

		analyticsCache.getCacheVersion.mockResolvedValue(version);

		cache.get.mockResolvedValue(cachedData);

		const result = await service.getClicksPerDay(linkId, userId, { from, to });

		expect(analyticsCache.getCacheVersion).toHaveBeenCalledWith(userId, linkId);
		expect(cache.get).toHaveBeenCalledWith(cacheKey);

		expect(result).toEqual({
			data: cachedData,
			cacheStatus: "HIT",
		});

		expect(prisma.linkAccess.findMany).not.toHaveBeenCalled();
		expect(prisma.link.findFirst).not.toHaveBeenCalled();
		expect(cache.set).not.toHaveBeenCalled();
	});

	it("getClicksPerDay should return a cache MISS, query Prisma, and cache the result", async () => {
		const from = "2026-08-01";
		const to = "2026-08-02";
		const cacheKey = buildDailyCacheKey(from, to);
		const prismaResult = [
			{ createdAt: new Date("2026-08-01T12:00:00.000Z") },
			{ createdAt: new Date("2026-08-01T15:00:00.000Z") },
			{ createdAt: new Date("2026-08-02T12:00:00.000Z") },
		];
		const expectedData: DailyAnalytics[] = [
			{
				date: "2026-08-01",
				clicks: 2,
			},
			{
				date: "2026-08-02",
				clicks: 1,
			},
		];

		analyticsCache.getCacheVersion.mockResolvedValue(version);
		cache.get.mockResolvedValue(undefined);
		prisma.link.findFirst.mockResolvedValue(ownedLink);
		prisma.linkAccess.findMany.mockResolvedValue(prismaResult);

		const result = await service.getClicksPerDay(linkId, userId, { from, to });

		expect(analyticsCache.getCacheVersion).toHaveBeenCalledWith(userId, linkId);
		expect(cache.get).toHaveBeenCalledWith(cacheKey);
		expect(prisma.link.findFirst).toHaveBeenCalledWith({
			where: {
				id: linkId,
				userId,
			},
		});
		expect(prisma.linkAccess.findMany).toHaveBeenCalledWith({
			where: {
				linkId,
				createdAt: {
					gte: new Date("2026-08-01T03:00:00.000Z"),
					lt: new Date("2026-08-03T03:00:00.000Z"),
				},
			},
			select: {
				createdAt: true,
			},
			orderBy: {
				createdAt: "asc",
			},
		});
		expect(cache.set).toHaveBeenCalledWith(
			cacheKey,
			expectedData,
			DAILY_CACHE_TTL,
		);
		expect(result).toEqual({
			data: expectedData,
			cacheStatus: "MISS",
		});
	});

	it("findSummary should return click totals and the most accessed link", async () => {
		jest.useFakeTimers();
		jest.setSystemTime(new Date("2026-08-02T12:00:00.000Z"));

		const mostAccessedLink = {
			id: linkId,
			shortCode: "abc123",
			originalUrl: "https://example.com",
			_count: {
				linkAccesses: 20,
			},
		};

		prisma.linkAccess.count
			.mockResolvedValueOnce(42)
			.mockResolvedValueOnce(5);
		prisma.link.findFirst.mockResolvedValue(mostAccessedLink);

		const result = await service.findSummary(userId);

		expect(prisma.linkAccess.count).toHaveBeenNthCalledWith(1, {
			where: {
				link: {
					userId,
				},
			},
		});
		expect(prisma.linkAccess.count).toHaveBeenNthCalledWith(2, {
			where: {
				link: {
					userId,
				},
				createdAt: {
					gte: new Date("2026-08-02T03:00:00.000Z"),
					lt: new Date("2026-08-03T03:00:00.000Z"),
				},
			},
		});
		expect(prisma.link.findFirst).toHaveBeenCalledWith({
			where: {
				userId,
			},
			select: {
				id: true,
				shortCode: true,
				originalUrl: true,
				_count: {
					select: {
						linkAccesses: true,
					},
				},
			},
			orderBy: {
				linkAccesses: {
					_count: "desc",
				},
			},
		});
		expect(result).toEqual({
			totalClicks: 42,
			totalClicksToday: 5,
			mostAccessedLink: {
				id: linkId,
				shortCode: "abc123",
				originalUrl: "https://example.com",
				totalClicks: 20,
			},
		});
	});

	it("findSummary should return a null most accessed link when the user has no links", async () => {
		prisma.linkAccess.count.mockResolvedValue(0);
		prisma.link.findFirst.mockResolvedValue(null);

		const result = await service.findSummary(userId);

		expect(result).toEqual({
			totalClicks: 0,
			totalClicksToday: 0,
			mostAccessedLink: null,
		});
	});
});
