import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId, handleAuthError, AuthError } from "@/lib/auth";
import { getStripe } from "@/lib/services/stripe-service";
import { config } from "@/lib/config";

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUserId();
    const body = await request.json();
    const { plan, success_url, cancel_url } = body;

    if (!plan || !success_url || !cancel_url) {
      return NextResponse.json(
        { detail: "plan, success_url, and cancel_url are required" },
        { status: 400 }
      );
    }

    const stripe = getStripe();

    let priceId = "";
    if (plan === "pro") priceId = config.stripePricePro;
    else if (plan === "premium") priceId = config.stripePricePremium;
    else {
      return NextResponse.json(
        { detail: "Invalid plan. Must be 'pro' or 'premium'" },
        { status: 400 }
      );
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url,
      cancel_url,
      metadata: { user_id: userId },
    });

    return NextResponse.json({
      checkout_url: checkoutSession.url,
      session_id: checkoutSession.id,
    });
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error);
    console.error("Checkout error:", error);
    return NextResponse.json(
      { detail: String(error) },
      { status: 500 }
    );
  }
}
