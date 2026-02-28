import Stripe from "stripe";

function createStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    // Return a proxy that throws meaningful errors at runtime instead of build time
    return new Proxy({} as Stripe, {
      get(_, prop) {
        if (prop === "then") return undefined;
        throw new Error("STRIPE_SECRET_KEY is not set");
      },
    });
  }
  return new Stripe(key, {
    apiVersion: "2025-12-18.acacia" as Stripe.LatestApiVersion,
    typescript: true,
  });
}

export const stripe = createStripeClient();
