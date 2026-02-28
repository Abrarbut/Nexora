"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface Props {
  productId: string;
  currentStatus: string;
}

export default function ProductStatusButton({ productId, currentStatus }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Status update error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader2 className="h-4 w-4 animate-spin text-blue-400" />;
  }

  return (
    <div className="flex gap-2">
      {currentStatus !== "ACTIVE" && (
        <button
          onClick={() => handleStatusChange("ACTIVE")}
          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-500"
        >
          Approve
        </button>
      )}
      {currentStatus !== "DELISTED" && (
        <button
          onClick={() => handleStatusChange("DELISTED")}
          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-500"
        >
          Delist
        </button>
      )}
      {currentStatus === "DELISTED" && (
        <button
          onClick={() => handleStatusChange("DRAFT")}
          className="rounded-lg bg-slate-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-500"
        >
          Set Draft
        </button>
      )}
    </div>
  );
}
