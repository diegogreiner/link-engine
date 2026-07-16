import axios from "axios";
import { getSession, signOut } from "next-auth/react";

import "next-auth";

export const api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

api.interceptors.request.use(async (config) => {
	const session = await getSession();

	const token = session?.accessToken;

	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}

	return config;
});

api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			signOut({ callbackUrl: "/login" });
		}
		return Promise.reject(error);
	},
);
