import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default async function StripeReturnPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "VENDOR") redirect("/");

  const vendor = await prisma.vendorProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!vendor?.stripeAccountId) redirect("/vendor");

  let stripeStatus = { chargesEnabled: false, detailsSubmitted: false };
  try {
    const account = await stripe.accounts.retrieve(vendor.stripeAccountId);
    stripeStatus = {
      chargesEnabled: account.charges_enabled ?? false,
      detailsSubmitted: account.details_submitted ?? false,
    };
  } catch {
    // If we can't retrieve, show incomplete status
  }

  const isComplete = stripeStatus.chargesEnabled && stripeStatus.detailsSubmitted;

  return (
    <div className="mx-auto max-w-lg py-20 text-center">
      {isComplete ? (
        <>
          <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-400" />
          <h1 className="mt-4 text-2xl font-bold">Stripe Connected!</h1>
          <p className="mt-2 text-slate-400">
            Your Stripe account is fully set up. You can now receive payments from customers.
          </p>
        </>
      ) : (
        <>
          <AlertTriangle className="mx-auto h-16 w-16 text-yellow-400" />
          <h1 className="mt-4 text-2xl font-bold">Almost There</h1>
          <p className="mt-2 text-slate-400">
            Your Stripe account setup is incomplete. Please complete the remaining steps to start receiving payments.
          </p>
        </>
      )}
      <Link
        href="/vendor"
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-500"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
