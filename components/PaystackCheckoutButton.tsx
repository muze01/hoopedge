"use client";

import { useState, useEffect } from "react";

interface PaystackCheckoutButtonProps {
  plan: "monthly" | "yearly";
  email: string;
  className?: string;
  children?: React.ReactNode;
  redirectTo?: string;
}

export function PaystackCheckoutButton({
  plan,
  email,
  className = "",
  children,
  redirectTo = "/analytics",
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

      // Create new Paystack instance
      const popup = new window.PaystackPop();

      // Use newTransaction method (synchronous)
      popup.newTransaction({
        key: data.publicKey,
        email: email,
        amount: data.amount, // Amount in kobo
        currency: "NGN",
        ref: data.reference,
        metadata: data.metadata,
        planCode: data.planCode,
        onSuccess: (transaction: any) => {
          // console.log("Payment successful:", transaction);
          // Redirect to analytics OR billing with success flag
          window.location.href = `${redirectTo}?success=true&reference=${transaction.reference}`;
        },
        onLoad: (response: any) => {
          // console.log("Transaction loaded:", response);
          setLoading(false); // Stop loading when popup shows
        },
        onCancel: () => {
          console.log("Payment cancelled by user");
          setLoading(false);
        },
        onError: (error: any) => {
          console.error("Payment error:", error);
          alert(`Payment failed: ${error.message}`);
          setLoading(false);
        },
      });
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
