import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getAuthUserId, handleAuthError, AuthError } from "@/lib/auth";
import { getStripe } from "@/lib/services/stripe-service";

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUserId();
    const stripe = getStripe();
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
        email: `${userId}@placeholder.auth`,
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
      if (userDb.email && !userDb.email.endsWith("@placeholder.auth")) {
        customerParams.email = userDb.email;
      }

      const customer = await stripe.customers.create(customerParams);
      customerId = customer.id;
      await db
        .update(users)
        .set({ stripeCustomerId: customerId })
        .where(eq(users.id, userId));
    }

    if (!customerId) {
      return NextResponse.json(
        { detail: "User is not a Stripe customer yet." },
        { status: 400 }
      );
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/dashboard/settings`,
    });

    return NextResponse.json({ portal_url: portalSession.url });
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error);
    console.error("Create portal session error:", error);
    return NextResponse.json(
      { detail: String(error) },
      { status: 500 }
    );
  }
}
