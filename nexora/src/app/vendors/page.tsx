import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Store, Package, Star } from "lucide-react";

export default async function VendorsPage() {
  const vendors = await prisma.vendorProfile.findMany({
    where: { status: "APPROVED" },
    include: {
      user: { select: { name: true } },
      _count: { select: { products: { where: { status: "ACTIVE" } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold">All Vendors</h1>
      <p className="mt-1 text-slate-400">
        Browse {vendors.length} trusted vendor{vendors.length !== 1 ? "s" : ""} on our marketplace
      </p>

      {vendors.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <Store className="mb-4 h-16 w-16 text-slate-600" />
          <p className="text-lg font-semibold">No vendors yet</p>
          <p className="mt-1 text-slate-400">Check back soon!</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {vendors.map((vendor) => (
            <Link
              key={vendor.id}
              href={`/vendors/${vendor.slug}`}
              className="group overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/50 transition hover:border-slate-600 hover:shadow-lg hover:shadow-purple-500/5"
            >
              {/* Banner */}
              <div className="relative h-32 bg-gradient-to-br from-purple-600/30 to-blue-600/30">
                {vendor.banner && (
                  <Image
                    src={vendor.banner}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                )}
              </div>

              {/* Logo + Info */}
              <div className="relative px-5 pb-5">
                <div className="relative -mt-8 mb-3 flex items-end gap-3">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 border-slate-800 bg-slate-700">
                    {vendor.logo ? (
                      <Image
                        src={vendor.logo}
                        alt={vendor.storeName}
                        width={64}
                        height={64}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Store className="h-6 w-6 text-slate-400" />
                      </div>
                    )}
                  </div>
                </div>
                <h3 className="text-lg font-semibold group-hover:text-purple-400 transition">
                  {vendor.storeName}
                </h3>
                <p className="text-sm text-slate-400">by {vendor.user.name}</p>
                {vendor.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-slate-300">
                    {vendor.description}
                  </p>
                )}
                <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Package className="h-3.5 w-3.5" />
                    {vendor._count.products} product{vendor._count.products !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
