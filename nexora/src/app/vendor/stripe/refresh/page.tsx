import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { RefreshCw } from "lucide-react";
import StripeConnectButton from "@/components/StripeConnectButton";

export default async function StripeRefreshPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "VENDOR") redirect("/");

  return (
    <div className="mx-auto max-w-lg py-20 text-center">
      <RefreshCw className="mx-auto h-16 w-16 text-yellow-400" />
      <h1 className="mt-4 text-2xl font-bold">Link Expired</h1>
      <p className="mt-2 text-slate-400">
        Your Stripe onboarding link has expired. Click below to generate a new one.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3">
        <StripeConnectButton />
        <Link href="/vendor" className="text-sm text-slate-400 transition hover:text-white">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
