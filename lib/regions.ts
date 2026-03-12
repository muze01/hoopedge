export type SupportedCurrency = "NGN" | "USD" | "GBP";

/**
 * Derive the billing currency from a country code.
 *
 * - Nigeria -> NGN (native Naira pricing)
 * - United Kingdom -> GBP
 * - Everyone else (including all other African countries) -> USD
 *   Flutterwave handles card conversion on their end at checkout.
 */
export function getCurrencyForCountry(country: string): SupportedCurrency {
  if (country === "NG") return "NGN";
  if (country === "GB") return "GBP";
  return "USD";
}

/**
 * Pricing config per currency.
 */
export const PRICING: Record<
  SupportedCurrency,
  {
    symbol: string;
    monthly: number;
    yearly: number;
    yearlySaving: string;
  }
> = {
  NGN: {
    symbol: "₦",
    monthly: 10000,
    yearly: 100000,
    yearlySaving: "₦20,000",
  },
  USD: {
    symbol: "$",
    monthly: 10,
    yearly: 100,
    yearlySaving: "$20",
  },
  GBP: {
    symbol: "£",
    monthly: Number(process.env.PRICE_GBP_MONTHLY ?? 8),
    yearly: Number(process.env.PRICE_GBP_YEARLY ?? 80),
    yearlySaving: process.env.PRICE_GBP_YEARLY_SAVING ?? "£16",
  },
};
