export type CacheResult<T> = {
	data: T;
	cacheStatus: "HIT" | "MISS";
};

export type CountryAnalytics = {
	country: string;
	clicks: number;
};

export type DeviceAnalytics = {
	deviceType: string;
	clicks: number;
};

export type ReferrerAnalytics = {
	referer: string;
	clicks: number;
};

export type DailyAnalytics = {
	date: string;
	clicks: number;
};
