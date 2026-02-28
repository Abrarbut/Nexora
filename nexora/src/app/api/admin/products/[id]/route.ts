import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";

// PATCH /api/admin/products/[id] — approve, delist, or update product status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireRole(["ADMIN"]);
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !["ACTIVE", "DRAFT", "DELISTED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be ACTIVE, DRAFT, or DELISTED" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: { vendor: { select: { storeName: true } } },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { status },
      include: {
        category: true,
        vendor: { select: { id: true, storeName: true, slug: true } },
      },
    });

    return NextResponse.json({
      data: updated,
      message: `Product ${status === "ACTIVE" ? "approved" : status === "DELISTED" ? "delisted" : "set to draft"}`,
    });
  } catch (error) {
    console.error("Admin product update error:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}
