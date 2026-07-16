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

export class AnalyticsService {
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
}
