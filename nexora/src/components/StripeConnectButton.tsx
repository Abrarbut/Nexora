"use client";

import { useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";

export default function StripeConnectButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConnect = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/vendor/stripe/connect", { method: "POST" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to connect");

      // Redirect to Stripe onboarding
      window.location.href = data.data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleConnect}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 font-medium text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ExternalLink className="h-4 w-4" />
        )}
        {loading ? "Connecting..." : "Connect with Stripe"}
      </button>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
