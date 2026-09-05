import { api } from "../lib/api";
import { LoginResponse } from "../types/auth";

export class AuthService {
	static async login(data: {
		email: string;
		password: string;
	}): Promise<LoginResponse> {
		const response = await api.post("/auth/login", data);

		return response.data;
	}

	static async register(data: { email: string; password: string }) {
		const response = await api.post("/auth/register", data);

		return response.data;
	}

	static async refresh(refreshToken: string): Promise<LoginResponse> {
		const response = await api.post("/auth/refresh", {
			refreshToken,
		});

		return response.data;
	}

	static async logout(): Promise<void> {
		await api.post("/auth/logout");
	}
}
