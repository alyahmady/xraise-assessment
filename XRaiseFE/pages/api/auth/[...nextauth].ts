import axios from "axios";
import CredentialsProvider from "next-auth/providers/credentials";
import NextAuth, { NextAuthOptions } from "next-auth";

const backendBase = process.env.BACKEND_URL || "http://localhost:8000";

const decodeJwt = (token: string) => {
  try {
    const payload = token.split(".")[1];
    const decoded = Buffer.from(payload, "base64").toString("utf8");
    return JSON.parse(decoded);
  } catch (err) {
    return null;
  }
};

const refreshAccessToken = async (token: any) => {
  try {
    const response = await axios.post(`${backendBase}/api/users/token/refresh/`, {
      refresh: token.refreshToken,
    });
    const newAccessToken = response.data.access;
    const decoded = decodeJwt(newAccessToken);
    return {
      ...token,
      accessToken: newAccessToken,
      accessTokenExpires: decoded?.exp ? decoded.exp * 1000 : Date.now() + 50 * 60 * 1000,
      subscription_status: decoded?.subscription_status || token.subscription_status,
      current_plan: decoded?.current_plan || token.current_plan,
    };
  } catch (error) {
    return { ...token, error: "RefreshAccessTokenError" };
  }
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;
        try {
          const response = await axios.post(`${backendBase}/api/users/login/`, {
            username: credentials.username,
            password: credentials.password,
          });

          const { access, refresh } = response.data;
          const decoded = decodeJwt(access);

          return {
            id: decoded?.user_id?.toString() || credentials.username,
            accessToken: access,
            refreshToken: refresh,
            subscription_status: decoded?.subscription_status,
            current_plan: decoded?.current_plan,
            accessTokenExpires: decoded?.exp ? decoded.exp * 1000 : Date.now() + 50 * 60 * 1000,
            username: credentials.username,
          };
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
        if (user) {
          return {
            ...token,
            accessToken: (user as any).accessToken,
            refreshToken: (user as any).refreshToken,
            accessTokenExpires: (user as any).accessTokenExpires,
            subscription_status: (user as any).subscription_status,
            current_plan: (user as any).current_plan,
            username: (user as any).username,
          };
        }

        if (token.accessTokenExpires && Date.now() < (token.accessTokenExpires as number) - 60 * 1000) {
          return token;
        }

        return refreshAccessToken(token);
    },
    async session({ session, token }) {
      (session as any).accessToken = token.accessToken;
      (session as any).refreshToken = token.refreshToken;
      (session as any).subscription_status = token.subscription_status;
      (session as any).current_plan = token.current_plan;
      (session as any).username = token.username;
      (session as any).error = token.error;
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
  secret: process.env.NEXTAUTH_SECRET || "changeme",
};

export default NextAuth(authOptions);

