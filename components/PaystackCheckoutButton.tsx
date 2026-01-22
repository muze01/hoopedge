"use client";

import { useState, useEffect } from "react";

interface PaystackCheckoutButtonProps {
  plan: "monthly" | "yearly";
  email: string;
  className?: string;
  children?: React.ReactNode;
}

export function PaystackCheckoutButton({
  plan,
  email,
  className = "",
  children,
}: PaystackCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Check if Paystack script is loaded
    const checkScript = setInterval(() => {
      if (window.PaystackPop) {
        setScriptLoaded(true);
        clearInterval(checkScript);
      }
    }, 100);

    // Cleanup
    return () => clearInterval(checkScript);
  }, []);

  const handleCheckout = async () => {
    if (!scriptLoaded || !window.PaystackPop) {
      alert("Payment system is loading. Please try again in a moment.");
      return;
    }

    setLoading(true);

    try {
      // Initialize payment on backend
      const response = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to initialize payment");
      }

      // Use Paystack Inline
      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
        email: email,
        amount: data.amount, // Amount in kobo
        currency: "NGN",
        ref: data.reference,
        metadata: data.metadata,
        callback: function (response) {
          // Payment successful
          console.log("Payment successful:", response);
          window.location.href = `/analytics?success=true&reference=${response.reference}`;
        },
        onClose: function () {
          // User closed the payment modal
          console.log("Payment modal closed");
          setLoading(false);
        },
      });

      handler.openIframe();
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
          : children || "Subscribe with Paystack"}
    </button>
  );
}
