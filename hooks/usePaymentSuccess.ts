"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export function usePaymentSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);
  const [paymentReference, setPaymentReference] = useState<string | null>(null);

  useEffect(() => {
    const success = searchParams.get("success");
    const reference = searchParams.get("reference");

    if (success === "true" && reference) {
      setShowSuccess(true);
      setPaymentReference(reference);

      // Clean up URL after showing toast (optional)
      const timer = setTimeout(() => {
        // Remove query params from URL without page reload
        const url = new URL(window.location.href);
        url.searchParams.delete("success");
        url.searchParams.delete("reference");
        window.history.replaceState({}, "", url.pathname);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const handleClose = () => {
    setShowSuccess(false);
    setPaymentReference(null);
  };

  return {
    showSuccess,
    paymentReference,
    handleClose,
  };
}
