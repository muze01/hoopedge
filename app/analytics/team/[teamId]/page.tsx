
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { getTeamDetail } from "@/lib/analytics/team-stats";
import { SubscriptionService } from "@/lib/subscription-service";
import { prisma } from "@/lib/db";
import TeamClient from "./team-client";
import { TeamData } from "@/types/all.types";

export default async function TeamPage({
    params,
}: {
    params: Promise<{ teamId: string }>;
}) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/auth");

    const { teamId } = await params;

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true, id: true },
    });
    if (!user) redirect("/auth");

    const hasActiveSub = await SubscriptionService.hasActiveSubscription(user.id);
    const userRole = user.role === "PRO" && !hasActiveSub ? "FREE" : user.role;

    let rawData: Awaited<ReturnType<typeof getTeamDetail>>;
    try {
        rawData = await getTeamDetail(teamId);
    } catch (e) {
        notFound();
    }

    if (!rawData.homeStats || !rawData.awayStats) {
        notFound();
    }

    const data: TeamData = rawData as TeamData;

    return <TeamClient data={data} userRole={userRole} />;
}

