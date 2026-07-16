import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { AuthService } from "./services/auth-service";

function jwtDecode(token: string) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(atob(base64));
}

export const authOptions = {
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

        const payload = jwtDecode(data.accessToken);

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
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.id = user.id;
        token.email = user.email;
      }

      return token;
    },

    async session({ session, token }: { session: any; token: any }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.user.id = token.id;
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
