import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-700/50 bg-slate-900 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="text-xl font-bold text-blue-400">Nexora</Link>
            <p className="mt-3 text-sm text-slate-400">
              AI-powered multi-vendor marketplace. Shop from hundreds of vendors in one place.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-white">Shop</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li><Link href="/products" className="hover:text-white transition">All Products</Link></li>
              <li><Link href="/products?category=electronics" className="hover:text-white transition">Electronics</Link></li>
              <li><Link href="/products?category=clothing" className="hover:text-white transition">Clothing</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white">Vendor</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li><Link href="/vendor/apply" className="hover:text-white transition">Become a Vendor</Link></li>
              <li><Link href="/vendor" className="hover:text-white transition">Vendor Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white">Account</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li><Link href="/login" className="hover:text-white transition">Sign In</Link></li>
              <li><Link href="/register" className="hover:text-white transition">Register</Link></li>
              <li><Link href="/orders" className="hover:text-white transition">My Orders</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-slate-700/50 pt-6 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Nexora. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
