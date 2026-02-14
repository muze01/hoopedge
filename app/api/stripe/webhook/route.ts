import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { SubscriptionService } from "@/lib/subscription-service";
import { prisma } from "@/lib/db";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text(); // also known as the payload
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

          const subscriptionItem = subscription.items.data[0];

          const stripeInterval = subscriptionItem?.price?.recurring?.interval;
          let interval: "monthly" | "yearly" | undefined;

          if (stripeInterval === "month") {
            interval = "monthly";
          } else if (stripeInterval === "year") {
            interval = "yearly";
          }

          const currentPeriodEnd = subscriptionItem?.current_period_end;

          if (!currentPeriodEnd) {
            throw new Error("No current_period_end found in subscription");
          }

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
        // TODO: HAVEN'T TESTED THIS
        console.log("GOT TO update");

        const subscription = event.data.object as Stripe.Subscription;

        // find subscription by Stripe ID
        const dbSub = await prisma.subscription.findUnique({
          where: { providerSubId: subscription.id },
        });

        if (dbSub) {
          // get current_period_end from subscription item
          const subscriptionItem = subscription.items.data[0];
          const currentPeriodEnd = subscriptionItem?.current_period_end;

          if (currentPeriodEnd) {
            // calculate days until end of period
            const daysUntilEnd = Math.ceil(
              (currentPeriodEnd * 1000 - Date.now()) / (24 * 60 * 60 * 1000),
            );

            // update end date
            await SubscriptionService.extendSubscription(
              dbSub.id,
              daysUntilEnd,
            );
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        console.log("GOT TO deleted");
        // TODO: HAVEN'T TESTED THIS
        const subscription = event.data.object as Stripe.Subscription;

        //find and cancel subscription
        const dbSub = await prisma.subscription.findUnique({
          where: { providerSubId: subscription.id },
        });

        if (dbSub) {
          await SubscriptionService.cancelSubscription(dbSub.id);
        }
        break;
      }

      case "invoice.payment_failed": {
        console.log("GOT TO failed invoice payment");
        // TODO: HAVEN'T TESTED THIS
        const invoice = event.data.object as Stripe.Invoice;

        console.log(`Payment failed for invoice: ${invoice.id}`);

        // Send email notification to user
        // u can get customer email from invoice.customer_email
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
