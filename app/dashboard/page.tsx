import { headers } from "next/headers";
import DashboardClientPage from "./dashboard-client";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/auth";
import { SubscriptionService } from "@/lib/subscription-service";

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

  // Get active subscription
  const activeSubscription = await SubscriptionService.getActiveSubscription(
    session.user.id,
  );

  return (
    <DashboardClientPage
      session={session}
      userRole={userRole}
      subscription={
        activeSubscription && activeSubscription.provider
          ? {
              status: activeSubscription.status,
              endDate: activeSubscription.endDate,
              provider: activeSubscription.provider,
            }
          : null
      }
    />
  );
}
