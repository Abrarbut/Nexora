import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function VendorDashboard() {
  const session = await auth();

  if (!session?.user || session.user.role !== "VENDOR") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Vendor Sidebar / Top Nav */}
      <header className="border-b border-slate-700/50 bg-slate-800/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-2xl font-bold text-blue-400">
            Nexora
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">
              Vendor: {session.user.name}
            </span>
            <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400 border border-green-500/20">
              VENDOR
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
        <p className="mt-2 text-slate-400">Manage your store, products, and orders.</p>

        {/* Quick Links */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Products", desc: "Manage your product catalog", href: "/vendor/products", icon: "📦" },
            { title: "Orders", desc: "View and update order status", href: "/vendor/orders", icon: "🛒" },
            { title: "Earnings", desc: "Track revenue and payouts", href: "/vendor/earnings", icon: "💰" },
            { title: "Settings", desc: "Store profile and settings", href: "/vendor/settings", icon: "⚙️" },
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
