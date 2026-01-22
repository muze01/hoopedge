import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { stripe, STRIPE_PLANS } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan } = await req.json();

    // Validate plan
    if (plan !== "monthly" && plan !== "yearly") {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const priceConfig =
      plan === "monthly" ? STRIPE_PLANS.PRO_MONTHLY : STRIPE_PLANS.PRO_YEARLY;

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceConfig.priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/analytics?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?cancelled=true`,
      customer_email: session.user.email,
      metadata: {
        userId: session.user.id,
        plan: "PRO",
      },
      subscription_data: {
        metadata: {
          userId: session.user.id,
          plan: "PRO",
        },
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
