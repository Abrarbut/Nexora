import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, Store, Package, ShoppingCart, DollarSign, Clock } from "lucide-react";

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");

  const [userCount, vendorCount, pendingVendors, productCount, orderCount, revenue] = await Promise.all([
    prisma.user.count(),
    prisma.vendorProfile.count({ where: { status: "APPROVED" } }),
    prisma.vendorProfile.count({ where: { status: "PENDING" } }),
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { totalAmount: true } }),
  ]);

  const recentOrders = await prisma.order.findMany({
    include: { user: { select: { name: true, email: true } }, subOrders: { select: { status: true } } },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const stats = [
    { label: "Total Users", value: userCount, icon: <Users className="h-6 w-6" />, color: "text-blue-400 bg-blue-400/10" },
    { label: "Active Vendors", value: vendorCount, icon: <Store className="h-6 w-6" />, color: "text-purple-400 bg-purple-400/10" },
    { label: "Products", value: productCount, icon: <Package className="h-6 w-6" />, color: "text-cyan-400 bg-cyan-400/10" },
    { label: "Total Orders", value: orderCount, icon: <ShoppingCart className="h-6 w-6" />, color: "text-amber-400 bg-amber-400/10" },
    { label: "Revenue", value: `$${Number(revenue._sum.totalAmount || 0).toFixed(2)}`, icon: <DollarSign className="h-6 w-6" />, color: "text-emerald-400 bg-emerald-400/10" },
    { label: "Pending Vendors", value: pendingVendors, icon: <Clock className="h-6 w-6" />, color: "text-yellow-400 bg-yellow-400/10" },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="mt-1 text-slate-400">Platform overview and management</p>

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link href="/admin/vendors" className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-5 transition hover:border-purple-500/50">
          <Store className="h-8 w-8 text-purple-400" />
          <h3 className="mt-3 font-semibold">Manage Vendors</h3>
          <p className="mt-1 text-sm text-slate-400">Approve, suspend, or review vendor applications</p>
          {pendingVendors > 0 && (
            <span className="mt-2 inline-block rounded-full bg-yellow-400/10 px-3 py-1 text-xs font-medium text-yellow-400">
              {pendingVendors} pending
            </span>
          )}
        </Link>
        <Link href="/admin/orders" className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-5 transition hover:border-blue-500/50">
          <ShoppingCart className="h-8 w-8 text-blue-400" />
          <h3 className="mt-3 font-semibold">All Orders</h3>
          <p className="mt-1 text-sm text-slate-400">View and track all platform orders</p>
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
                  <th className="pb-3 pr-4">Order ID</th>
                  <th className="pb-3 pr-4">Customer</th>
                  <th className="pb-3 pr-4">Amount</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="py-3 pr-4 font-mono text-xs">{order.id.slice(0, 12)}...</td>
                    <td className="py-3 pr-4">{order.user.name || order.user.email}</td>
                    <td className="py-3 pr-4 font-medium text-emerald-400">${Number(order.totalAmount).toFixed(2)}</td>
                    <td className="py-3 pr-4">
                      <span className="rounded-full bg-blue-400/10 px-2.5 py-0.5 text-xs font-medium text-blue-400">
                        {order.subOrders[0]?.status || "PENDING"}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</td>
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
