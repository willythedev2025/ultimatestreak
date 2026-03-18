import Stripe from "stripe";

const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
  console.warn("WARNING: STRIPE_SECRET_KEY not set — payment routes will fail");
}

export const stripe = stripeKey
  ? new Stripe(stripeKey, { apiVersion: "2025-02-24.acacia" })
  : (null as unknown as Stripe);
