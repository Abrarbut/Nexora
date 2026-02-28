"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useCartStore } from "@/store/cart";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const getTotalItems = useCartStore((s) => s.getTotalItems);
  const [mobileOpen, setMobileOpen] = useState(false);

  const cartCount = getTotalItems();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold tracking-tight">
          <span className="text-blue-400">Nexora</span>
        </Link>

        {/* Search bar */}
        <div className="hidden flex-1 max-w-xl mx-8 md:block">
          <form action="/products" method="GET">
            <div className="relative">
              <input
                type="text"
                name="q"
                placeholder="Search products..."
                className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2 pl-10 text-sm text-white placeholder-slate-500 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <svg className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </form>
        </div>

        {/* Nav links */}
        <nav className="hidden items-center gap-2 md:flex">
          <Link
            href="/products"
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              pathname === "/products" ? "bg-slate-800 text-white" : "text-slate-300 hover:text-white"
            }`}
          >
            Products
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:text-white"
          >
            🛒
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Link>

          {session?.user ? (
            <>
              {session.user.role === "ADMIN" && (
                <Link href="/admin" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:text-white">
                  Admin
                </Link>
              )}
              {session.user.role === "VENDOR" && (
                <Link href="/vendor" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:text-white">
                  Dashboard
                </Link>
              )}
              {session.user.role === "CUSTOMER" && (
                <Link href="/orders" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:text-white">
                  My Orders
                </Link>
              )}
              <div className="ml-2 flex items-center gap-2">
                <span className="text-sm text-slate-400">{session.user.name}</span>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-700"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:text-white"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
              >
                Get Started
              </Link>
            </>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 text-slate-400 md:hidden"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-slate-700/50 px-4 py-4 md:hidden">
          <form action="/products" method="GET" className="mb-4">
            <input
              type="text"
              name="q"
              placeholder="Search products..."
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2 text-sm text-white placeholder-slate-500"
            />
          </form>
          <div className="flex flex-col gap-2">
            <Link href="/products" className="rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800" onClick={() => setMobileOpen(false)}>Products</Link>
            <Link href="/cart" className="rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800" onClick={() => setMobileOpen(false)}>Cart ({cartCount})</Link>
            {session?.user ? (
              <>
                {session.user.role === "VENDOR" && <Link href="/vendor" className="rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800" onClick={() => setMobileOpen(false)}>Dashboard</Link>}
                {session.user.role === "ADMIN" && <Link href="/admin" className="rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800" onClick={() => setMobileOpen(false)}>Admin</Link>}
                <button onClick={() => signOut({ callbackUrl: "/" })} className="rounded-lg px-3 py-2 text-left text-sm text-red-400 hover:bg-slate-800">Sign Out</button>
              </>
            ) : (
              <>
                <Link href="/login" className="rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800" onClick={() => setMobileOpen(false)}>Sign In</Link>
                <Link href="/register" className="rounded-lg bg-blue-600 px-3 py-2 text-center text-sm text-white" onClick={() => setMobileOpen(false)}>Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
