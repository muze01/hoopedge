import crypto from "crypto";

if (!process.env.PAYSTACK_SECRET_KEY) {
  throw new Error("PAYSTACK_SECRET_KEY is not set");
}

export const PAYSTACK_CONFIG = {
  secretKey: process.env.PAYSTACK_SECRET_KEY,
  publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
  baseUrl: "https://api.paystack.co",
} as const;

export const PAYSTACK_PLANS = {
  PRO_MONTHLY: {
    planCode: process.env.PAYSTACK_PRO_MONTHLY_PLAN_CODE!,
    amount: 15000, // ₦15,000
    currency: "NGN",
    interval: "monthly",
  },
  PRO_YEARLY: {
    planCode: process.env.PAYSTACK_PRO_YEARLY_PLAN_CODE!,
    amount: 150000, // ₦150,000 (save ₦30,000)
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

  static async initializeTransaction(params: {
    email: string;
    amount: number;
    plan?: string;
    metadata?: Record<string, any>;
    callback_url?: string;
  }) {
    return this.request("/transaction/initialize", {
      method: "POST",
      body: JSON.stringify(params),
    });
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
    const hash = crypto
      .createHmac("sha512", PAYSTACK_CONFIG.secretKey)
      .update(body)
      .digest("hex");
    return hash === signature;
  }
}
