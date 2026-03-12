"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export function usePaymentSuccess() {
  const searchParams = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);
  const [paymentReference, setPaymentReference] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  useEffect(() => {
    const success = searchParams.get("success");
    // const reference = searchParams.get("reference");
    const txId = searchParams.get("transaction_id");

    if (success === "true" && txId) {
      setShowSuccess(true);
      // setPaymentReference(txId);
      setTransactionId(txId);

      // Remove query params from URL (success=true) without page reload
      const timer = setTimeout(() => {
        const url = new URL(window.location.href);
        url.searchParams.delete("success");
        // url.searchParams.delete("reference");
        url.searchParams.delete("transaction_id");
        url.searchParams.delete("tx_ref");
        window.history.replaceState({}, "", url.pathname);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const handleClose = () => {
    setShowSuccess(false);
    // setPaymentReference(null);
    setTransactionId(null);
  };

  return {
    showSuccess,
    // paymentReference,
    transactionId,
    handleClose,
  };
}
