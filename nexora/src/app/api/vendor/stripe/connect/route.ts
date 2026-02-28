import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

/**
 * POST /api/vendor/stripe/connect
 * Creates a Stripe Express account for the vendor and returns an onboarding link.
 */
export async function POST() {
  const { session, error } = await requireRole(["VENDOR"]);
  if (error) return error;

  const vendor = await prisma.vendorProfile.findUnique({
    where: { userId: session!.user.id },
    include: { user: { select: { email: true, name: true } } },
  });

  if (!vendor || vendor.status !== "APPROVED") {
    return NextResponse.json(
      { error: "Vendor must be approved to connect Stripe" },
      { status: 403 }
    );
  }

  try {
    let stripeAccountId = vendor.stripeAccountId;

    // Create a new Stripe Express account if one doesn't exist
    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: vendor.user.email,
        metadata: {
          vendorId: vendor.id,
          userId: vendor.userId,
        },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_profile: {
          name: vendor.storeName,
        },
      });

      stripeAccountId = account.id;

      await prisma.vendorProfile.update({
        where: { id: vendor.id },
        data: { stripeAccountId: account.id },
      });
    }

    // Create an onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${process.env.NEXTAUTH_URL}/vendor/stripe/refresh`,
      return_url: `${process.env.NEXTAUTH_URL}/vendor/stripe/return`,
      type: "account_onboarding",
    });

    return NextResponse.json({ data: { url: accountLink.url } });
  } catch (err) {
    console.error("Stripe Connect error:", err);
    return NextResponse.json(
      { error: "Failed to create Stripe onboarding link" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/vendor/stripe/connect
 * Returns the vendor's Stripe connection status.
 */
export async function GET() {
  const { session, error } = await requireRole(["VENDOR"]);
  if (error) return error;

  const vendor = await prisma.vendorProfile.findUnique({
    where: { userId: session!.user.id },
    select: { stripeAccountId: true, status: true },
  });

  if (!vendor) {
    return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
  }

  if (!vendor.stripeAccountId) {
    return NextResponse.json({
      data: { connected: false, chargesEnabled: false, payoutsEnabled: false },
    });
  }

  try {
    const account = await stripe.accounts.retrieve(vendor.stripeAccountId);

    return NextResponse.json({
      data: {
        connected: true,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
        stripeAccountId: vendor.stripeAccountId,
      },
    });
  } catch {
    return NextResponse.json({
      data: { connected: false, chargesEnabled: false, payoutsEnabled: false },
    });
  }
}
