"use client";

import { useCartStore } from "@/store/cart";
import { useState } from "react";

interface Props {
  product: {
    id: string;
    title: string;
    price: number;
    stock: number;
    images: string[];
    vendorId: string;
    vendor: { storeName: string };
  };
}

export default function AddToCartButton({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (product.stock <= 0) {
    return (
      <button disabled className="w-full rounded-xl bg-slate-700 py-3 text-lg font-semibold text-slate-400 cursor-not-allowed">
        Out of Stock
      </button>
    );
  }

  const handleAdd = () => {
    addItem({
      productId: product.id,
      quantity: qty,
      title: product.title,
      price: product.price,
      image: product.images[0] || "",
      vendorId: product.vendorId,
      vendorName: product.vendor.storeName,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center rounded-lg border border-slate-700">
        <button
          onClick={() => setQty(Math.max(1, qty - 1))}
          className="px-3 py-2 text-slate-400 hover:text-white transition"
        >
          −
        </button>
        <span className="min-w-[2rem] text-center font-medium">{qty}</span>
        <button
          onClick={() => setQty(Math.min(product.stock, qty + 1))}
          className="px-3 py-2 text-slate-400 hover:text-white transition"
        >
          +
        </button>
      </div>
      <button
        onClick={handleAdd}
        className={`flex-1 rounded-xl py-3 text-lg font-semibold transition ${
          added
            ? "bg-green-600 text-white"
            : "bg-blue-600 text-white hover:bg-blue-500"
        }`}
      >
        {added ? "✓ Added to Cart" : "Add to Cart"}
      </button>
    </div>
  );
}
