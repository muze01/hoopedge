import { Check } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { StripeCheckoutButton } from "@/components/StripeCheckoutButton";
import { PaystackCheckoutButton } from "@/components/PaystackCheckoutButton";

export default async function PricingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Detect user location (you can use a service or IP-based detection)
  const isNigerian = false; // TODO: Replace with actual detection logic

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-7xl mx-auto mt-10">
        <div className="text-center mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-l text-gray-600 sm:text-lg max-w-xl mx-auto">
            Unlock powerful basketball analytics insights
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
                  {/* if nigeria is true then we show in local currency, ultimately track country currency and display in denomination */}
                  $0
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

            {/* <Link
              href="/analytics"
              className="block w-full text-center px-6 py-3 bg-gray-200 text-gray-900 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
            >
              Current Plan
            </Link> */}
          </div>

          {/* Pro Plan */}
          <div className="bg-linear-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-xl p-6 sm:p-8 border-2 border-blue-700 relative">
            <div className="absolute top-0 right-0 bg-yellow-400 text-gray-900 px-4 py-1 rounded-bl-lg rounded-tr-xl font-bold text-xs sm:text-sm">
              POPULAR
            </div>

            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Pro
              </h2>
              <div className="flex items-baseline">
                <span className="text-4xl sm:text-5xl font-bold text-white">
                  {/* if nigeria is true then we show in local currency, ultimately track country currency and display in denomination */}
                  $29
                </span>
                <span className="text-blue-100 ml-2 text-sm sm:text-base">
                  /month
                </span>
              </div>
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
                  <strong>Odds Analysis</strong> - Distribution charts and team
                  recurrence
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

            {isNigerian && session ? (
              <PaystackCheckoutButton
                plan="monthly"
                email={session.user.email}
                className="w-full px-6 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow-lg cursor-pointer"
              >
                Upgrade to Pro
              </PaystackCheckoutButton>
            ) : (
              <StripeCheckoutButton
                plan="monthly"
                className="w-full px-6 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow-lg cursor-pointer"
              >
                Upgrade to Pro
              </StripeCheckoutButton>
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
  );
}
