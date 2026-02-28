import { PaystackAPI } from "@/lib/paystack";
import { SubscriptionService } from "@/lib/subscription-service";
import { prisma } from "@/lib/db";

/**
 * Verifies a Paystack payment reference and creates a subscription if valid.
 * Safe to call multiple times. Idempotent via providerSubId check.
 * Used by both analytics/page.tsx and billing/page.tsx after successful payment.
 */
export async function verifyAndCreateSubscription(
  reference: string,
): Promise<{ success: boolean; alreadyProcessed?: boolean; error?: string }> {
  try {
    // Idempotency, webhook or a previous page load may have already handled this
    const existing = await prisma.subscription.findFirst({
      where: { providerSubId: reference },
    });

    if (existing) {
      return { success: true, alreadyProcessed: true };
    }

    const response = await PaystackAPI.verifyTransaction(reference);

    if (response.data.status !== "success") {
      return { success: false, error: "Payment verification failed" };
    }

    const { data } = response;
    const metadata = data.metadata;

    if (!metadata?.userId) {
      return { success: false, error: "No user ID in transaction" };
    }

    const endDate = new Date();
    if (metadata.interval === "annually") {
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
        data.customer?.customer_code || data.customer?.id?.toString(),
      amount: data.amount / 100,
      currency: "NGN",
      interval: metadata.interval === "annually" ? "yearly" : "monthly",
      endDate,
    });

    return { success: true };
  } catch (error) {
    console.error("verifyAndCreateSubscription error:", error);
    return { success: false, error: "Failed to verify payment" };
  }
}
