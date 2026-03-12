import { NextRequest, NextResponse } from "next/server";
import { FlutterwaveAPI } from "@/lib/flutterwave";
import { SubscriptionService } from "@/lib/subscription-service";
import { PRICING } from "@/lib/regions";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const incomingHash = req.headers.get("verif-hash");

  if (!incomingHash) {
    return NextResponse.json({ error: "No signature" }, { status: 401 });
  }

  const isValid = FlutterwaveAPI.verifyWebhook(incomingHash);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(body);

  try {
    switch (event.event) {
      case "charge.completed": {
        const {
          id: transactionId,
          tx_ref,
          customer,
          status,
          plan_subscription_id,
        } = event.data;

        if (status !== "successful") break;

        // Idempotency - don't process the same transaction twice
        const alreadyProcessed = await prisma.subscription.findFirst({
          where: { providerSubId: String(transactionId) },
        });
        if (alreadyProcessed) break;

        const customerEmail = customer?.email;
        const chargedAmount: number = event.data.amount;
        const chargedCurrency: string = event.data.currency ?? "NGN";

        const metaData = event.meta_data;

        let userId: string | null = metaData?.userId ?? null;

        if (!userId) {
          const txRef: string = tx_ref ?? "";
          const parts = txRef.split("_");
          userId =
            txRef.startsWith("hoopedge_") && parts.length >= 3
              ? parts.slice(2).join("_")
              : null;
        }

        // Last resort: look up by customer email from a previous charge
        if (!userId) {
          if (!customerEmail) break;
          const existing = await prisma.subscription.findFirst({
            where: {
              providerCustomerId: customerEmail,
              provider: "FLUTTERWAVE",
            },
            orderBy: { createdAt: "desc" },
          });
          if (!existing) {
            console.warn(
              "charge.completed: no user found for customer:",
              customerEmail,
            );
            break;
          }
          userId = existing.userId;
        }

        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true },
        });

        if (!user) {
          console.error("charge.completed: user not found for id:", userId);
          break;
        }

        let interval: "monthly" | "yearly" = "monthly";

        if (metaData?.interval === "yearly") {
          interval = "yearly";
        } else if (!metaData?.interval) {
          const pricingForCurrency =
            PRICING[chargedCurrency as keyof typeof PRICING];
          if (
            pricingForCurrency &&
            chargedAmount === pricingForCurrency.yearly
          ) {
            interval = "yearly";
          }
        }

        const endDate = new Date();
        if (interval === "yearly") {
          endDate.setFullYear(endDate.getFullYear() + 1);
        } else {
          endDate.setMonth(endDate.getMonth() + 1);
        }

        await SubscriptionService.createSubscription({
          userId,
          plan: "PRO",
          provider: "FLUTTERWAVE",
          providerSubId: String(transactionId),
          providerCustomerId: customerEmail,
          flwPlanSubscriptionId: plan_subscription_id
            ? String(plan_subscription_id)
            : undefined,
          amount: chargedAmount,
          currency: chargedCurrency,
          interval,
          endDate,
        });

        break;
      }

      case "subscription.cancelled": {
        const { id: flwSubId, customer } = event.data;

        const subscription = await prisma.subscription.findFirst({
          where: {
            OR: [
              { flwPlanSubscriptionId: String(flwSubId) },
              { providerCustomerId: customer?.email },
            ],
            status: "ACTIVE",
          },
        });

        if (subscription) {
          await SubscriptionService.cancelSubscription(subscription.id);
        }

        break;
      }

      case "charge.failed": {
        console.warn(
          "Flutterwave charge failed for tx_ref:",
          event.data?.tx_ref,
          "| customer:",
          event.data?.customer?.email,
        );
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
