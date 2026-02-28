"use client";

import { useState } from "react";

interface Props {
  vendorId: string;
  action: "APPROVED" | "SUSPENDED";
  label: string;
  variant: "green" | "red";
}

export default function VendorActionButton({ vendorId, action, label, variant }: Props) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!confirm(`Are you sure you want to ${label.toLowerCase()} this vendor?`)) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/vendors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId, status: action }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Action failed");
      }
      window.location.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update vendor");
    } finally {
      setLoading(false);
    }
  };

  const colors = variant === "green"
    ? "border-emerald-500/30 text-emerald-400 hover:bg-emerald-400/10"
    : "border-red-500/30 text-red-400 hover:bg-red-400/10";

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`rounded-lg border px-4 py-1.5 text-xs font-medium transition ${colors} disabled:opacity-50`}
    >
      {loading ? "..." : label}
    </button>
  );
}
