import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";

// GET /api/admin/stats — admin dashboard stats
export async function GET() {
  const { error } = await requireRole(["ADMIN"]);
  if (error) return error;

  try {
    const [
      totalUsers,
      totalVendors,
      pendingVendors,
      totalProducts,
      totalOrders,
      revenue,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.vendorProfile.count({ where: { status: "APPROVED" } }),
      prisma.vendorProfile.count({ where: { status: "PENDING" } }),
      prisma.product.count({ where: { status: "ACTIVE" } }),
      prisma.order.count(),
      prisma.subOrder.aggregate({
        where: { status: "DELIVERED" },
        _sum: { platformFee: true },
      }),
    ]);

    const recentOrders = await prisma.order.findMany({
      include: {
        customer: { select: { name: true, email: true } },
        subOrders: {
          include: { vendor: { select: { storeName: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({
      data: {
        totalUsers,
        totalVendors,
        pendingVendors,
        totalProducts,
        totalOrders,
        platformRevenue: revenue._sum.platformFee || 0,
        recentOrders,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
