import NextAuth, { type NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { AuthService } from "./services/auth-service";

type AccessTokenPayload = {
  sub: string;
  email: string;
  exp?: number;
};

const REFRESH_ERROR = "RefreshAccessTokenError" as const;

function decodeAccessToken(token: string): AccessTokenPayload {
  const base64Url = token.split(".")[1];

  if (!base64Url) {
    throw new Error("Token de acesso inválido");
  }

  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

  return JSON.parse(atob(base64)) as AccessTokenPayload;
}

function getAccessTokenExpiration(token: string): number {
  const payload = decodeAccessToken(token);

  return payload.exp ? payload.exp * 1000 : Date.now() + 14 * 60 * 1000;
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
  if (!token.refreshToken) {
    return {
      ...token,
      error: REFRESH_ERROR,
    };
  }

  try {
    const refreshedTokens = await AuthService.refresh(token.refreshToken);

    return {
      ...token,
      accessToken: refreshedTokens.accessToken,
      accessTokenExpires: getAccessTokenExpiration(refreshedTokens.accessToken),
      refreshToken: refreshedTokens.refreshToken,
      error: undefined,
    };
  } catch {
    return {
      ...token,
      error: REFRESH_ERROR,
    };
  }
}

export const authOptions: NextAuthOptions = {
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

        const payload = decodeAccessToken(data.accessToken);

        return {
          id: payload.sub,
          email: payload.email,
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
        token.accessTokenExpires = getAccessTokenExpiration(user.accessToken);
        token.id = user.id;
        token.email = user.email;

        return token;
      }

      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        return token;
      }

      return refreshAccessToken(token);
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.error = token.error;
      session.user.id = token.id ?? token.sub ?? "";
      session.user.email = token.email;

      return session;
    },
  },

  session: {
    strategy: "jwt" as const,
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
