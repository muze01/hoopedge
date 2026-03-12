import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SubscriptionService } from "@/lib/subscription-service";
import { BillingClient } from "./billing-client";
import { verifyAndCreateSubscription } from "@/lib/verify-payment";
import { getCurrencyForCountry, PRICING } from "@/lib/regions";

export default async function BillingPage({
  searchParams,
}: {
  // searchParams: Promise<{ success?: string; reference?: string }>;
  searchParams: Promise<{ success?: string; transaction_id?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/auth");

  // Handle redirect back from Paystack after upgrade
  // const params = await searchParams;
  // if (params.success === "true" && params.reference) {
  //   await verifyAndCreateSubscription(params.reference);
  // }
  // Handle redirect back from Flutterwave after payment
  const params = await searchParams;
  if (params.success === "true" && params.transaction_id) {
    await verifyAndCreateSubscription(params.transaction_id);
  }

  const country = (await headers()).get("x-user-country") ?? "US";
  const currency = getCurrencyForCountry(country);
  const pricing = PRICING[currency];

  const sub = await SubscriptionService.getActiveSubscription(session.user.id);
  const history = await SubscriptionService.getSubscriptionHistory(
    session.user.id,
  );

  return (
    <BillingClient
      currency={currency}
      yearlyPrice={`${pricing.symbol}${pricing.yearly.toLocaleString()}`}
      yearlySaving={pricing.yearlySaving}
      subscription={
        sub
          ? {
              id: sub.id,
              plan: sub.plan,
              status: sub.status,
              interval: sub.interval as "monthly" | "yearly",
              amount: sub.amount,
              currency: sub.currency,
              endDate: sub.endDate?.toISOString() ?? null,
              provider: sub.provider,
              createdAt: sub.createdAt.toISOString(),
            }
          : null
      }
      history={history.map((h) => ({
        id: h.id,
        plan: h.plan,
        status: h.status,
        interval: h.interval as "monthly" | "yearly",
        amount: h.amount,
        currency: h.currency,
        endDate: h.endDate?.toISOString() ?? null,
        provider: h.provider,
        createdAt: h.createdAt.toISOString(),
      }))}
      userEmail={session.user.email}
    />
  );
}
