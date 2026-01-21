"use server";
import { redirect } from "next/navigation";
import { auth } from "../auth";
import { headers } from "next/headers";
import { APIError } from "better-auth/api";

export const signUp = async (email: string, password: string, name: string) => {
    try {
        const result = await auth.api.signUpEmail({
            body: {
                email,
                password,
                name,
                callbackURL: "/dashboard" // should this be dashboard or verified?
            }
        })

        return result;
    } catch (error) {
        if (error instanceof APIError) {
            console.log("SignUP Error:", error.message, error.status)
        }
        console.error("SignUp Error", error);
        throw error;
    }
}

export const signIn = async (email: string, password: string) => {
    try {
        const result = await auth.api.signInEmail({
            body: {
                email,
                password,
                callbackURL: "/dashboard" 
            }
        });

        return result;
    } catch (error) {
        if (error instanceof APIError) {
            console.log("SignIn Error:", error.message, error.status);
            
            if (error.status === "FORBIDDEN" && error.message.includes("Email not verified")) {
                console.log("Email not verified - redirecting to verify page");
                redirect("/auth/verify-email");
            }
        }
        console.error("SignIn Error", error);
        throw error;
    }
}

export const signInSocial = async (provider: "google" | "github") => {
    try {
        const { url } = await auth.api.signInSocial({
            body: {
                provider: provider,
                callbackURL: "/dashboard" 
            }
        })

        if (url) {
        redirect(url);
        }
        
     } catch (error) {

        if (
            error instanceof Error && 
            'digest' in error && 
            typeof error.digest === 'string' && 
            error.digest.startsWith('NEXT_REDIRECT')
        ) {
            throw error; 
        }
        
        if (error instanceof APIError) {
            console.log("SignInSocial Error:", error.message, error.status)
        }
        console.error("SignInSocial Error", error);
        throw error;
    }
}

export const signOut = async () => {
    try {
        const result = await auth.api.signOut({
            headers: await headers()
        })

        return result;
    } catch (error) {
        if (error instanceof APIError) {
            console.log("SignOut Error:", error.message, error.status)
        }
        console.error("signOut Error", error);
        throw error;
    }
}

export const forgotPassword = async (email: string) => {
    try {
        const result = await auth.api.requestPasswordReset({
            body: {
                email,
                redirectTo: "/auth/reset-password" 
            }
        })

        return result;
    } catch (error) {
        if (error instanceof APIError) {
            console.log("ForgotPassword Error:", error.message, error.status)
        }
        console.error("ForgotPassword Error", error);
        throw error;
    }
}

export const resetPassword = async (newPassword: string, token: string) => {
    try {
        const result = await auth.api.resetPassword({
            body: {
                newPassword,
                token
            }
        })

        return result;
    } catch (error) {
        if (error instanceof APIError) {
            console.log("ResetPassword Error:", error.message, error.status)
        }
        console.error("ResetPassword Error", error);
        throw error;
    }
}

export const verifyEmail = async (token: string) => {
    try {
        const result = await auth.api.verifyEmail({
            query: {
                token
            }
        })

        return result;
    } catch (error) {
        if (error instanceof APIError) {
            console.log("VerifyEmail Error:", error.message, error.status)
        }
        console.error("VerifyEmail Error", error);
        throw error;
    }
}

export const resendVerificationEmail = async (email: string) => {
    try {
        const result = await auth.api.sendVerificationEmail({
            body: {
                email,
                callbackURL: "/auth/verify-email"
            }
        })

        return result;
    } catch (error) {
        if (error instanceof APIError) {
            console.log("ResendVerification Error:", error.message, error.status)
        }
        console.error("ResendVerification Error", error);
        throw error;
    }
}

// TODO: Create a function to update user info?? Like change name?