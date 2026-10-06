import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { Test, TestingModule } from "@nestjs/testing";
import type { Response } from "express";
import {
	AnalyticsController,
	AuthenticatedRequest,
} from "./analytics.controller";
import { AnalyticsService } from "./analytics.service";

type AnalyticsControllerType = {
	findSummary: AnalyticsService["findSummary"];
	getByCountry: AnalyticsService["getByCountry"];
	getByDevice: AnalyticsService["getByDevice"];
	getByReferrer: AnalyticsService["getByReferrer"];
	getClicksPerDay: AnalyticsService["getClicksPerDay"];
};

describe(`AnalyticsController`, () => {
	let analyticsController: AnalyticsController;
	let req: AuthenticatedRequest;
	let res: Response;
	let setHeader: jest.Mock;
	let mockAnalyticsService: {
		findSummary: jest.Mock<AnalyticsControllerType["findSummary"]>;
		getByCountry: jest.Mock<AnalyticsControllerType["getByCountry"]>;
		getByDevice: jest.Mock<AnalyticsControllerType["getByDevice"]>;
		getByReferrer: jest.Mock<AnalyticsControllerType["getByReferrer"]>;
		getClicksPerDay: jest.Mock<AnalyticsControllerType["getClicksPerDay"]>;
	};

	beforeEach(async () => {
		mockAnalyticsService = {
			findSummary: jest.fn<AnalyticsControllerType["findSummary"]>(),
			getByCountry: jest.fn<AnalyticsControllerType["getByCountry"]>(),
			getByDevice: jest.fn<AnalyticsControllerType["getByDevice"]>(),
			getByReferrer: jest.fn<AnalyticsControllerType["getByReferrer"]>(),
			getClicksPerDay: jest.fn<AnalyticsControllerType["getClicksPerDay"]>(),
		};

		const analytics: TestingModule = await Test.createTestingModule({
			controllers: [AnalyticsController],
			providers: [
				{
					provide: AnalyticsService,
					useValue: mockAnalyticsService,
				},
			],
		}).compile();

		req = {
			user: {
				sub: "teste",
				email: "teste@gmaiul.com",
			},
		} as unknown as AuthenticatedRequest;

		setHeader = jest.fn();
		res = { setHeader } as unknown as Response;

		analyticsController =
			analytics.get<AnalyticsController>(AnalyticsController);
	});

	it("should return the analytics summary for the authenticated user", async () => {
		const expectedResult = {
			totalClicks: 2,
			totalClicksToday: 1,
			mostAccessedLink: {
				id: "1",
				shortCode: "akV2nk1",
				originalUrl: "https://www.google.com",
				totalClicks: 2,
			},
		};

		mockAnalyticsService.findSummary.mockResolvedValue(expectedResult);

		const result = await analyticsController.findSummary(req);

		expect(mockAnalyticsService.findSummary).toHaveBeenCalledTimes(1);
		expect(mockAnalyticsService.findSummary).toHaveBeenCalledWith("teste");
		expect(result).toEqual(expectedResult);
	});

	it("should return clicks per day and set the cache status header", async () => {
		const linkId = "link-1";
		const filter = {
			from: "2026-08-01",
			to: "2026-08-02",
		};
		const data = [
			{ date: "2026-08-01", clicks: 2 },
			{ date: "2026-08-02", clicks: 1 },
		];

		mockAnalyticsService.getClicksPerDay.mockResolvedValue({
			data,
			cacheStatus: "MISS",
		});

		const result = await analyticsController.getClicksPerDay(
			linkId,
			filter,
			req,
			res,
		);

		expect(mockAnalyticsService.getClicksPerDay).toHaveBeenCalledTimes(1);
		expect(mockAnalyticsService.getClicksPerDay).toHaveBeenCalledWith(
			linkId,
			"teste",
			filter,
		);
		expect(setHeader).toHaveBeenCalledWith("X-Cache", "MISS");
		expect(result).toEqual(data);
	});

	it("should return analytics by country and set the cache status header", async () => {
		const linkId = "link-1";
		const data = [
			{ country: "Brazil", clicks: 12 },
			{ country: "Portugal", clicks: 3 },
		];

		mockAnalyticsService.getByCountry.mockResolvedValue({
			data,
			cacheStatus: "HIT",
		});

		const result = await analyticsController.getByCountry(linkId, req, res);

		expect(mockAnalyticsService.getByCountry).toHaveBeenCalledTimes(1);
		expect(mockAnalyticsService.getByCountry).toHaveBeenCalledWith(
			linkId,
			"teste",
		);
		expect(setHeader).toHaveBeenCalledWith("X-Cache", "HIT");
		expect(result).toEqual(data);
	});

	it("should return analytics by device and set the cache status header", async () => {
		const linkId = "link-1";
		const data = [
			{ deviceType: "smartphone", clicks: 8 },
			{ deviceType: "desktop", clicks: 4 },
		];

		mockAnalyticsService.getByDevice.mockResolvedValue({
			data,
			cacheStatus: "MISS",
		});

		const result = await analyticsController.getByDevice(linkId, req, res);

		expect(mockAnalyticsService.getByDevice).toHaveBeenCalledTimes(1);
		expect(mockAnalyticsService.getByDevice).toHaveBeenCalledWith(
			linkId,
			"teste",
		);
		expect(setHeader).toHaveBeenCalledWith("X-Cache", "MISS");
		expect(result).toEqual(data);
	});

	it("should return analytics by referrer and set the cache status header", async () => {
		const linkId = "link-1";
		const data = [
			{ referer: "google.com", clicks: 9 },
			{ referer: "Direct", clicks: 2 },
		];

		mockAnalyticsService.getByReferrer.mockResolvedValue({
			data,
			cacheStatus: "HIT",
		});

		const result = await analyticsController.getByReferrer(linkId, req, res);

		expect(mockAnalyticsService.getByReferrer).toHaveBeenCalledTimes(1);
		expect(mockAnalyticsService.getByReferrer).toHaveBeenCalledWith(
			linkId,
			"teste",
		);
		expect(setHeader).toHaveBeenCalledWith("X-Cache", "HIT");
		expect(result).toEqual(data);
	});
});
