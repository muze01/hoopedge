import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { SubscriptionService } from "@/lib/subscription-service";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's active subscription
    const subscription = await SubscriptionService.getActiveSubscription(
      session.user.id,
    );

    if (!subscription || !subscription.providerCustomerId) {
      return NextResponse.json(
        { error: "No active subscription" },
        { status: 404 },
      );
    }

    // Create Stripe portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.providerCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/analytics`,
    });

    return NextResponse.json({
      success: true,
      url: portalSession.url,
    });
  } catch (error) {
    console.error("Portal creation error:", error);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 },
    );
  }
}
