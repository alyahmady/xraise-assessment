import axios from "axios";
import CredentialsProvider from "next-auth/providers/credentials";
import NextAuth, { NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";

// Use BACKEND_URL for server-side requests (Docker service name)
// Fall back to NEXT_PUBLIC_BACKEND_URL for local development
const backendBase = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

const decodeJwt = (token: string) => {
  try {
    const payload = token.split(".")[1];
    const decoded = Buffer.from(payload, "base64").toString("utf8");
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

const refreshAccessToken = async (token: JWT): Promise<JWT> => {
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
      error: undefined, // Clear any previous errors
    };
  } catch (error) {
    console.error("Failed to refresh access token:", error);
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
            subscription_status: decoded?.subscription_status || "inactive",
            current_plan: decoded?.current_plan || "none",
            accessTokenExpires: decoded?.exp ? decoded.exp * 1000 : Date.now() + 50 * 60 * 1000,
            username: credentials.username,
          };
        } catch (error) {
          console.error("Login failed:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
        // Initial sign in - store user data in token
        if (user) {
          return {
            ...token,
            accessToken: user.accessToken,
            refreshToken: user.refreshToken,
            accessTokenExpires: user.accessTokenExpires,
            subscription_status: user.subscription_status,
            current_plan: user.current_plan,
            username: user.username,
            error: undefined,
          };
        }

        // Force refresh when update is triggered
        if (trigger === "update") {
          return refreshAccessToken(token);
        }

        // Token is still valid - return it as is
        if (token.accessTokenExpires && Date.now() < token.accessTokenExpires - 60 * 1000) {
          return token;
        }

        // Token is expired or about to expire - refresh it
        return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.subscription_status = token.subscription_status;
      session.current_plan = token.current_plan;
      session.username = token.username;
      session.error = token.error;
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);