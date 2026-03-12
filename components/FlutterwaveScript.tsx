"use client";

import { useEffect } from "react";

export function FlutterwaveScript() {
  useEffect(() => {
    if (document.querySelector('script[src*="flutterwave"]')) {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.flutterwave.com/v3.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      const existingScript = document.querySelector(
        'script[src*="flutterwave"]',
      );
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  return null;
}
