"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cart";
import type { ProductData } from "@/types";

export default function ProductCard({ product }: { product: ProductData }) {
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      quantity: 1,
      title: product.title,
      price: product.price,
      image: product.images[0] || "/placeholder.png",
      vendorId: product.vendorId,
      vendorName: product.vendor?.storeName || "Unknown Vendor",
    });
  };

  return (
    <Link
      href={`/products/${product.id}`}
      className="group rounded-xl border border-slate-700/50 bg-slate-800/50 overflow-hidden transition hover:border-slate-600 hover:shadow-lg hover:shadow-blue-500/5"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-slate-700/30">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            className="object-cover transition group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-slate-600">
            📦
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="rounded-full bg-red-600 px-3 py-1 text-sm font-medium text-white">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-slate-500 uppercase tracking-wide">
          {product.category?.name || "Uncategorized"}
        </p>
        <h3 className="mt-1 text-sm font-semibold text-white line-clamp-2 group-hover:text-blue-400 transition">
          {product.title}
        </h3>
        <div className="mt-2 flex items-center gap-1">
          <span className="text-yellow-400 text-sm">★</span>
          <span className="text-sm text-slate-400">{product.rating.toFixed(1)}</span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold text-white">
            ${product.price.toFixed(2)}
          </span>
          {product.stock > 0 && (
            <button
              onClick={handleAddToCart}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-500"
            >
              Add to Cart
            </button>
          )}
        </div>
        {product.vendor && (
          <p className="mt-2 text-xs text-slate-500">
            by {product.vendor.storeName}
          </p>
        )}
      </div>
    </Link>
  );
}
