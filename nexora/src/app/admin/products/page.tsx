import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ProductStatusButton from "./ProductStatusButton";

export default async function AdminProductsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");

  const products = await prisma.product.findMany({
    include: {
      category: true,
      vendor: {
        select: { id: true, storeName: true, slug: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const draft = products.filter((p) => p.status === "DRAFT");
  const active = products.filter((p) => p.status === "ACTIVE");
  const delisted = products.filter((p) => p.status === "DELISTED");

  const statusColor = (s: string) => {
    switch (s) {
      case "ACTIVE": return "bg-emerald-400/10 text-emerald-400";
      case "DRAFT": return "bg-yellow-400/10 text-yellow-400";
      case "DELISTED": return "bg-red-400/10 text-red-400";
      default: return "bg-slate-400/10 text-slate-400";
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-3xl font-bold">Manage Products</h1>
      <p className="mt-1 text-slate-400">{products.length} product(s) total</p>

      {/* Status Summary */}
      <div className="mt-6 flex gap-4 text-sm">
        <span className="rounded-full bg-yellow-400/10 px-4 py-1.5 font-medium text-yellow-400">
          {draft.length} Draft
        </span>
        <span className="rounded-full bg-emerald-400/10 px-4 py-1.5 font-medium text-emerald-400">
          {active.length} Active
        </span>
        <span className="rounded-full bg-red-400/10 px-4 py-1.5 font-medium text-red-400">
          {delisted.length} Delisted
        </span>
      </div>

      {/* Products Table */}
      <div className="mt-8 overflow-hidden rounded-xl border border-slate-700/50">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-700/50 bg-slate-800/50">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-400">Product</th>
              <th className="px-4 py-3 font-medium text-slate-400">Vendor</th>
              <th className="px-4 py-3 font-medium text-slate-400">Category</th>
              <th className="px-4 py-3 font-medium text-slate-400">Price</th>
              <th className="px-4 py-3 font-medium text-slate-400">Stock</th>
              <th className="px-4 py-3 font-medium text-slate-400">Status</th>
              <th className="px-4 py-3 font-medium text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-slate-800/30 transition">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-700/50 bg-slate-800">
                      {product.images[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.title}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Package className="h-4 w-4 text-slate-600" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/products/${product.id}`}
                        className="font-medium text-white hover:text-blue-400 transition line-clamp-1"
                      >
                        {product.title}
                      </Link>
                      <p className="text-xs text-slate-500 truncate">ID: {product.id.slice(0, 12)}...</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/vendors/${product.vendor.slug}`}
                    className="text-slate-300 hover:text-blue-400 transition"
                  >
                    {product.vendor.storeName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {product.category?.name || "—"}
                </td>
                <td className="px-4 py-3 font-medium text-white">
                  ${product.price.toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <span className={product.stock > 0 ? "text-slate-300" : "text-red-400 font-medium"}>
                    {product.stock}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(product.status)}`}>
                    {product.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <ProductStatusButton productId={product.id} currentStatus={product.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && (
          <div className="py-12 text-center text-slate-400">
            <Package className="mx-auto h-8 w-8 text-slate-600" />
            <p className="mt-2">No products yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
