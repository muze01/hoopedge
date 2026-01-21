import AnalyticsClient from "./analytics-client";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "../../lib/auth";
import { SubscriptionService } from "@/lib/subscription-service";

export default async function AnalyticsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth");
  }

  // Fetch user role from database
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, id: true },
  });

  // Check if we have user in DB
  if (!user) {
    redirect("/auth");
  }

  // Check if user has active subscription
  const hasActiveSub = await SubscriptionService.hasActiveSubscription(user.id);

  // If user role is PRO but no active subscription, downgrade them
  if (user.role === "PRO" && !hasActiveSub) {
    await prisma.user.update({
      where: { id: user.id },
      data: { role: "FREE" },
    });
    return <AnalyticsClient userRole="FREE" />;
  }

  return <AnalyticsClient userRole={user?.role} />;
}
