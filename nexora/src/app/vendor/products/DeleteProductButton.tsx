"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function DeleteProductButton({ productId, productName }: { productId: string; productName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete "${productName}"? This action cannot be undone.`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/vendor/products/${productId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="rounded-lg border border-slate-700 p-2 text-slate-400 transition hover:border-red-500 hover:text-red-400 disabled:opacity-50"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
