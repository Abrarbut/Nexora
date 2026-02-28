import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, Clock, CheckCircle, Truck, XCircle, ChevronRight } from "lucide-react";

const statusConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  PENDING: { icon: <Clock className="h-4 w-4" />, color: "text-yellow-400 bg-yellow-400/10", label: "Pending" },
  PROCESSING: { icon: <Package className="h-4 w-4" />, color: "text-blue-400 bg-blue-400/10", label: "Processing" },
  SHIPPED: { icon: <Truck className="h-4 w-4" />, color: "text-purple-400 bg-purple-400/10", label: "Shipped" },
  DELIVERED: { icon: <CheckCircle className="h-4 w-4" />, color: "text-emerald-400 bg-emerald-400/10", label: "Delivered" },
  CANCELLED: { icon: <XCircle className="h-4 w-4" />, color: "text-red-400 bg-red-400/10", label: "Cancelled" },
};

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const orders = await prisma.order.findMany({
    where: { customerId: session.user.id },
    include: {
      subOrders: {
        include: {
          vendor: { include: { user: { select: { name: true } } } },
          items: {
            include: { product: { select: { title: true, images: true, id: true } } },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (orders.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <Package className="mb-4 h-20 w-20 text-slate-600" />
        <h1 className="text-2xl font-bold">No orders yet</h1>
        <p className="mt-2 text-slate-400">Start shopping to see your orders here.</p>
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
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold">My Orders</h1>
      <p className="mt-1 text-slate-400">{orders.length} order(s) total</p>

      <div className="mt-8 space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="rounded-xl border border-slate-700/50 bg-slate-800/50 overflow-hidden">
            {/* Order Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/50 bg-slate-800 px-6 py-3">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-slate-400">Order</span>
                <span className="font-mono text-white">{order.id.slice(0, 8)}...</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                <span className="font-bold text-emerald-400">${Number(order.total).toFixed(2)}</span>
              </div>
            </div>

            {/* Sub-orders (by vendor) */}
            <div className="divide-y divide-slate-700/50">
              {order.subOrders.map((sub) => {
                const cfg = statusConfig[sub.status] || statusConfig.PENDING;
                return (
                  <div key={sub.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">
                        Sold by: <span className="text-white">{sub.vendor.user.name || "Vendor"}</span>
                      </span>
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${cfg.color}`}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </div>
                    <div className="mt-3 space-y-2">
                      {sub.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <Link
                            href={`/products/${item.product.id}`}
                            className="flex items-center gap-2 text-slate-300 hover:text-blue-400 transition"
                          >
                            {item.product.title} <ChevronRight className="h-3 w-3" />
                          </Link>
                          <span className="text-slate-400">
                            {item.quantity} × ${Number(item.priceAtPurchase).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
