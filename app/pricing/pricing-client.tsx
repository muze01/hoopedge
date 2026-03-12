"use client";

import { useState } from "react";
import { Check, Zap } from "lucide-react";
import { FlutterwaveCheckoutButton } from "@/components/FlutterwaveCheckoutButton";
import { PRICING, type SupportedCurrency } from "@/lib/regions";

interface PricingClientProps {
  currency: SupportedCurrency;
  userEmail: string | null;
}

export default function PricingClient({
  currency,
  userEmail,
}: PricingClientProps) {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  const pricing = PRICING[currency];
  const displayPrice =
    billing === "monthly"
      ? `${pricing.symbol}${pricing.monthly.toLocaleString()}`
      : `${pricing.symbol}${pricing.yearly.toLocaleString()}`;
  const perLabel = billing === "monthly" ? "/month" : "/year";

  return (
    <>
      <style>{`
        @keyframes glow-pulse {
          0%, 100% {
            box-shadow:
              0 0 8px 2px rgba(250, 204, 21, 0.5),
              0 0 20px 4px rgba(250, 204, 21, 0.3),
              0 0 40px 8px rgba(250, 204, 21, 0.15);
          }
          50% {
            box-shadow:
              0 0 14px 4px rgba(250, 204, 21, 0.8),
              0 0 30px 8px rgba(250, 204, 21, 0.5),
              0 0 60px 16px rgba(250, 204, 21, 0.25);
          }
        }

        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .yearly-btn {
          position: relative;
          animation: glow-pulse 2s ease-in-out infinite;
          border: 2px solid rgba(250, 204, 21, 0.9) !important;
          background: linear-gradient(
            135deg,
            rgba(30, 58, 138, 0.95) 0%,
            rgba(17, 24, 39, 0.98) 50%,
            rgba(30, 58, 138, 0.95) 100%
          ) !important;
          color: #fde68a !important;
          transition: transform 0.15s ease, box-shadow 0.15s ease !important;
        }

        .yearly-btn:hover {
          transform: scale(1.06);
          box-shadow:
            0 0 20px 6px rgba(250, 204, 21, 1),
            0 0 50px 12px rgba(250, 204, 21, 0.6),
            0 0 80px 20px rgba(250, 204, 21, 0.3) !important;
          animation: none;
        }

        .yearly-btn:active { transform: scale(0.98); }

        .monthly-btn {
          transition: all 0.2s ease;
          border: 2px solid transparent !important;
        }

        .monthly-btn:hover { border-color: rgba(255,255,255,0.3) !important; }

        .monthly-btn.active {
          background: rgba(255,255,255,0.15) !important;
          border-color: rgba(255,255,255,0.5) !important;
          color: white !important;
        }

        .save-badge {
          background: linear-gradient(90deg, #facc15, #f59e0b, #facc15);
          background-size: 200% auto;
          animation: shimmer 2.5s linear infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 800;
        }
      `}</style>

      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-7xl mx-auto mt-10">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h1>
            <p className="text-l text-gray-600 sm:text-lg max-w-xl mx-auto">
              Unlock powerful basketball analytics insights & identify
              consistent first-half scoring patterns
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200">
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  Free
                </h2>
                <div className="flex items-baseline">
                  <span className="text-4xl sm:text-5xl font-bold text-gray-900">
                    {pricing.symbol}0
                  </span>
                  <span className="text-gray-600 ml-2 text-sm sm:text-base">
                    /month
                  </span>
                </div>
              </div>

              <ul className="space-y-4 mb-8 text-sm sm:text-base">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 shrink-0" />
                  <span className="text-gray-700">
                    Access to team performance charts and tables
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 shrink-0" />
                  <span className="text-gray-700">Home & Away statistics</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 shrink-0" />
                  <span className="text-gray-700">Last N games filtering</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 shrink-0" />
                  <span className="text-gray-700">1 league access</span>
                </li>
              </ul>
            </div>

            {/* Pro Plan */}
            <div className="bg-linear-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-xl p-6 sm:p-8 border-2 border-blue-700 relative">
              <div className="absolute top-0 right-0 bg-yellow-400 text-gray-900 px-4 py-1 rounded-bl-lg rounded-tr-xl font-bold text-xs sm:text-sm">
                POPULAR
              </div>

              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
                  Pro
                </h2>

                {/* Billing Toggle */}
                <div className="flex items-center gap-3 mb-6">
                  <button
                    onClick={() => setBilling("monthly")}
                    className={`monthly-btn flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm cursor-pointer ${
                      billing === "monthly"
                        ? "active text-white"
                        : "bg-blue-800/50 text-blue-200 hover:text-white"
                    }`}
                  >
                    Monthly
                  </button>

                  <button
                    onClick={() => setBilling("yearly")}
                    className={`yearly-btn flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm cursor-pointer flex items-center justify-center gap-2 ${
                      billing === "yearly" ? "ring-2 ring-yellow-300/50" : ""
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    <span>Yearly</span>
                    <span className="save-badge text-xs">Save 20%</span>
                  </button>
                </div>

                <div className="flex items-baseline">
                  <span className="text-4xl sm:text-5xl font-bold text-white transition-all duration-300">
                    {displayPrice}
                  </span>
                  <span className="text-blue-100 ml-2 text-sm sm:text-base">
                    {perLabel}
                  </span>
                </div>

                {billing === "yearly" && (
                  <p className="text-yellow-300 text-xs mt-1 font-medium">
                    🎉 You save {pricing.yearlySaving} annually
                  </p>
                )}
              </div>

              <ul className="space-y-4 mb-8 text-sm sm:text-base">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-yellow-300 mr-3 mt-0.5 shrink-0" />
                  <span className="text-white font-medium">
                    Everything in Free, plus:
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-yellow-300 mr-3 mt-0.5 shrink-0" />
                  <span className="text-white">
                    <strong>Odds Analysis</strong> - Distribution charts and
                    team recurrence
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-yellow-300 mr-3 mt-0.5 shrink-0" />
                  <span className="text-white">
                    <strong>Matchup Analyzer</strong> - Head-to-head predictions
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-yellow-300 mr-3 mt-0.5 shrink-0" />
                  <span className="text-white">
                    <strong>Team Analytics</strong> - Team specific charts and
                    analysis
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-yellow-300 mr-3 mt-0.5 shrink-0" />
                  <span className="text-white">Unlimited league access</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-yellow-300 mr-3 mt-0.5 shrink-0" />
                  <span className="text-white">Full historical data</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-yellow-300 mr-3 mt-0.5 shrink-0" />
                  <span className="text-white">Priority support</span>
                </li>
              </ul>

              {userEmail ? (
                // <PaystackCheckoutButton
                //   plan={billing}
                //   email={userEmail}
                //   className="w-full px-6 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow-lg cursor-pointer"
                // >
                //   Upgrade to Pro
                // </PaystackCheckoutButton>

                <FlutterwaveCheckoutButton
                  plan={billing}
                  email={userEmail}
                  currency={currency}
                  className="w-full px-6 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow-lg cursor-pointer"
                >
                  Upgrade to Pro
                </FlutterwaveCheckoutButton>
              ) : (
                <a
                  href="/auth"
                  className="block w-full px-6 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow-lg cursor-pointer text-center"
                >
                  Sign in to Upgrade
                </a>
              )}
            </div>
          </div>

          <div className="mt-12 text-center text-sm">
            <p className="text-gray-600">
              All plans include secure data storage and regular updates
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
