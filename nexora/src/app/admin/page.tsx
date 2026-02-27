import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="border-b border-slate-700/50 bg-slate-800/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-2xl font-bold text-blue-400">
            Nexora
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">
              {session.user.name}
            </span>
            <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400 border border-red-500/20">
              ADMIN
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="mt-2 text-slate-400">Manage the entire Nexora platform.</p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "Vendors", desc: "Approve, reject, and manage vendors", href: "/admin/vendors", icon: "🏪" },
            { title: "Products", desc: "Moderate product listings", href: "/admin/products", icon: "📦" },
            { title: "Orders", desc: "View all platform orders", href: "/admin/orders", icon: "🛒" },
            { title: "Payouts", desc: "Approve vendor payout requests", href: "/admin/payouts", icon: "💳" },
            { title: "Analytics", desc: "Platform revenue and trends", href: "/admin/analytics", icon: "📊" },
            { title: "Users", desc: "Manage all platform users", href: "/admin/users", icon: "👥" },
          ].map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-6 transition hover:border-slate-600"
            >
              <div className="text-3xl">{item.icon}</div>
              <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
              <p className="mt-1 text-sm text-slate-400">{item.desc}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
