import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    subscription_status?: string;
    current_plan?: string;
    username?: string;
    error?: string;
  }

  interface User {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    subscription_status?: string;
    current_plan?: string;
    username?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    subscription_status?: string;
    current_plan?: string;
    username?: string;
    error?: string;
  }
}
