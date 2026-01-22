import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { PAYSTACK_PLANS } from "@/lib/paystack";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan } = await req.json();

    if (plan !== "monthly" && plan !== "yearly") {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const planConfig =
      plan === "monthly"
        ? PAYSTACK_PLANS.PRO_MONTHLY
        : PAYSTACK_PLANS.PRO_YEARLY;

    // Generate unique reference
    const reference = `hoopedge_${Date.now()}_${session.user.id}`;

    return NextResponse.json({
      success: true,
      amount: planConfig.amount * 100, // Convert to kobo
      reference,
      metadata: {
        userId: session.user.id,
        userEmail: session.user.email,
        plan: "PRO",
        planCode: planConfig.planCode,
        interval: planConfig.interval,
      },
    });
  } catch (error) {
    console.error("Paystack initialization error:", error);
    return NextResponse.json(
      { error: "Failed to initialize payment" },
      { status: 500 },
    );
  }
}
