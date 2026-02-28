import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { updateOrderStatusSchema } from "@/lib/validations";

// GET /api/vendor/orders — list vendor's sub-orders
export async function GET(request: NextRequest) {
  const { session, error } = await requireRole(["VENDOR"]);
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {
      vendorId: session!.user.vendorProfileId,
    };
    if (status) where.status = status;

    const [subOrders, total] = await Promise.all([
      prisma.subOrder.findMany({
        where,
        include: {
          items: {
            include: { product: { select: { id: true, title: true, images: true } } },
          },
          order: {
            select: { id: true, customerId: true, shippingAddress: true, customer: { select: { name: true, email: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.subOrder.count({ where }),
    ]);

    return NextResponse.json({
      data: subOrders,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("Vendor orders error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

// PATCH /api/vendor/orders — update sub-order status
export async function PATCH(request: NextRequest) {
  const { session, error } = await requireRole(["VENDOR"]);
  if (error) return error;

  try {
    const body = await request.json();
    const { subOrderId, ...statusData } = body;

    if (!subOrderId) {
      return NextResponse.json({ error: "subOrderId is required" }, { status: 400 });
    }

    const validation = updateOrderStatusSchema.safeParse(statusData);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    // Verify ownership
    const subOrder = await prisma.subOrder.findUnique({ where: { id: subOrderId } });
    if (!subOrder || subOrder.vendorId !== session!.user.vendorProfileId) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updated = await prisma.subOrder.update({
      where: { id: subOrderId },
      data: { status: validation.data.status },
    });

    return NextResponse.json({ data: updated, message: "Order status updated" });
  } catch (error) {
    console.error("Update order error:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
