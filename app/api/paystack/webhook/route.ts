import { NextRequest, NextResponse } from "next/server";
import { PaystackAPI } from "@/lib/paystack";
import { SubscriptionService } from "@/lib/subscription-service";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.text(); 
  const signature = req.headers.get("x-paystack-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 401 });
  }

  const isValid = PaystackAPI.verifyWebhook(body, signature);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(body);

  try {
    switch (event.event) {
      case "charge.success": {
        const { reference, metadata, customer } = event.data;

        if (!metadata?.userId) break;

        // Check if we already processed this reference (idempotency)
        const existing = await prisma.subscription.findFirst({
          where: { providerSubId: reference },
        });
        if (existing) break;

        const interval =
          metadata.interval === "annually" ? "yearly" : "monthly";
        const endDate = new Date();
        if (interval === "yearly") {
          endDate.setFullYear(endDate.getFullYear() + 1);
        } else {
          endDate.setMonth(endDate.getMonth() + 1);
        }

        await SubscriptionService.createSubscription({
          userId: metadata.userId,
          plan: "PRO",
          provider: "PAYSTACK",
          providerSubId: reference,
          providerCustomerId:
            customer?.customer_code || customer?.id?.toString(),
          amount: event.data.amount / 100,
          currency: "NGN",
          interval,
          endDate,
        });

        break;
      }

      /**
       * Fires when a subscription is cancelled — either by the user or via the Paystack dashboard.
       */
      case "subscription.disable": {
        const { subscription_code, customer } = event.data;

        const subscription = await prisma.subscription.findFirst({
          where: {
            OR: [
              { providerSubId: subscription_code },
              { providerCustomerId: customer?.customer_code },
            ],
            status: "ACTIVE",
          },
        });

        if (subscription) {
          await SubscriptionService.cancelSubscription(subscription.id);
        }

        break;
      }

      /**
       * Fires when a subscription renewal charge fails (e.g. expired card).
       * We don't cancel immediately — we let the endDate expire naturally,
       * giving the user time to update their card.
       */
      case "invoice.payment_failed": {
        const { subscription } = event.data;

        // Optional: send user an email here nudging them to update card
        // For now just log it
        console.warn(
          "Paystack renewal failed for subscription:",
          subscription?.subscription_code,
        );

        break;
      }

      default:
        // Ignore unhandled events
        break;
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
