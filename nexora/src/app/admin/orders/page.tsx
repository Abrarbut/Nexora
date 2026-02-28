import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ShoppingCart } from "lucide-react";

export default async function AdminOrdersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");

  const orders = await prisma.order.findMany({
    include: {
      customer: { select: { name: true, email: true } },
      subOrders: {
        include: {
          vendor: { include: { user: { select: { name: true } } } },
          items: { include: { product: { select: { title: true } } } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (orders.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <ShoppingCart className="mb-4 h-20 w-20 text-slate-600" />
        <h1 className="text-2xl font-bold">No orders yet</h1>
        <p className="mt-2 text-slate-400">Orders will appear here once customers start purchasing.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-3xl font-bold">All Orders</h1>
      <p className="mt-1 text-slate-400">{orders.length} order(s) total</p>

      <div className="mt-8 space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="rounded-xl border border-slate-700/50 bg-slate-800/50 overflow-hidden">
            {/* Order Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/50 bg-slate-800 px-6 py-3">
              <div className="flex items-center gap-4 text-sm">
                <span className="font-mono text-xs text-slate-400">{order.id.slice(0, 12)}...</span>
                <span className="text-white">{order.customer.name || order.customer.email}</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                <span className="text-lg font-bold text-emerald-400">${Number(order.total).toFixed(2)}</span>
              </div>
            </div>

            {/* Sub-orders */}
            <div className="divide-y divide-slate-700/50">
              {order.subOrders.map((sub) => (
                <div key={sub.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">
                      Vendor: <span className="text-white">{sub.vendor.user.name || "—"}</span>
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      sub.status === "DELIVERED" ? "bg-emerald-400/10 text-emerald-400" :
                      sub.status === "SHIPPED" ? "bg-purple-400/10 text-purple-400" :
                      sub.status === "CANCELLED" ? "bg-red-400/10 text-red-400" :
                      sub.status === "PROCESSING" ? "bg-blue-400/10 text-blue-400" :
                      "bg-yellow-400/10 text-yellow-400"
                    }`}>
                      {sub.status}
                    </span>
                  </div>
                  <div className="mt-2 space-y-1">
                    {sub.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-slate-300">{item.product.title}</span>
                        <span className="text-slate-400">{item.quantity} × ${Number(item.priceAtPurchase).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
