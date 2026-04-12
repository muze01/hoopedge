import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { emailService } from "@/services/email-service";
import { prisma } from "./db";

export const auth = betterAuth({
  baseURL:
    process.env.NODE_ENV === "production"
      ? process.env.BETTER_AUTH_URL
      : process.env.BETTER_AUTH_URL_LOCAL,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({
      user,
      url,
    }: {
      user: { email: string };
      url: string;
    }) => {
      console.log("📧 Sending verification email to:", user.email);
      console.log("🔗 Verification URL:", url);
      try {
        await emailService.sendVerificationEmail(user.email, url);
        console.log("✅ Verification email sent successfully");
      } catch (error) {
        console.error("❌ Failed to send verification email:", error);
        throw error;
      }
    },

    async afterEmailVerification(user) {
      try {
        await emailService.sendWelcomeEmail(
          user.email,
          user.name ?? user.email.split("@")[0],
        );
        console.log("✅ Welcome email sent successfully");
      } catch (error) {
        console.error("❌ Failed to send welcome email:", error);
        throw error;
      }
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({
      user,
      url,
    }: {
      user: { email: string };
      url: string;
    }) => {
      console.log("🔐 Sending password reset email to:", user.email);
      console.log("🔗 Reset URL:", url);
      try {
        await emailService.sendPasswordResetEmail(user.email, url);
        console.log("✅ Password reset email sent successfully");
      } catch (error) {
        console.error("❌ Failed to send password reset email:", error);
        throw error;
      }
    },
    revokeSessionsOnPasswordReset: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds (5 minutes)
    },
  },
  plugins: [nextCookies()],
});
