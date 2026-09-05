import { DefaultSession } from "next-auth";

type RefreshAccessTokenError = "RefreshAccessTokenError";

declare module "next-auth" {
	interface Session {
		accessToken?: string;
		error?: RefreshAccessTokenError;

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
		accessTokenExpires?: number;
		id?: string;
		error?: RefreshAccessTokenError;
	}
}
