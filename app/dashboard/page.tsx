import { headers } from "next/headers";
import DashboardClientPage from "./dashboard-client";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const session = await auth.api.getSession({
            headers: await headers()
        });
    
    if (!session) {
        redirect("/auth");
    }

    if (!session.user.emailVerified) {
        redirect("/auth/verify-email");
    }
    
  return <DashboardClientPage session={ session } />;
}