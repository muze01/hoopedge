import AuthClientPage from "./auth-client";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AuthPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });
// when and how does this file get to be executed..
    if (session) {
        redirect("/dashboard");
    }

    return <AuthClientPage />;
}