import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { AuthService } from "./services/auth-service";

export const { handlers, signIn, signOut, auth } = NextAuth({
	providers: [
		CredentialsProvider({
			name: "credentials",

			credentials: {
				email: {},
				password: {},
			},

			async authorize(credentials) {
				if (!credentials) return null;

				const data = await AuthService.login({
					email: credentials.email as string,
					password: credentials.password as string,
				});

				if (!data) return null;

				return {
					id: data.user.id,
					name: data.user.name,
					email: data.user.email,
					accessToken: data.accessToken,
					refreshToken: data.refreshToken,
				};
			},
		}),
	],

	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.accessToken = user.accessToken;
				token.refreshToken = user.refreshToken;
				token.user = user;
			}

			return token;
		},

		async session({ session, token }) {
			session.accessToken = token.accessToken;
			session.refreshToken = token.refreshToken;

			return session;
		},
	},

	session: {
		strategy: "jwt",
	},
});
