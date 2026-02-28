import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Store } from "lucide-react";
import VendorActionButton from "./VendorActionButton";

export default async function AdminVendorsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");

  const vendors = await prisma.vendorProfile.findMany({
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { products: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const pending = vendors.filter((v) => v.status === "PENDING");
  const approved = vendors.filter((v) => v.status === "APPROVED");
  const suspended = vendors.filter((v) => v.status === "SUSPENDED");

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-3xl font-bold">Manage Vendors</h1>
      <p className="mt-1 text-slate-400">{vendors.length} vendor(s) total</p>

      {/* Tabs Summary */}
      <div className="mt-6 flex gap-4 text-sm">
        <span className="rounded-full bg-yellow-400/10 px-4 py-1.5 font-medium text-yellow-400">
          {pending.length} Pending
        </span>
        <span className="rounded-full bg-emerald-400/10 px-4 py-1.5 font-medium text-emerald-400">
          {approved.length} Approved
        </span>
        <span className="rounded-full bg-red-400/10 px-4 py-1.5 font-medium text-red-400">
          {suspended.length} Suspended
        </span>
      </div>

      {/* Pending Vendors */}
      {pending.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-yellow-400">Pending Applications</h2>
          <div className="mt-4 space-y-4">
            {pending.map((vendor) => (
              <div key={vendor.id} className="rounded-xl border border-yellow-500/20 bg-slate-800/50 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">{vendor.storeName}</h3>
                    <p className="text-sm text-slate-400">{vendor.user.name} &middot; {vendor.user.email}</p>
                    {vendor.description && (
                      <p className="mt-2 text-sm text-slate-300">{vendor.description}</p>
                    )}
                    <p className="mt-1 text-xs text-slate-500">Applied {new Date(vendor.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <VendorActionButton vendorId={vendor.id} action="APPROVED" label="Approve" variant="green" />
                    <VendorActionButton vendorId={vendor.id} action="SUSPENDED" label="Reject" variant="red" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approved Vendors */}
      {approved.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-emerald-400">Approved Vendors</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-700 text-slate-400">
                <tr>
                  <th className="pb-3 pr-4">Business</th>
                  <th className="pb-3 pr-4">Owner</th>
                  <th className="pb-3 pr-4">Products</th>
                  <th className="pb-3 pr-4">Joined</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {approved.map((vendor) => (
                  <tr key={vendor.id}>
                    <td className="py-3 pr-4 font-medium">{vendor.storeName}</td>
                    <td className="py-3 pr-4 text-slate-400">{vendor.user.name || vendor.user.email}</td>
                    <td className="py-3 pr-4">{vendor._count.products}</td>
                    <td className="py-3 pr-4 text-slate-400">{new Date(vendor.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 text-right">
                      <VendorActionButton vendorId={vendor.id} action="SUSPENDED" label="Suspend" variant="red" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Suspended Vendors */}
      {suspended.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-red-400">Suspended Vendors</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-700 text-slate-400">
                <tr>
                  <th className="pb-3 pr-4">Business</th>
                  <th className="pb-3 pr-4">Owner</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {suspended.map((vendor) => (
                  <tr key={vendor.id}>
                    <td className="py-3 pr-4 font-medium">{vendor.storeName}</td>
                    <td className="py-3 pr-4 text-slate-400">{vendor.user.name || vendor.user.email}</td>
                    <td className="py-3 text-right">
                      <VendorActionButton vendorId={vendor.id} action="APPROVED" label="Reactivate" variant="green" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {vendors.length === 0 && (
        <div className="mt-16 flex flex-col items-center text-center">
          <Store className="mb-4 h-16 w-16 text-slate-600" />
          <p className="text-lg font-semibold">No vendors yet</p>
          <p className="mt-1 text-slate-400">Vendor applications will appear here.</p>
        </div>
      )}
    </div>
  );
}
