import { api } from "@/src/lib/api";

export type ClicksPerDay = {
  date: string;
  clicks: number;
};

export type CountryData = {
  country: string;
  clicks: number;
};

export type DeviceData = {
  deviceType: string;
  clicks: number;
};

export type ReferrerData = {
  referer: string;
  clicks: number;
};

export type MostAccessedLink = {
  id: string;
  shortCode: string;
  originalUrl: string;
  totalClicks: number;
};

export type AnalyticsSummary = {
  totalClicks: number;
  totalClicksToday: number;
  mostAccessedLink: MostAccessedLink | null;
};

export class AnalyticsService {
  static async getSummary() {
    const { data } = await api.get("/analytics/summary");
    return data as AnalyticsSummary;
  }

  static async getClicksPerDay(linkId: string, from?: string, to?: string) {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const { data } = await api.get(
      `/analytics/${linkId}/clicks-per-day?${params}`,
    );
    return data as ClicksPerDay[];
  }

  static async getByCountry(linkId: string) {
    const { data } = await api.get(`/analytics/${linkId}/by-country`);
    return data as CountryData[];
  }

  static async getByDevice(linkId: string) {
    const { data } = await api.get(`/analytics/${linkId}/by-device`);
    return data as DeviceData[];
  }

  static async getByReferrer(linkId: string) {
    const { data } = await api.get(`/analytics/${linkId}/by-referrer`);
    return data as ReferrerData[];
  }
}
