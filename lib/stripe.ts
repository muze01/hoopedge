import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-12-15.clover",
  typescript: true,
});

export const STRIPE_PLANS = {
  PRO_MONTHLY: {
    priceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
    amount: 2900, // $29.00
    currency: "usd",
    interval: "month",
  },
  PRO_YEARLY: {
    priceId: process.env.STRIPE_PRO_YEARLY_PRICE_ID!,
    amount: 29000, // $290.00 (save $58)
    currency: "usd",
    interval: "year",
  },
} as const;
