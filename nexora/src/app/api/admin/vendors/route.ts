import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";

// GET /api/admin/vendors — list all vendor applications
export async function GET(request: NextRequest) {
  const { error } = await requireRole(["ADMIN"]);
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const [vendors, total] = await Promise.all([
      prisma.vendorProfile.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, image: true, createdAt: true } },
          _count: { select: { products: true, subOrders: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.vendorProfile.count({ where }),
    ]);

    return NextResponse.json({
      data: vendors,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("Admin vendors error:", error);
    return NextResponse.json({ error: "Failed to fetch vendors" }, { status: 500 });
  }
}

// PATCH /api/admin/vendors — approve/suspend a vendor
export async function PATCH(request: NextRequest) {
  const { error } = await requireRole(["ADMIN"]);
  if (error) return error;

  try {
    const { vendorId, status } = await request.json();

    if (!vendorId || !["APPROVED", "SUSPENDED", "PENDING"].includes(status)) {
      return NextResponse.json({ error: "Invalid vendorId or status" }, { status: 400 });
    }

    const vendor = await prisma.vendorProfile.update({
      where: { id: vendorId },
      data: { status },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    // If approved, ensure user role is VENDOR
    if (status === "APPROVED") {
      await prisma.user.update({
        where: { id: vendor.userId },
        data: { role: "VENDOR" },
      });
    }

    return NextResponse.json({ data: vendor, message: `Vendor ${status.toLowerCase()}` });
  } catch (error) {
    console.error("Admin vendor update error:", error);
    return NextResponse.json({ error: "Failed to update vendor" }, { status: 500 });
  }
}
