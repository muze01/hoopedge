import crypto from "crypto";

if (
  process.env.NODE_ENV === "production" &&
  !process.env.PAYSTACK_SECRET_KEY_PROD
) {
  throw new Error("PAYSTACK_SECRET_KEY is not set");
}

if (
  process.env.NODE_ENV === "development" &&
  !process.env.PAYSTACK_SECRET_KEY_LOCAL
) {
  throw new Error("PAYSTACK_SECRET_KEY is not set");
}

export const PAYSTACK_CONFIG = {
  secretKey:
    process.env.NODE_ENV === "production"
      ? process.env.PAYSTACK_SECRET_KEY_PROD
      : process.env.PAYSTACK_SECRET_KEY_LOCAL,
  publicKey:
    process.env.NODE_ENV === "production"
      ? process.env.PAYSTACK_PUBLIC_KEY_PROD
      : process.env.PAYSTACK_PUBLIC_KEY_LOCAL,
  baseUrl: "https://api.paystack.co",
} as const;

export const PAYSTACK_PLANS = {
  PRO_MONTHLY: {
    planCode:
      process.env.NODE_ENV === "production"
        ? process.env.PAYSTACK_PRO_MONTHLY_PLAN_CODE_PROD
        : process.env.PAYSTACK_PRO_MONTHLY_PLAN_CODE_LOCAL,
    amount: 10000, // ₦10,000
    currency: "NGN",
    interval: "monthly",
  },
  PRO_YEARLY: {
    planCode:
      process.env.NODE_ENV === "production"
        ? process.env.PAYSTACK_PRO_YEARLY_PLAN_CODE_PROD
        : process.env.PAYSTACK_PRO_YEARLY_PLAN_CODE_LOCAL,
    amount: 100000, // ₦100,000 (saves ₦20,000 = 20% off)
    currency: "NGN",
    interval: "annually",
  },
} as const;

export class PaystackAPI {
  private static async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${PAYSTACK_CONFIG.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${PAYSTACK_CONFIG.secretKey}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Paystack API error");
    }

    return data;
  }

  static async verifyTransaction(reference: string) {
    return this.request(`/transaction/verify/${reference}`);
  }

  static async createSubscription(params: {
    customer: string;
    plan: string;
    authorization: string;
  }) {
    return this.request("/subscription", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  static async cancelSubscription(code: string, token: string) {
    return this.request("/subscription/disable", {
      method: "POST",
      body: JSON.stringify({ code, token }),
    });
  }

  static verifyWebhook(body: string, signature: string): boolean {
    if (!PAYSTACK_CONFIG.secretKey) {
      throw new Error("PAYSTACK_SECRET_KEY is not configured");
    }
    const hash = crypto
      .createHmac("sha512", PAYSTACK_CONFIG.secretKey)
      .update(body)
      .digest("hex");
    return hash === signature;
  }
}
