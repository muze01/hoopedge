"use client";

import { useState, useEffect } from "react";
import type { FlutterwaveResponse } from "@/lib/flutterwave-inline";
import type { SupportedCurrency } from "@/lib/regions";

interface FlutterwaveCheckoutButtonProps {
  plan: "monthly" | "yearly";
  email: string;
  currency: SupportedCurrency;
  className?: string;
  children?: React.ReactNode;
  redirectTo?: string;
}

export function FlutterwaveCheckoutButton({
  plan,
  email,
  currency,
  className = "",
  children,
  redirectTo = "/analytics",
}: FlutterwaveCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    const checkScript = setInterval(() => {
      if (window.FlutterwaveCheckout) {
        setScriptLoaded(true);
        clearInterval(checkScript);
      }
    }, 100);

    return () => clearInterval(checkScript);
  }, []);

  const handleCheckout = async () => {
    if (!scriptLoaded || !window.FlutterwaveCheckout) {
      alert("Payment system is loading. Please try again in a moment.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/flutterwave/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, currency }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to initialize payment");
      }

      window.FlutterwaveCheckout({
        public_key: data.publicKey,
        tx_ref: data.txRef,
        amount: data.amount,
        currency: data.currency,
        payment_plan: data.planId,
        payment_options: "card, banktransfer, ussd, mobilemoney",
        meta: data.meta,
        customer: {
          email,
          name: data.meta.userName ?? undefined,
        },
        customizations: {
          title: "HoopEdge Pro",
          description: `Pro ${plan} subscription`,
          // logo: "https://hoopedge.vercel.app/uploads/favicon_512.png",
          logo: "https://raw.githubusercontent.com/muze01/hoopedge/main/public/uploads/favicon_512.png",
        },
        callback: (transaction: FlutterwaveResponse) => {
          if (transaction.status === "successful") {
            window.location.href = `${redirectTo}?success=true&transaction_id=${transaction.transaction_id}&tx_ref=${transaction.tx_ref}`;
          } else {
            alert("Payment was not completed. Please try again.");
            setLoading(false);
          }
        },
        onclose: () => {
          setLoading(false);
        },
      });

      setLoading(false);
    } catch (error) {
      console.error("Payment initialization error:", error);
      alert("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading || !scriptLoaded}
      className={className}
    >
      {loading
        ? "Processing..."
        : !scriptLoaded
          ? "Loading..."
          : children || "Subscribe with Flutterwave"}
    </button>
  );
}
