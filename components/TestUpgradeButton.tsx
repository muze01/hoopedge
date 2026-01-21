"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * This is a temporary component for testing subscription upgrades and so-forth
 * TODO: BE SURE TO REMOVE THIS AND REPLACE WITH ACTUAL PAYMENT INTEGRATION
 */

export function TestUpgradeButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleUpgrade = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upgrade",
          plan: "PRO",
          durationDays: 30,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("✅ Upgraded to Pro! Refreshing...");
        setTimeout(() => {
          router.refresh();
        }, 1000);
      } else {
        setMessage("❌ " + (data.error || "Upgrade failed"));
      }
    } catch (error) {
      setMessage("❌ Error upgrading");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/subscription", {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setMessage("✅ Subscription cancelled! Refreshing...");
        setTimeout(() => {
          router.refresh();
        }, 1000);
      } else {
        setMessage("❌ " + (data.error || "Cancellation failed"));
      }
    } catch (error) {
      setMessage("❌ Error cancelling");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border-2 border-purple-500 rounded-lg shadow-xl p-4 max-w-xs z-50">
      <div className="text-xs font-bold text-purple-900 mb-2">
        🧪 Test Subscription (Dev Only)
      </div>

      <div className="flex gap-2 mb-2">
        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="flex-1 px-3 py-2 bg-green-600 text-white text-xs font-semibold rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          {loading ? "..." : "Upgrade to Pro"}
        </button>

        <button
          onClick={handleCancel}
          disabled={loading}
          className="flex-1 px-3 py-2 bg-red-600 text-white text-xs font-semibold rounded hover:bg-red-700 disabled:bg-gray-400"
        >
          {loading ? "..." : "Cancel Sub"}
        </button>
      </div>

      {message && (
        <div className="text-xs mt-2 p-2 bg-gray-100 rounded">{message}</div>
      )}

      <div className="text-[10px] text-gray-500 mt-2">
        Remove this component before production!
      </div>
    </div>
  );
}
