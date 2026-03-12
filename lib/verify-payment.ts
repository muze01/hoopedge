import { PaystackAPI } from "@/lib/paystack";
import { FlutterwaveAPI } from "@/lib/flutterwave";
import { SubscriptionService } from "@/lib/subscription-service";
import { prisma } from "@/lib/db";
import { PRICING } from "@/lib/regions";

/**
 * Verifies a Paystack payment reference and creates a subscription if valid.
 * Safe to call multiple times. Idempotent via providerSubId check.
 * Used by both analytics/page.tsx and billing/page.tsx after successful payment.
 */
// export async function verifyAndCreateSubscription(
//   reference: string,
// ): Promise<{ success: boolean; alreadyProcessed?: boolean; error?: string }> {
//   try {
//     // Idempotency, webhook or a previous page load may have already handled this
//     const existing = await prisma.subscription.findFirst({
//       where: { providerSubId: reference },
//     });

//     if (existing) {
//       return { success: true, alreadyProcessed: true };
//     }

//     const response = await PaystackAPI.verifyTransaction(reference);

//     if (response.data.status !== "success") {
//       return { success: false, error: "Payment verification failed" };
//     }

//     const { data } = response;
//     const metadata = data.metadata;

//     if (!metadata?.userId) {
//       return { success: false, error: "No user ID in transaction" };
//     }

//     const endDate = new Date();
//     if (metadata.interval === "annually") {
//       endDate.setFullYear(endDate.getFullYear() + 1);
//     } else {
//       endDate.setMonth(endDate.getMonth() + 1);
//     }

//     await SubscriptionService.createSubscription({
//       userId: metadata.userId,
//       plan: "PRO",
//       provider: "PAYSTACK",
//       providerSubId: reference,
//       providerCustomerId:
//         data.customer?.customer_code || data.customer?.id?.toString(),
//       amount: data.amount / 100,
//       currency: "NGN",
//       interval: metadata.interval === "annually" ? "yearly" : "monthly",
//       endDate,
//     });

//     return { success: true };
//   } catch (error) {
//     console.error("verifyAndCreateSubscription error:", error);
//     return { success: false, error: "Failed to verify payment" };
//   }
// }


/**
 * Verifies a Flutterwave transaction and creates a subscription if valid.
 * Safe to call multiple times - idempotent via providerSubId check.
 * Used by billing/page.tsx and analytics/page.tsx after redirect from checkout.
 *
 * userId is extracted from tx_ref (hoopedge_{timestamp}_{userId}).
 * interval is derived by matching the charged amount against PRICING config.
 * Flutterwave's meta field is always empty in both webhooks and verify responses.
 */
export async function verifyAndCreateSubscription(
  transactionId: string,
): Promise<{ success: boolean; alreadyProcessed?: boolean; error?: string }> {
  try {
    // Idempotency - webhook may have already handled this before redirect landed
    const existing = await prisma.subscription.findFirst({
      where: { providerSubId: transactionId },
    });

    if (existing) {
      return { success: true, alreadyProcessed: true };
    }

    const response = await FlutterwaveAPI.verifyTransaction(transactionId);

    if (
      response.status !== "success" ||
      response.data?.status !== "successful"
    ) {
      return { success: false, error: "Payment verification failed" };
    }

    const { data } = response;

    // Extract userId from tx_ref 
    // tx_ref format: hoopedge_{timestamp}_{userId}
    const tx_ref: string = data.tx_ref ?? "";
    if (!tx_ref.startsWith("hoopedge_")) {
      return { success: false, error: "Unrecognised transaction reference" };
    }

    const parts = tx_ref.split("_");
    const userId = parts.length >= 3 ? parts.slice(2).join("_") : null;

    if (!userId) {
      return {
        success: false,
        error: "Could not extract user from transaction reference",
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const chargedAmount: number = data.amount;
    const chargedCurrency: string = data.currency ?? "NGN";

    const pricingForCurrency = PRICING[chargedCurrency as keyof typeof PRICING];
    const interval: "monthly" | "yearly" =
      pricingForCurrency && chargedAmount === pricingForCurrency.yearly
        ? "yearly"
        : "monthly";

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
      providerSubId: String(data.id),
      providerCustomerId: data.customer?.email,
      flwPlanSubscriptionId: data.plan_subscription_id
        ? String(data.plan_subscription_id)
        : undefined,
      amount: chargedAmount,
      currency: chargedCurrency,
      interval,
      endDate,
    });

    return { success: true };
  } catch (error) {
    console.error("verifyAndCreateSubscription error:", error);
    return { success: false, error: "Failed to verify payment" };
  }
}