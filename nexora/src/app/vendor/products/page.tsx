import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit, Package } from "lucide-react";
import DeleteProductButton from "./DeleteProductButton";

export default async function VendorProductsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "VENDOR") redirect("/");

  const vendor = await prisma.vendorProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!vendor || vendor.status !== "APPROVED") redirect("/vendor");

  const products = await prisma.product.findMany({
    where: { vendorId: vendor.id },
    include: { category: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Products</h1>
          <p className="text-slate-400">{products.length} product(s)</p>
        </div>
        <Link
          href="/vendor/products/new"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" /> Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <Package className="mb-4 h-16 w-16 text-slate-600" />
          <p className="text-lg font-semibold">No products yet</p>
          <p className="mt-1 text-slate-400">Add your first product to start selling.</p>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-700 text-slate-400">
              <tr>
                <th className="pb-3 pr-4">Product</th>
                <th className="pb-3 pr-4">Category</th>
                <th className="pb-3 pr-4">Price</th>
                <th className="pb-3 pr-4">Stock</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-slate-700">
                        {product.images[0] ? (
                          <Image src={product.images[0]} alt="" fill className="object-cover" sizes="40px" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-slate-500"><Package className="h-4 w-4" /></div>
                        )}
                      </div>
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-slate-400">{product.category?.name || "—"}</td>
                  <td className="py-3 pr-4 font-medium text-emerald-400">${Number(product.price).toFixed(2)}</td>
                  <td className="py-3 pr-4">
                    <span className={product.stock < 5 ? "text-red-400" : "text-slate-300"}>{product.stock}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${product.isActive ? "bg-emerald-400/10 text-emerald-400" : "bg-red-400/10 text-red-400"}`}>
                      {product.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/vendor/products/${product.id}/edit`}
                        className="rounded-lg border border-slate-700 p-2 text-slate-400 transition hover:border-blue-500 hover:text-blue-400"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <DeleteProductButton productId={product.id} productName={product.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
