import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

interface Props {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const pageSize = 12;

  // Build where clause
  const where: Record<string, unknown> = { status: "ACTIVE" as const };

  if (params.category) {
    where.category = { slug: params.category };
  }
  if (params.q) {
    where.OR = [
      { title: { contains: params.q, mode: "insensitive" } },
      { description: { contains: params.q, mode: "insensitive" } },
    ];
  }
  if (params.minPrice || params.maxPrice) {
    where.price = {};
    if (params.minPrice) (where.price as Record<string, number>).gte = parseFloat(params.minPrice);
    if (params.maxPrice) (where.price as Record<string, number>).lte = parseFloat(params.maxPrice);
  }

  let orderBy: Record<string, string> = { createdAt: "desc" };
  if (params.sort === "price-low") orderBy = { price: "asc" };
  else if (params.sort === "price-high") orderBy = { price: "desc" };
  else if (params.sort === "rating") orderBy = { rating: "desc" };

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
        vendor: { select: { id: true, storeName: true, slug: true, description: true, logo: true, banner: true, status: true, commissionRate: true, createdAt: true } },
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  // Build URL helper
  function buildUrl(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    const merged = { ...params, ...overrides };
    for (const [k, v] of Object.entries(merged)) {
      if (v) p.set(k, v);
    }
    return `/products?${p.toString()}`;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {params.q ? `Results for "${params.q}"` : params.category ? categories.find(c => c.slug === params.category)?.name || "Products" : "All Products"}
        </h1>
        <p className="mt-1 text-slate-400">{total} product{total !== 1 ? "s" : ""} found</p>

        {/* Search bar */}
        <form action="/products" method="GET" className="mt-4">
          {params.category && <input type="hidden" name="category" value={params.category} />}
          {params.sort && <input type="hidden" name="sort" value={params.sort} />}
          {params.minPrice && <input type="hidden" name="minPrice" value={params.minPrice} />}
          {params.maxPrice && <input type="hidden" name="maxPrice" value={params.maxPrice} />}
          <div className="relative max-w-lg">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="m21 21-4.35-4.35" /></svg>
            <input
              type="text"
              name="q"
              defaultValue={params.q || ""}
              placeholder="Search products..."
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500"
            />
          </div>
        </form>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar filters */}
        <aside className="w-full shrink-0 lg:w-56">
          {/* Categories */}
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-4">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Categories</h3>
            <div className="flex flex-col gap-1">
              <Link
                href={buildUrl({ category: undefined, page: undefined })}
                className={`rounded-lg px-3 py-1.5 text-sm transition ${!params.category ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-700"}`}
              >
                All
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={buildUrl({ category: cat.slug, page: undefined })}
                  className={`rounded-lg px-3 py-1.5 text-sm transition ${params.category === cat.slug ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-700"}`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div className="mt-4 rounded-xl border border-slate-700/50 bg-slate-800/50 p-4">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Sort By</h3>
            <div className="flex flex-col gap-1">
              {[
                { label: "Newest", value: "newest" },
                { label: "Price: Low → High", value: "price-low" },
                { label: "Price: High → Low", value: "price-high" },
                { label: "Top Rated", value: "rating" },
              ].map((opt) => (
                <Link
                  key={opt.value}
                  href={buildUrl({ sort: opt.value, page: undefined })}
                  className={`rounded-lg px-3 py-1.5 text-sm transition ${(params.sort || "newest") === opt.value ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-700"}`}
                >
                  {opt.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="mt-4 rounded-xl border border-slate-700/50 bg-slate-800/50 p-4">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Price Range</h3>
            <form action="/products" method="GET" className="space-y-3">
              {/* Preserve existing query params */}
              {params.q && <input type="hidden" name="q" value={params.q} />}
              {params.category && <input type="hidden" name="category" value={params.category} />}
              {params.sort && <input type="hidden" name="sort" value={params.sort} />}
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  name="minPrice"
                  placeholder="Min"
                  defaultValue={params.minPrice || ""}
                  min="0"
                  step="0.01"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500"
                />
                <span className="text-slate-500">–</span>
                <input
                  type="number"
                  name="maxPrice"
                  placeholder="Max"
                  defaultValue={params.maxPrice || ""}
                  min="0"
                  step="0.01"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-slate-700 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-600"
              >
                Apply
              </button>
              {(params.minPrice || params.maxPrice) && (
                <Link
                  href={buildUrl({ minPrice: undefined, maxPrice: undefined, page: undefined })}
                  className="block text-center text-xs text-blue-400 hover:text-blue-300"
                >
                  Clear price filter
                </Link>
              )}
            </form>
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-slate-700/50 bg-slate-800/50 py-20">
              <span className="text-5xl">🔍</span>
              <h3 className="mt-4 text-lg font-semibold">No products found</h3>
              <p className="mt-1 text-sm text-slate-400">Try adjusting your filters or search terms.</p>
              <Link href="/products" className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500">
                Clear Filters
              </Link>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
