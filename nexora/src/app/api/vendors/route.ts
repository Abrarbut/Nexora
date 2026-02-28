import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/vendors
 * Returns all approved vendors (public).
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize")) || 12));

  const where = { status: "APPROVED" as const };

  const [vendors, total] = await Promise.all([
    prisma.vendorProfile.findMany({
      where,
      include: {
        user: { select: { name: true } },
        _count: { select: { products: { where: { status: "ACTIVE" } } } },
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
}
