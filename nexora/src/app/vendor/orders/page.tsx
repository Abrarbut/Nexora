import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Package } from "lucide-react";
import OrderStatusUpdater from "./OrderStatusUpdater";

export default async function VendorOrdersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "VENDOR") redirect("/");

  const vendor = await prisma.vendorProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!vendor || vendor.status !== "APPROVED") redirect("/vendor");

  const subOrders = await prisma.subOrder.findMany({
    where: { vendorId: vendor.id },
    include: {
      items: { include: { product: { select: { name: true, images: true } } } },
      order: { include: { user: { select: { name: true, email: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (subOrders.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <Package className="mb-4 h-20 w-20 text-slate-600" />
        <h1 className="text-2xl font-bold">No orders yet</h1>
        <p className="mt-2 text-slate-400">Orders will appear here when customers buy your products.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-3xl font-bold">Orders</h1>
      <p className="mt-1 text-slate-400">{subOrders.length} order(s)</p>

      <div className="mt-8 space-y-4">
        {subOrders.map((sub) => (
          <div key={sub.id} className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400">
                  Customer: <span className="text-white">{sub.order.user.name || sub.order.user.email}</span>
                </p>
                <p className="text-sm text-slate-500">
                  {new Date(sub.createdAt).toLocaleDateString()} &middot; Order #{sub.orderId.slice(0, 8)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-emerald-400">${Number(sub.amount).toFixed(2)}</span>
                <OrderStatusUpdater subOrderId={sub.id} currentStatus={sub.status} />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {sub.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg bg-slate-900/50 px-4 py-2 text-sm">
                  <span>{item.product.name}</span>
                  <span className="text-slate-400">
                    {item.quantity} × ${Number(item.price).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
