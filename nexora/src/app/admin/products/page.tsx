import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Package, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ProductStatusButton from "./ProductStatusButton";

interface Props {
  searchParams: Promise<{
    q?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function AdminProductsPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");

  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const pageSize = 20;

  // Build where clause
  const where: Record<string, unknown> = {};
  if (params.status && ["DRAFT", "ACTIVE", "DELISTED", "OUT_OF_STOCK"].includes(params.status)) {
    where.status = params.status;
  }
  if (params.q) {
    where.OR = [
      { title: { contains: params.q, mode: "insensitive" } },
      { vendor: { storeName: { contains: params.q, mode: "insensitive" } } },
    ];
  }

  const [products, total, counts] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
        vendor: { select: { id: true, storeName: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
    prisma.product.groupBy({
      by: ["status"],
      _count: true,
    }),
  ]);

  const totalPages = Math.ceil(total / pageSize);
  const countMap: Record<string, number> = {};
  for (const c of counts) countMap[c.status] = c._count;

  function buildUrl(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    const merged = { ...params, ...overrides };
    for (const [k, v] of Object.entries(merged)) {
      if (v) p.set(k, v);
    }
    return `/admin/products?${p.toString()}`;
  }

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
      <p className="mt-1 text-slate-400">{total} product(s) {params.status ? `with status ${params.status}` : "total"}{params.q ? ` matching "${params.q}"` : ""}</p>

      {/* Status Summary — clickable filters */}
      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <Link
          href={buildUrl({ status: undefined, page: undefined })}
          className={`rounded-full px-4 py-1.5 font-medium transition ${!params.status ? "bg-blue-600 text-white" : "bg-slate-700/50 text-slate-300 hover:bg-slate-600"}`}
        >
          All ({Object.values(countMap).reduce((a, b) => a + b, 0)})
        </Link>
        <Link
          href={buildUrl({ status: "DRAFT", page: undefined })}
          className={`rounded-full px-4 py-1.5 font-medium transition ${params.status === "DRAFT" ? "bg-yellow-500 text-black" : "bg-yellow-400/10 text-yellow-400 hover:bg-yellow-400/20"}`}
        >
          Draft ({countMap["DRAFT"] || 0})
        </Link>
        <Link
          href={buildUrl({ status: "ACTIVE", page: undefined })}
          className={`rounded-full px-4 py-1.5 font-medium transition ${params.status === "ACTIVE" ? "bg-emerald-500 text-black" : "bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20"}`}
        >
          Active ({countMap["ACTIVE"] || 0})
        </Link>
        <Link
          href={buildUrl({ status: "DELISTED", page: undefined })}
          className={`rounded-full px-4 py-1.5 font-medium transition ${params.status === "DELISTED" ? "bg-red-500 text-white" : "bg-red-400/10 text-red-400 hover:bg-red-400/20"}`}
        >
          Delisted ({countMap["DELISTED"] || 0})
        </Link>
      </div>

      {/* Search */}
      <form action="/admin/products" method="GET" className="mt-5">
        {params.status && <input type="hidden" name="status" value={params.status} />}
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            name="q"
            defaultValue={params.q || ""}
            placeholder="Search by product title or vendor name..."
            className="w-full rounded-lg border border-slate-700 bg-slate-800/50 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500"
          />
        </div>
      </form>

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
            <p className="mt-2">No products found</p>
            {(params.q || params.status) && (
              <Link href="/admin/products" className="mt-2 inline-block text-sm text-blue-400 hover:text-blue-300">
                Clear filters
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={buildUrl({ page: String(page - 1) })}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
            >
              Previous
            </Link>
          )}
          <span className="px-4 py-2 text-sm text-slate-400">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={buildUrl({ page: String(page + 1) })}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
