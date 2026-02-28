import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { productSchema } from "@/lib/validations";

// GET /api/vendor/products — list vendor's own products
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

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      data: products,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("Vendor products error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

// POST /api/vendor/products — create a new product
export async function POST(request: NextRequest) {
  const { session, error } = await requireRole(["VENDOR"]);
  if (error) return error;

  try {
    const body = await request.json();
    const validation = productSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { title, description, price, stock, categoryId, images, status: productStatus } = validation.data;

    const product = await prisma.product.create({
      data: {
        title,
        description,
        price,
        stock,
        categoryId,
        images,
        status: productStatus || "DRAFT",
        vendorId: session!.user.vendorProfileId!,
      },
      include: { category: true },
    });

    return NextResponse.json({ data: product, message: "Product created" }, { status: 201 });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
