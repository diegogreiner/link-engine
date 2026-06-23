import { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
	interface Session {
		accessToken?: string;
		refreshToken?: string;

		user: {
			id: string;
		} & DefaultSession["user"];
	}

	interface User {
		id: string;
		accessToken: string;
		refreshToken: string;
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		accessToken?: string;
		refreshToken?: string;

		user?: {
			id: string;
			name?: string | null;
			email?: string | null;
		};
	}
}
