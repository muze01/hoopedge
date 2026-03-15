import { NextRequest, NextResponse } from "next/server";
import { SubscriptionService } from "@/lib/subscription-service";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const expired = await SubscriptionService.expireSubscriptions();

    return NextResponse.json({
      success: true,
      expired: expired.length,
      message: `Expired ${expired.length} subscriptions`,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Failed to expire subscriptions" },
      { status: 500 },
    );
  }
}

// Allow POST as well for manual triggers
export async function POST(req: NextRequest) {
  return GET(req);
}
