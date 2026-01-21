import { headers } from "next/headers";
import DashboardClientPage from "./dashboard-client";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "../../lib/auth";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth");
  }

  if (!session.user.emailVerified) {
    redirect("/auth/verify-email");
  }

  // Fetch user role from database
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  const userRole = user?.role || "FREE";

  return <DashboardClientPage session={session} userRole={userRole} />;
}
