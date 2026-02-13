"use client";

import { ManageSubscriptionButton } from "./ManageSubscriptionButton";

interface SubscriptionStatusBadgeProps {
  role: "FREE" | "PRO" | "ADMIN";
  subscription?: {
    status: "ACTIVE" | "CANCELLED" | "EXPIRED" | "TRIAL";
    endDate: Date | null;
    provider: "STRIPE" | "PAYSTACK" | "FLUTTERWAVE" | "MANUAL";
  } | null;
}

export function SubscriptionStatusBadge({
  role,
  subscription,
}: SubscriptionStatusBadgeProps) {
  if (role === "FREE") {
    return (
      <div className="bg-gray-100 border border-gray-300 rounded-lg px-4 py-2">
        <span className="text-sm font-medium text-gray-700">Free Plan</span>
      </div>
    );
  }

  if (!subscription) {
    return null;
  }

  const endDate = subscription.endDate ? new Date(subscription.endDate) : null;
  const isExpiringSoon =
    endDate && endDate.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000; // 7 days

  return (
    <div className="flex items-center gap-3">
      {/* Status Badge */}
      <div
        className={`rounded-lg px-4 py-2 ${
          subscription.status === "ACTIVE"
            ? "bg-green-100 border border-green-300"
            : subscription.status === "CANCELLED"
              ? "bg-yellow-100 border border-yellow-300"
              : "bg-gray-100 border border-gray-300"
        }`}
      >
        <div className="flex flex-col">
          <span
            className={`text-sm font-semibold ${
              subscription.status === "ACTIVE"
                ? "text-green-700"
                : subscription.status === "CANCELLED"
                  ? "text-yellow-700"
                  : "text-gray-700"
            }`}
          >
            {subscription.status === "ACTIVE" && "Pro • Active"}
            {subscription.status === "CANCELLED" && "Pro • Cancelled"}
            {subscription.status === "EXPIRED" && "Expired"}
          </span>

          {endDate && (
            <span
              className={`text-xs ${
                subscription.status === "CANCELLED"
                  ? "text-yellow-600"
                  : isExpiringSoon
                    ? "text-orange-600"
                    : "text-gray-600"
              }`}
            >
              {subscription.status === "CANCELLED"
                ? `Access until ${endDate.toLocaleDateString()}`
                : subscription.status === "ACTIVE"
                  ? `Renews ${endDate.toLocaleDateString()}`
                  : `Ended ${endDate.toLocaleDateString()}`}
            </span>
          )}
        </div>
      </div>

      {/* Manage Button (only for STRIPE/PAYSTACK) */}
      {(subscription.provider === "STRIPE" ||
        subscription.provider === "PAYSTACK") && (
        <ManageSubscriptionButton
          provider={subscription.provider}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline"
        />
      )}
    </div>
  );
}
