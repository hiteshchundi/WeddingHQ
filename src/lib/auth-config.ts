import "server-only";

import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { authAdapter } from "./auth-adapter";

export const authProviders = {
  google: Boolean(process.env.AUTH_GOOGLE_ID?.trim() && process.env.AUTH_GOOGLE_SECRET?.trim()),
  resend: Boolean(process.env.AUTH_RESEND_KEY?.trim() && process.env.AUTH_EMAIL_FROM?.trim()),
};

export const authConfig = {
  adapter: authAdapter,
  session: { strategy: "database" },
  providers: [
    ...(authProviders.google ? [Google] : []),
    ...(authProviders.resend ? [Resend({ from: process.env.AUTH_EMAIL_FROM })] : []),
  ],
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
    verifyRequest: "/sign-in/check-email",
  },
  callbacks: {
    session({ session, user }) {
      // Explicit whitelist for both auth() and the public Auth.js session route.
      return {
        expires: session.expires,
        user: { id: user.id, name: user.name, email: user.email, image: user.image },
      };
    },
  },
  logger: {
    error() {
      // Adapter/provider errors can contain credentials or magic-link tokens.
      console.error("[auth] Authentication failed. Check server configuration and database/provider availability.");
    },
  },
} satisfies NextAuthConfig;
