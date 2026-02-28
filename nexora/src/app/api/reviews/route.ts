import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { reviewSchema } from "@/lib/validations";

// POST /api/reviews — create a review
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = reviewSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { productId, rating, comment } = validation.data;

    // Check product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if user already reviewed
    const existing = await prisma.review.findFirst({
      where: { userId: session.user.id, productId },
    });
    if (existing) {
      return NextResponse.json({ error: "You already reviewed this product" }, { status: 400 });
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        productId,
        vendorId: product.vendorId,
        rating,
        comment,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });

    // Update product average rating
    const avgRating = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
    });

    await prisma.product.update({
      where: { id: productId },
      data: { rating: avgRating._avg.rating || 0 },
    });

    return NextResponse.json({ data: review, message: "Review submitted" }, { status: 201 });
  } catch (error) {
    console.error("Review error:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
