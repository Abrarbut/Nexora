import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, ShoppingCart, DollarSign, TrendingUp, Plus } from "lucide-react";

export default async function VendorDashboard() {
  const session = await auth();
  if (!session?.user || session.user.role !== "VENDOR") redirect("/");

  const vendor = await prisma.vendorProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!vendor || vendor.status !== "APPROVED") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <Package className="mb-4 h-20 w-20 text-slate-600" />
        <h1 className="text-2xl font-bold">Vendor Access Required</h1>
        <p className="mt-2 text-slate-400">
          {vendor ? "Your vendor application is still pending approval." : "You need a vendor profile to access this dashboard."}
        </p>
      </div>
    );
  }

  const [productCount, orderCount, earnings] = await Promise.all([
    prisma.product.count({ where: { vendorId: vendor.id } }),
    prisma.subOrder.count({ where: { vendorId: vendor.id } }),
    prisma.subOrder.aggregate({
      where: { vendorId: vendor.id, status: "DELIVERED" },
      _sum: { amount: true },
    }),
  ]);

  const recentOrders = await prisma.subOrder.findMany({
    where: { vendorId: vendor.id },
    include: {
      items: { include: { product: { select: { name: true } } } },
      order: { include: { user: { select: { name: true, email: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const stats = [
    { label: "Products", value: productCount, icon: <Package className="h-6 w-6" />, color: "text-blue-400 bg-blue-400/10" },
    { label: "Orders", value: orderCount, icon: <ShoppingCart className="h-6 w-6" />, color: "text-purple-400 bg-purple-400/10" },
    { label: "Revenue", value: `$${Number(earnings._sum.amount || 0).toFixed(2)}`, icon: <DollarSign className="h-6 w-6" />, color: "text-emerald-400 bg-emerald-400/10" },
    { label: "Avg Order", value: orderCount > 0 ? `$${(Number(earnings._sum.amount || 0) / orderCount).toFixed(2)}` : "$0.00", icon: <TrendingUp className="h-6 w-6" />, color: "text-yellow-400 bg-yellow-400/10" },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
          <p className="text-slate-400">{vendor.businessName}</p>
        </div>
        <Link
          href="/vendor/products/new"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" /> Add Product
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">{stat.label}</span>
              <div className={`rounded-lg p-2 ${stat.color}`}>{stat.icon}</div>
            </div>
            <p className="mt-2 text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Link href="/vendor/products" className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-5 transition hover:border-blue-500/50">
          <Package className="h-8 w-8 text-blue-400" />
          <h3 className="mt-3 font-semibold">Manage Products</h3>
          <p className="mt-1 text-sm text-slate-400">Add, edit, or remove your products</p>
        </Link>
        <Link href="/vendor/orders" className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-5 transition hover:border-purple-500/50">
          <ShoppingCart className="h-8 w-8 text-purple-400" />
          <h3 className="mt-3 font-semibold">View Orders</h3>
          <p className="mt-1 text-sm text-slate-400">Track and manage customer orders</p>
        </Link>
        <Link href="/vendor/products/new" className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-5 transition hover:border-emerald-500/50">
          <Plus className="h-8 w-8 text-emerald-400" />
          <h3 className="mt-3 font-semibold">Add New Product</h3>
          <p className="mt-1 text-sm text-slate-400">List a new product on the marketplace</p>
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="mt-8">
        <h2 className="text-xl font-bold">Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <p className="mt-4 text-slate-400">No orders yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-700 text-slate-400">
                <tr>
                  <th className="pb-3 pr-4">Customer</th>
                  <th className="pb-3 pr-4">Items</th>
                  <th className="pb-3 pr-4">Amount</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {recentOrders.map((sub) => (
                  <tr key={sub.id}>
                    <td className="py-3 pr-4">{sub.order.user.name || sub.order.user.email}</td>
                    <td className="py-3 pr-4 text-slate-400">
                      {sub.items.map((i) => i.product.name).join(", ")}
                    </td>
                    <td className="py-3 pr-4 font-medium text-emerald-400">${Number(sub.amount).toFixed(2)}</td>
                    <td className="py-3 pr-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        sub.status === "DELIVERED" ? "bg-emerald-400/10 text-emerald-400" :
                        sub.status === "SHIPPED" ? "bg-purple-400/10 text-purple-400" :
                        sub.status === "CANCELLED" ? "bg-red-400/10 text-red-400" :
                        "bg-yellow-400/10 text-yellow-400"
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400">{new Date(sub.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
