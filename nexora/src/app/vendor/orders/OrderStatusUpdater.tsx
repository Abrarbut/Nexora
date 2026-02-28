"use client";

import { useState } from "react";

const statuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

export default function OrderStatusUpdater({ subOrderId, currentStatus }: { subOrderId: string; currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const handleChange = async (newStatus: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/vendor/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subOrderId, status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Update failed");
      }
      setStatus(newStatus);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <select
      value={status}
      onChange={(e) => handleChange(e.target.value)}
      disabled={loading || status === "DELIVERED" || status === "CANCELLED"}
      className={`rounded-lg border px-3 py-1.5 text-xs font-medium outline-none transition ${
        status === "DELIVERED"
          ? "border-emerald-500/30 bg-emerald-400/10 text-emerald-400"
          : status === "CANCELLED"
          ? "border-red-500/30 bg-red-400/10 text-red-400"
          : "border-slate-700 bg-slate-900/50 text-white focus:border-blue-500"
      } disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {statuses.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
}
