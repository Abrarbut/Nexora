import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "./AddToCartButton";
import ReviewSection from "./ReviewSection";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      vendor: {
        select: { id: true, storeName: true, slug: true, logo: true, description: true },
      },
      reviews: {
        include: { user: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!product || product.status !== "ACTIVE") {
    notFound();
  }

  const reviewCount = product.reviews.length;
  const avgRating = reviewCount > 0
    ? product.reviews.reduce((s, r) => s + r.rating, 0) / reviewCount
    : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-slate-400">
        <Link href="/products" className="hover:text-white transition">Products</Link>
        <span>/</span>
        <Link href={`/products?category=${product.category?.slug}`} className="hover:text-white transition">
          {product.category?.name}
        </Link>
        <span>/</span>
        <span className="text-slate-300 truncate max-w-[200px]">{product.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/50">
            {product.images[0] ? (
              <Image
                src={product.images[0]}
                alt={product.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-6xl text-slate-600">📦</div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1, 5).map((img, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-lg border border-slate-700/50">
                  <Image src={img} alt={`${product.title} ${i + 2}`} fill className="object-cover" sizes="120px" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-blue-400">
            {product.category?.name}
          </p>
          <h1 className="mt-2 text-3xl font-bold">{product.title}</h1>

          {/* Rating */}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className={`text-lg ${star <= Math.round(avgRating) ? "text-yellow-400" : "text-slate-600"}`}>
                  ★
                </span>
              ))}
            </div>
            <span className="text-sm text-slate-400">
              {avgRating.toFixed(1)} ({reviewCount} review{reviewCount !== 1 ? "s" : ""})
            </span>
          </div>

          {/* Price */}
          <div className="mt-4">
            <span className="text-4xl font-bold text-white">${product.price.toFixed(2)}</span>
          </div>

          {/* Stock */}
          <div className="mt-3">
            {product.stock > 0 ? (
              <span className="inline-flex items-center gap-1 text-sm text-green-400">
                <span className="h-2 w-2 rounded-full bg-green-400"></span>
                In Stock ({product.stock} available)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-sm text-red-400">
                <span className="h-2 w-2 rounded-full bg-red-400"></span>
                Out of Stock
              </span>
            )}
          </div>

          {/* Add to Cart */}
          <div className="mt-6">
            <AddToCartButton product={product} />
          </div>

          {/* Description */}
          <div className="mt-8 border-t border-slate-700/50 pt-6">
            <h3 className="text-lg font-semibold">Description</h3>
            <p className="mt-3 whitespace-pre-wrap text-slate-300 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Vendor info */}
          <div className="mt-6 rounded-xl border border-slate-700/50 bg-slate-800/50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Sold by</p>
            <div className="mt-2 flex items-center gap-3">
              {product.vendor.logo ? (
                <Image
                  src={product.vendor.logo}
                  alt={product.vendor.storeName}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-lg font-bold">
                  {product.vendor.storeName[0]}
                </div>
              )}
              <div>
                <p className="font-semibold">{product.vendor.storeName}</p>
                {product.vendor.description && (
                  <p className="text-xs text-slate-400 line-clamp-1">{product.vendor.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-12 border-t border-slate-700/50 pt-8">
        <ReviewSection productId={product.id} reviews={product.reviews} avgRating={avgRating} />
      </div>
    </div>
  );
}
