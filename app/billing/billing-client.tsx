"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { PaystackCheckoutButton } from "@/components/PaystackCheckoutButton";

interface Subscription {
  id: string;
  plan: string;
  status: string;
  interval: "monthly" | "yearly";
  amount: number | null;
  currency: string | null;
  endDate: string | null;
  provider: string | null;
  createdAt: string;
}

interface BillingClientProps {
  subscription: Subscription | null;
  history: Subscription[];
  userEmail: string;
}

const STATUS_CONFIG = {
  ACTIVE: {
    label: "Active",
    color: "text-green-600 bg-green-50 border-green-200",
    icon: CheckCircle,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "text-yellow-600 bg-yellow-50 border-yellow-200",
    icon: Clock,
  },
  EXPIRED: {
    label: "Expired",
    color: "text-red-600 bg-red-50 border-red-200",
    icon: XCircle,
  },
  TRIAL: {
    label: "Trial",
    color: "text-blue-600 bg-blue-50 border-blue-200",
    icon: CheckCircle,
  },
} as const;

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatAmount(amount: number | null, currency: string | null) {
  if (!amount) return "—";
  if (currency === "NGN") return `₦${amount.toLocaleString()}`;
  return `$${amount.toLocaleString()}`;
}

export function BillingClient({
  subscription,
  history,
  userEmail,
}: BillingClientProps) {
  const router = useRouter();
  const [cancelling, setCancelling] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    setCancelling(true);
    setError(null);

    try {
      const res = await fetch("/api/subscription", { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to cancel");

      router.refresh();
      setShowConfirm(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCancelling(false);
    }
  };

  const statusConfig = subscription
    ? STATUS_CONFIG[subscription.status as keyof typeof STATUS_CONFIG]
    : null;

  const StatusIcon = statusConfig?.icon;

  // Show upgrade to yearly when:
  // 1. Active monthly, can upgrade anytime
  // 2. Cancelled monthly, still within access period, can upgrade to save money on re-sub
  const isMonthly = subscription?.interval === "monthly";
  const isActiveMonthly = subscription?.status === "ACTIVE" && isMonthly;
  const isCancelledMonthlyWithAccess =
    subscription?.status === "CANCELLED" &&
    isMonthly &&
    subscription.endDate !== null &&
    new Date(subscription.endDate) > new Date();

  const showUpgradeToYearly = isActiveMonthly || isCancelledMonthlyWithAccess;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your subscription and billing history
          </p>
        </div>

        {/* Current Plan Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-gray-400" />
            <h2 className="font-semibold text-gray-900">Current Plan</h2>
          </div>

          <div className="p-6">
            {subscription ? (
              <div className="space-y-4">
                {/* Plan title + status badge */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">
                      {subscription.plan} Plan
                    </span>
                    <span className="ml-2 text-sm text-gray-500 capitalize">
                      · {subscription.interval}
                    </span>
                  </div>
                  {statusConfig && StatusIcon && (
                    <span
                      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${statusConfig.color}`}
                    >
                      <StatusIcon className="w-3.5 h-3.5" />
                      {statusConfig.label}
                    </span>
                  )}
                </div>

                {/* Plan details grid */}
                <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                      Amount
                    </p>
                    <p className="font-semibold text-gray-900">
                      {formatAmount(subscription.amount, subscription.currency)}
                      <span className="text-gray-400 font-normal text-sm">
                        /{subscription.interval === "yearly" ? "yr" : "mo"}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                      {subscription.status === "CANCELLED"
                        ? "Access Until"
                        : "Next Billing"}
                    </p>
                    <p className="font-semibold text-gray-900 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {formatDate(subscription.endDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                      Provider
                    </p>
                    <p className="font-semibold text-gray-900 capitalize">
                      {subscription.provider?.toLowerCase() ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                      Started
                    </p>
                    <p className="font-semibold text-gray-900">
                      {formatDate(subscription.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Cancelled warning */}
                {subscription.status === "CANCELLED" && (
                  <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-yellow-700">
                      Your subscription is cancelled. You keep Pro access until{" "}
                      <strong>{formatDate(subscription.endDate)}</strong>, then
                      you'll be moved to the Free plan.
                    </p>
                  </div>
                )}

                {/* Upgrade to yearly for active or cancelled monthly */}
                {showUpgradeToYearly && (
                  <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl p-4 gap-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <Zap className="w-4 h-4 text-blue-600 fill-blue-600 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-blue-900">
                          Switch to Yearly
                        </p>
                        <p className="text-xs text-blue-600">
                          ₦100,000/yr · Save ₦20,000
                        </p>
                      </div>
                    </div>
                    <PaystackCheckoutButton
                      plan="yearly"
                      email={userEmail}
                      redirectTo="/billing"
                      className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer shrink-0"
                    >
                      Upgrade
                    </PaystackCheckoutButton>
                  </div>
                )}

                {/* Already on best plan */}
                {subscription.status === "ACTIVE" &&
                  subscription.interval === "yearly" && (
                    <p className="text-xs text-gray-400 text-center pt-1">
                      ✓ You're on the best plan available
                    </p>
                  )}

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                    {error}
                  </p>
                )}

                {/* Cancel, only for active subscriptions */}
                {subscription.status === "ACTIVE" && (
                  <div className="pt-2">
                    {!showConfirm ? (
                      <button
                        onClick={() => setShowConfirm(true)}
                        className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        Cancel Subscription
                      </button>
                    ) : (
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className="text-sm text-gray-600">Are you sure?</p>
                        <button
                          onClick={handleCancel}
                          disabled={cancelling}
                          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          {cancelling ? "Cancelling..." : "Yes, cancel"}
                        </button>
                        <button
                          onClick={() => setShowConfirm(false)}
                          className="px-4 py-2 text-sm font-medium text-gray-600 border bg-green-50 border-green-500 rounded-lg hover:bg-green-200 hover:text-black transition-colors cursor-pointer"
                        >
                          Keep Plan
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* No subscription. FREE user */
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Free Plan</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Upgrade to unlock all Pro features
                  </p>
                </div>
                <Link
                  href="/pricing"
                  className="inline-block px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Upgrade to Pro
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Billing History */}
        {history.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Billing History</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {history.map((item) => {
                const cfg =
                  STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG];
                return (
                  <div
                    key={item.id}
                    className="px-6 py-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {item.plan} · {item.interval}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDate(item.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatAmount(item.amount, item.currency)}
                      </span>
                      {cfg && (
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.color}`}
                        >
                          {cfg.label}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
