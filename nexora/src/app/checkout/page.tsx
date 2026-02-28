"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { ShoppingBag, Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    phone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          shippingAddress: form,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");

      setOrderId(data.data.id);
      setOrderPlaced(true);
      clearCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <CheckCircle className="mb-4 h-20 w-20 text-emerald-400" />
        <h1 className="text-3xl font-bold">Order Placed!</h1>
        <p className="mt-2 text-slate-400">Your order ID: <span className="font-mono text-white">{orderId.slice(0, 8)}...</span></p>
        <p className="mt-1 text-sm text-slate-500">You&apos;ll receive updates as vendors process your items.</p>
        <div className="mt-6 flex gap-4">
          <Link
            href="/orders"
            className="rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-500"
          >
            View Orders
          </Link>
          <Link
            href="/products"
            className="rounded-xl border border-slate-700 px-6 py-3 font-medium text-white transition hover:border-blue-500"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <ShoppingBag className="mb-4 h-20 w-20 text-slate-600" />
        <h1 className="text-2xl font-bold">Nothing to checkout</h1>
        <p className="mt-2 text-slate-400">Add items to your cart first.</p>
        <Link
          href="/products"
          className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-500"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-3xl font-bold">Checkout</h1>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Shipping Form */}
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-6">
            <h2 className="text-lg font-bold">Shipping Address</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm text-slate-400">Full Name</label>
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm text-slate-400">Address</label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-400">City</label>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-400">State / Province</label>
                <input
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-400">ZIP / Postal Code</label>
                <input
                  name="zipCode"
                  value={form.zipCode}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-400">Country</label>
                <input
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm text-slate-400">Phone Number</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  type="tel"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="h-fit rounded-xl border border-slate-700/50 bg-slate-800/50 p-6">
          <h2 className="text-lg font-bold">Order Summary</h2>
          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between text-sm">
                <span className="text-slate-300 truncate max-w-[60%]">
                  {item.title} × {item.quantity}
                </span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <hr className="border-slate-700" />
            <div className="flex justify-between">
              <span className="text-slate-400">Shipping</span>
              <span className="text-emerald-400">Free</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-emerald-400">${getTotalPrice().toFixed(2)}</span>
            </div>
          </div>

          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Processing...
              </>
            ) : (
              "Place Order"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
