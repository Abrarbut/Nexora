import { auth } from "@/lib/auth";
import { Role } from "@prisma/client";
import { NextResponse } from "next/server";

/**
 * Get the current session or throw 401
 */
export async function getRequiredSession() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}

/**
 * Require a specific role — returns NextResponse error if unauthorized
 */
export async function requireRole(allowedRoles: Role[]) {
  const session = await auth();

  if (!session?.user) {
    return {
      session: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (!allowedRoles.includes(session.user.role as Role)) {
    return {
      session: null,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { session, error: null };
}

/**
 * Require the user to be the vendor who owns the resource
 */
export async function requireVendorOwnership(vendorProfileId: string) {
  const session = await auth();

  if (!session?.user) {
    return {
      session: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (
    session.user.role !== "VENDOR" &&
    session.user.role !== "ADMIN"
  ) {
    return {
      session: null,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  if (
    session.user.role === "VENDOR" &&
    session.user.vendorProfileId !== vendorProfileId
  ) {
    return {
      session: null,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { session, error: null };
}
