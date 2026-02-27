import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { vendorApplySchema } from "@/lib/validations";
import { requireRole } from "@/lib/auth-helpers";
import slugify from "slugify";

export async function POST(request: Request) {
  try {
    // Must be a logged-in CUSTOMER to apply
    const { session, error } = await requireRole(["CUSTOMER"]);
    if (error) return error;

    const body = await request.json();
    const validation = vendorApplySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { storeName, description, categoryId } = validation.data;

    // Check if user already has a vendor profile
    const existingProfile = await prisma.vendorProfile.findUnique({
      where: { userId: session!.user.id },
    });

    if (existingProfile) {
      return NextResponse.json(
        { error: "You already have a vendor application" },
        { status: 409 }
      );
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Invalid category" },
        { status: 400 }
      );
    }

    // Generate unique slug from store name
    let slug = slugify(storeName, { lower: true, strict: true });
    const existingSlug = await prisma.vendorProfile.findUnique({
      where: { slug },
    });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    // Create vendor profile + update user role in a transaction
    const vendorProfile = await prisma.$transaction(async (tx) => {
      const profile = await tx.vendorProfile.create({
        data: {
          userId: session!.user.id,
          storeName,
          slug,
          description,
          commissionRate: category.commissionRate ?? 10,
        },
      });

      await tx.user.update({
        where: { id: session!.user.id },
        data: { role: "VENDOR" },
      });

      return profile;
    });

    return NextResponse.json(
      {
        message: "Vendor application submitted successfully",
        data: {
          id: vendorProfile.id,
          storeName: vendorProfile.storeName,
          slug: vendorProfile.slug,
          status: vendorProfile.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Vendor apply error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
