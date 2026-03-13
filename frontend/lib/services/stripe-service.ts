import Stripe from "stripe";
import { config } from "@/lib/config";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeClient) {
    stripeClient = new Stripe(config.stripeSecretKey, {
      apiVersion: "2025-02-24.acacia" as any,
    });
  }
  return stripeClient;
}
