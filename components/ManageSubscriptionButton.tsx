"use client";

import { useState } from "react";

interface ManageSubscriptionButtonProps {
  provider: "STRIPE" | "PAYSTACK";
  className?: string;
}

export function ManageSubscriptionButton({
  provider,
  className = "",
}: ManageSubscriptionButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleManage = async () => {
    setLoading(true);

    try {
      if (provider === "STRIPE") {
        const response = await fetch("/api/stripe/create-portal", {
          method: "POST",
        });

        const data = await response.json();

        if (data.success && data.url) {
          window.location.href = data.url;
        }
      } else if (provider === "PAYSTACK") {
        // Paystack doesn't have a built-in customer portal
        // You can build a custom one or redirect to your settings page
        window.location.href = "/settings/subscription";
      }
    } catch (error) {
      console.error("Error opening portal:", error);
      alert("Failed to open subscription management");
      setLoading(false);
    }
  };

  return (
    <button onClick={handleManage} disabled={loading} className={className}>
      {loading ? "Loading..." : "Manage Subscription"}
    </button>
  );
}
