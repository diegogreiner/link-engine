import { api } from "../lib/api";

export class AuthService {
	static async login(data: { email: string; password: string }) {
		const response = await api.post("/auth/login", data);

		return response.data;
	}

	static async register(data: { email: string; password: string }) {
		const response = await api.post("/auth/register", data);

		return response.data;
	}

	static async refresh(refreshToken: string) {
		const response = await api.post("/auth/refresh", {
			refreshToken,
		});

		return response.data;
	}
}
