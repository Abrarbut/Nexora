import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/vendors/[slug]
 * Returns a single vendor and their active products (public).
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const vendor = await prisma.vendorProfile.findUnique({
    where: { slug, status: "APPROVED" },
    include: {
      user: { select: { name: true } },
      products: {
        where: { status: "ACTIVE" },
        include: { category: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!vendor) {
    return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
  }

  return NextResponse.json({ data: vendor });
}
