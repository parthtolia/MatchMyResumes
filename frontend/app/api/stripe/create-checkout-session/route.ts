import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getAuthUserId, handleAuthError, AuthError } from "@/lib/auth";
import { getStripe } from "@/lib/services/stripe-service";
import { config } from "@/lib/config";

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUserId();
    const body = await request.json();
    const { price_id, email } = body;

    if (!price_id) {
      return NextResponse.json(
        { detail: "price_id is required" },
        { status: 400 }
      );
    }

    const stripe = getStripe();

    // Determine actual price ID
    let actualPriceId = price_id;
    if (price_id === "pro" && config.stripePricePro) {
      actualPriceId = config.stripePricePro;
    } else if (price_id === "premium" && config.stripePricePremium) {
      actualPriceId = config.stripePricePremium;
    }

    const origin =
      request.headers.get("origin") || "http://localhost:3000";

    // Get or create user
    let [userDb] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!userDb) {
      await db.insert(users).values({
        id: userId,
        email: email || `${userId}@placeholder.auth`,
        clerkId: userId,
        plan: "free",
        usageCount: 0,
        isActive: true,
        isAdmin: false,
      });
      [userDb] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
    }

    // Create or use existing Stripe customer
    let customerId = userDb.stripeCustomerId;
    if (!customerId) {
      const customerParams: Record<string, any> = {
        metadata: { user_id: userDb.id },
      };
      const actualEmail = email || userDb.email;
      if (actualEmail && !actualEmail.endsWith("@placeholder.auth")) {
        customerParams.email = actualEmail;
      }

      const customer = await stripe.customers.create(customerParams);
      customerId = customer.id;
      await db
        .update(users)
        .set({ stripeCustomerId: customerId })
        .where(eq(users.id, userId));
    } else {
      // Update email on existing customer
      const actualEmail = email || userDb.email;
      if (actualEmail && !actualEmail.endsWith("@placeholder.auth")) {
        try {
          await stripe.customers.update(customerId, { email: actualEmail });
        } catch (e) {
          console.error("Could not update email for existing Customer:", e);
        }
      }
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{ price: actualPriceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${origin}/dashboard/pricing?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
      metadata: { user_id: userDb.id },
    });

    return NextResponse.json({ checkout_url: checkoutSession.url });
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error);
    console.error("Create checkout session error:", error);
    return NextResponse.json(
      { detail: String(error) },
      { status: 500 }
    );
  }
}
