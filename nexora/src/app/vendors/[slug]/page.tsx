import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Store, Package, Calendar } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import type { ProductData } from "@/types";

interface VendorStorePageProps {
  params: Promise<{ slug: string }>;
}

export default async function VendorStorePage({ params }: VendorStorePageProps) {
  const { slug } = await params;

  const vendor = await prisma.vendorProfile.findUnique({
    where: { slug, status: "APPROVED" },
    include: {
      user: { select: { name: true } },
      products: {
        where: { status: "ACTIVE" },
        include: {
          category: true,
          vendor: {
            select: {
              id: true,
              storeName: true,
              slug: true,
              description: true,
              logo: true,
              banner: true,
              status: true,
              commissionRate: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!vendor) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Store Header */}
      <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/50">
        {/* Banner */}
        <div className="relative h-48 bg-gradient-to-br from-purple-600/30 to-blue-600/30 sm:h-56">
          {vendor.banner && (
            <Image
              src={vendor.banner}
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          )}
        </div>

        {/* Store Info */}
        <div className="relative px-6 pb-6">
          <div className="flex flex-wrap items-end gap-4 -mt-10">
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-4 border-slate-800 bg-slate-700">
              {vendor.logo ? (
                <Image
                  src={vendor.logo}
                  alt={vendor.storeName}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Store className="h-8 w-8 text-slate-400" />
                </div>
              )}
            </div>
            <div className="pb-1">
              <h1 className="text-2xl font-bold">{vendor.storeName}</h1>
              <p className="text-sm text-slate-400">by {vendor.user.name}</p>
            </div>
          </div>

          {vendor.description && (
            <p className="mt-4 text-slate-300">{vendor.description}</p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1.5">
              <Package className="h-4 w-4" />
              {vendor.products.length} product{vendor.products.length !== 1 ? "s" : ""}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              Joined {new Date(vendor.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </span>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="mt-8">
        <h2 className="text-xl font-bold">Products</h2>
        {vendor.products.length === 0 ? (
          <div className="mt-8 flex flex-col items-center text-center">
            <Package className="mb-4 h-12 w-12 text-slate-600" />
            <p className="text-slate-400">This vendor hasn&apos;t listed any products yet.</p>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vendor.products.map((product) => (
              <ProductCard key={product.id} product={product as unknown as ProductData} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
