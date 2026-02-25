import { NextRequest, NextResponse } from "next/server";
import { PaystackAPI } from "@/lib/paystack";
import { SubscriptionService } from "@/lib/subscription-service";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        { error: "No reference provided" },
        { status: 400 },
      );
    }

    // Verify transaction with Paystack
    const response = await PaystackAPI.verifyTransaction(reference);

    if (response.data.status !== "success") {
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 },
      );
    }

    const { data } = response;
    const metadata = data.metadata;

    if (!metadata.userId) {
      return NextResponse.json(
        { error: "No user ID in transaction" },
        { status: 400 },
      );
    }

    const existing = await prisma.subscription.findFirst({
      where: { providerSubId: reference },
    });

    // If this is the case then it has already been processed through webhook and user created, will allow re-verification but stop from creating another subscription
    if (existing) {
      return NextResponse.json({ success: true, message: "Already processed" });
    }

    // Calculate end date based on plan
    const endDate = new Date();
    if (metadata.interval === "annually") {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    // Create subscription
    await SubscriptionService.createSubscription({
      userId: metadata.userId,
      plan: "PRO",
      provider: "PAYSTACK",
      providerSubId: reference,
      providerCustomerId:
        data.customer?.customer_code || data.customer?.id?.toString(),
      amount: data.amount / 100, // TODO: CONVERT ALL TO KOBO AND STORE IN SUBUNITS in DB
      currency: "NGN",
      interval: metadata.interval === "annually" ? "yearly" : "monthly",
      endDate,
    });

    return NextResponse.json({
      success: true,
      message: "Subscription created successfully",
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 },
    );
  }
}
