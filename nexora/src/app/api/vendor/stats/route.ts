import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";

// GET /api/vendor/stats — vendor dashboard stats
export async function GET() {
  const { session, error } = await requireRole(["VENDOR"]);
  if (error) return error;

  try {
    const vendorId = session!.user.vendorProfileId!;

    const [totalProducts, activeProducts, totalOrders, earnings] = await Promise.all([
      prisma.product.count({ where: { vendorId } }),
      prisma.product.count({ where: { vendorId, status: "ACTIVE" } }),
      prisma.subOrder.count({ where: { vendorId } }),
      prisma.subOrder.aggregate({
        where: { vendorId, status: { in: ["DELIVERED"] } },
        _sum: { vendorEarnings: true },
      }),
    ]);

    const recentOrders = await prisma.subOrder.findMany({
      where: { vendorId },
      include: {
        items: { include: { product: { select: { title: true } } } },
        order: { select: { customer: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return NextResponse.json({
      data: {
        totalProducts,
        activeProducts,
        totalOrders,
        totalEarnings: earnings._sum.vendorEarnings || 0,
        recentOrders,
      },
    });
  } catch (error) {
    console.error("Vendor stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
