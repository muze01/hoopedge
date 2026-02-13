"use client";

import { useEffect } from "react";

export function PaystackScript() {
  useEffect(() => {
    // Check if script already exists
    if (document.querySelector('script[src*="paystack"]')) {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v2/inline.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup if needed
      const existingScript = document.querySelector('script[src*="paystack"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  return null;
}
