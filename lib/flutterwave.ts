if (
  process.env.NODE_ENV === "production" &&
  !process.env.FLUTTERWAVE_SECRET_KEY_PROD
) {
  throw new Error("FLUTTERWAVE_SECRET_KEY_PROD is not set");
}

if (
  process.env.NODE_ENV === "development" &&
  !process.env.FLUTTERWAVE_SECRET_KEY_LOCAL
) {
  throw new Error("FLUTTERWAVE_SECRET_KEY_LOCAL is not set");
}

export const FLUTTERWAVE_CONFIG = {
  secretKey:
    process.env.NODE_ENV === "production"
      ? process.env.FLUTTERWAVE_SECRET_KEY_PROD
      : process.env.FLUTTERWAVE_SECRET_KEY_LOCAL,
  publicKey:
    process.env.NODE_ENV === "production"
      ? process.env.FLUTTERWAVE_PUBLIC_KEY_PROD
      : process.env.FLUTTERWAVE_PUBLIC_KEY_LOCAL,
  webhookSecretHash:
    process.env.NODE_ENV === "production"
      ? process.env.FLUTTERWAVE_WEBHOOK_SECRET_HASH_PROD
      : process.env.FLUTTERWAVE_WEBHOOK_SECRET_HASH_LOCAL,
  baseUrl: "https://api.flutterwave.com/v3",
} as const;

export const FLUTTERWAVE_PLANS = {
  NGN: {
    monthly: {
      planId:
        process.env.NODE_ENV === "production"
          ? process.env.FLUTTERWAVE_PLAN_ID_NGN_MONTHLY_PROD
          : process.env.FLUTTERWAVE_PLAN_ID_NGN_MONTHLY_LOCAL,
      currency: "NGN",
      interval: "monthly" as const,
    },
    yearly: {
      planId:
        process.env.NODE_ENV === "production"
          ? process.env.FLUTTERWAVE_PLAN_ID_NGN_YEARLY_PROD
          : process.env.FLUTTERWAVE_PLAN_ID_NGN_YEARLY_LOCAL,
      currency: "NGN",
      interval: "yearly" as const,
    },
  },
  USD: {
    monthly: {
      planId:
        process.env.NODE_ENV === "production"
          ? process.env.FLUTTERWAVE_PLAN_ID_USD_MONTHLY_PROD
          : process.env.FLUTTERWAVE_PLAN_ID_USD_MONTHLY_LOCAL,
      currency: "USD",
      interval: "monthly" as const,
    },
    yearly: {
      planId:
        process.env.NODE_ENV === "production"
          ? process.env.FLUTTERWAVE_PLAN_ID_USD_YEARLY_PROD
          : process.env.FLUTTERWAVE_PLAN_ID_USD_YEARLY_LOCAL,
      currency: "USD",
      interval: "yearly" as const,
    },
  },
  GBP: {
    monthly: {
      planId:
        process.env.NODE_ENV === "production"
          ? process.env.FLUTTERWAVE_PLAN_ID_GBP_MONTHLY_PROD
          : process.env.FLUTTERWAVE_PLAN_ID_GBP_MONTHLY_LOCAL,
      currency: "GBP",
      interval: "monthly" as const,
    },
    yearly: {
      planId:
        process.env.NODE_ENV === "production"
          ? process.env.FLUTTERWAVE_PLAN_ID_GBP_YEARLY_PROD
          : process.env.FLUTTERWAVE_PLAN_ID_GBP_YEARLY_LOCAL,
      currency: "GBP",
      interval: "yearly" as const,
    },
  },
} as const;

export type FlutterwaveCurrency = keyof typeof FLUTTERWAVE_PLANS;

export class FlutterwaveAPI {
  private static async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${FLUTTERWAVE_CONFIG.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${FLUTTERWAVE_CONFIG.secretKey}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Flutterwave API error");
    }

    return data;
  }

  static async verifyTransaction(transactionId: number | string) {
    return this.request(`/transactions/${transactionId}/verify`);
  }

  /**
   * Cancel a Flutterwave plan subscription to stop future automatic charges.
   * @param planId - The payment plan ID from FLUTTERWAVE_PLANS
   * @param flwSubscriptionId - The per-user plan subscription ID stored as flwPlanSubscriptionId on the subscription record
   */
  static async cancelPlanSubscription(
    planId: string,
    flwSubscriptionId: string,
  ) {
    return this.request(
      `/payment-plans/${planId}/subscriptions/${flwSubscriptionId}/cancel`,
      { method: "PUT" },
    );
  }

  /**
   * Verify webhook authenticity.
   * Flutterwave sends the plain secret hash in the `verif-hash` header.
   */
  static verifyWebhook(incomingHash: string): boolean {
    if (!FLUTTERWAVE_CONFIG.webhookSecretHash) {
      throw new Error("FLUTTERWAVE_WEBHOOK_SECRET_HASH is not configured");
    }
    return incomingHash === FLUTTERWAVE_CONFIG.webhookSecretHash;
  }
}
