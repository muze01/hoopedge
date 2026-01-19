import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "./generated/prisma/client";
import { nextCookies } from "better-auth/next-js";
import { emailService } from "@/services/email-service";
import { PrismaPg } from '@prisma/adapter-pg';
import { createAuthMiddleware } from "better-auth/api";
// import type { User } from "better-auth";

const adapter = new PrismaPg({ 
    connectionString: process.env.DATABASE_URL 
});
export const prisma = new PrismaClient({ 
    adapter,
    errorFormat: "pretty"
});

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL,
    database: prismaAdapter(
        prisma,
        {
            provider: "postgresql"
        }
    ),

    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url }: { user: { email: string }; url: string }) => {
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
                    user.name ?? user.email.split("@")[0]
                );
                console.log("✅ Welcome email sent successfully");
            } catch (error) {
                console.error("❌ Failed to send welcome email:", error);
                throw error;
            }
        }
    },

    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        sendResetPassword: async ({ user, url }: { user: { email: string }; url: string }) => {
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
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
        }
    },
    account: {
        accountLinking: {
            enabled: true,
            trustedProviders: ["google"]
        }
    },
    // session: { expiresIn: 30 },
    hooks: {
        // this doesn't still work...
        after: createAuthMiddleware(async (ctx) => {
            // Handle social sign-up (Google/ etc)
            if (ctx.path === "/sign-in/social") {
                const newSession = ctx.context.newSession;
                const isNewUser = ctx.context.isNewUser; // Better Auth provides this flag
                
                if (newSession && isNewUser) {
                    const user = newSession.user;
                    console.log("🎉 New social user signed up:", user.email);
                    
                    try {
                        await emailService.sendWelcomeEmail(
                            user.email,
                            user.name ?? user.email.split("@")[0]
                        );
                        console.log("✅ Welcome email sent to social user:", user.email);
                    } catch (error) {
                        console.error("❌ Failed to send welcome email to social user:", error);
                        // Don't throw - let auth continue
                    }
                }
            }
        }),
    },

    plugins: [nextCookies()],
})