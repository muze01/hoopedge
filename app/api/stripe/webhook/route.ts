import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { SubscriptionService } from "@/lib/subscription-service";
import { prisma } from "@/lib/auth";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === "subscription" && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string,
          );

          const userId = session.metadata?.userId;
          if (!userId) {
            throw new Error("No userId in session metadata");
          }

          // Get the first subscription item
          const subscriptionItem = subscription.items.data[0];

          // Map Stripe interval to our interval type
          const stripeInterval = subscriptionItem?.price?.recurring?.interval;
          let interval: "monthly" | "yearly" | undefined;

          if (stripeInterval === "month") {
            interval = "monthly";
          } else if (stripeInterval === "year") {
            interval = "yearly";
          }

          // Get current_period_end from subscription item
          const currentPeriodEnd = subscriptionItem?.current_period_end;

          if (!currentPeriodEnd) {
            throw new Error("No current_period_end found in subscription");
          }

          // Create subscription in database
          await SubscriptionService.createSubscription({
            userId,
            plan: "PRO",
            provider: "STRIPE",
            providerSubId: subscription.id,
            providerCustomerId: subscription.customer as string,
            amount: (subscriptionItem?.price?.unit_amount || 0) / 100,
            currency: subscription.currency.toUpperCase(),
            interval,
            endDate: new Date(currentPeriodEnd * 1000),
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        // Find subscription by Stripe ID
        const dbSub = await prisma.subscription.findUnique({
          where: { providerSubId: subscription.id },
        });

        if (dbSub) {
          // Get current_period_end from subscription item
          const subscriptionItem = subscription.items.data[0];
          const currentPeriodEnd = subscriptionItem?.current_period_end;

          if (currentPeriodEnd) {
            // Calculate days until end of period
            const daysUntilEnd = Math.ceil(
              (currentPeriodEnd * 1000 - Date.now()) / (24 * 60 * 60 * 1000),
            );

            // Update end date
            await SubscriptionService.extendSubscription(
              dbSub.id,
              daysUntilEnd,
            );
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        // Find and cancel subscription
        const dbSub = await prisma.subscription.findUnique({
          where: { providerSubId: subscription.id },
        });

        if (dbSub) {
          await SubscriptionService.cancelSubscription(dbSub.id);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;

        console.log(`Payment failed for invoice: ${invoice.id}`);

        // Send email notification to user Using Resend
        // You can get customer email from invoice.customer_email
        // await sendPaymentFailedEmail(invoice.customer_email, invoice.id);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }
}
