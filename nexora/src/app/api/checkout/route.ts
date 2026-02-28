import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const checkoutSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
  })).min(1, "Cart is empty"),
  shippingAddress: z.object({
    name: z.string().min(1),
    address: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    zip: z.string().min(1),
    phone: z.string().min(1),
  }),
});

// POST /api/checkout — create order from cart
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = checkoutSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { items, shippingAddress } = validation.data;

    // Fetch all products with vendor info
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, status: "ACTIVE" },
      include: { vendor: true },
    });

    // Validate stock availability
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 400 }
        );
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for "${product.title}"` },
          { status: 400 }
        );
      }
    }

    // Group items by vendor
    const vendorGroups = new Map<string, { vendorId: string; commissionRate: number; items: { productId: string; quantity: number; price: number }[] }>();

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId)!;
      const vendorId = product.vendorId;

      if (!vendorGroups.has(vendorId)) {
        vendorGroups.set(vendorId, {
          vendorId,
          commissionRate: product.vendor.commissionRate,
          items: [],
        });
      }
      vendorGroups.get(vendorId)!.items.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
      });
    }

    // Calculate totals
    let orderTotal = 0;
    const subOrdersData: {
      vendorId: string;
      subtotal: number;
      vendorEarnings: number;
      platformFee: number;
      items: { productId: string; quantity: number; priceAtPurchase: number }[];
    }[] = [];

    for (const [, group] of vendorGroups) {
      const subtotal = group.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const platformFee = subtotal * (group.commissionRate / 100);
      const vendorEarnings = subtotal - platformFee;

      subOrdersData.push({
        vendorId: group.vendorId,
        subtotal,
        vendorEarnings,
        platformFee,
        items: group.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          priceAtPurchase: i.price,
        })),
      });

      orderTotal += subtotal;
    }

    // Create order in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the main order
      const newOrder = await tx.order.create({
        data: {
          customerId: session.user.id,
          total: orderTotal,
          shippingAddress: shippingAddress as Record<string, string>,
          subOrders: {
            create: subOrdersData.map((so) => ({
              vendorId: so.vendorId,
              subtotal: so.subtotal,
              vendorEarnings: so.vendorEarnings,
              platformFee: so.platformFee,
              items: {
                create: so.items,
              },
            })),
          },
        },
        include: {
          subOrders: {
            include: {
              items: { include: { product: { select: { title: true } } } },
              vendor: { select: { storeName: true } },
            },
          },
        },
      });

      // Decrement stock
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Update out-of-stock products
      await tx.product.updateMany({
        where: { stock: { lte: 0 }, status: "ACTIVE" },
        data: { status: "OUT_OF_STOCK" },
      });

      return newOrder;
    });

    return NextResponse.json(
      { data: order, message: "Order placed successfully!" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
  }
}
