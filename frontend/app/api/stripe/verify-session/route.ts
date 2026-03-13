import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getAuthUserId, handleAuthError, AuthError } from "@/lib/auth";
import { getStripe } from "@/lib/services/stripe-service";
import { config } from "@/lib/config";

export async function POST(request: NextRequest) {
  try {
    await getAuthUserId();
    const body = await request.json();
    const { session_id } = body;

    if (!session_id) {
      return NextResponse.json(
        { detail: "session_id is required" },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === "paid") {
      // Sync subscription to user
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;
      const metadata = session.metadata || {};
      const sessionUserId = metadata.user_id;

      if (customerId && subscriptionId) {
        const [user] = sessionUserId
          ? await db
              .select()
              .from(users)
              .where(eq(users.id, sessionUserId))
              .limit(1)
          : await db
              .select()
              .from(users)
              .where(eq(users.stripeCustomerId, customerId))
              .limit(1);

        if (user) {
          const subscription =
            await stripe.subscriptions.retrieve(subscriptionId);
          const priceId = subscription.items.data[0]?.price?.id;

          let plan: "pro" | "premium" = "pro";
          if (priceId === config.stripePricePremium) plan = "premium";

          await db
            .update(users)
            .set({
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
              stripeCurrentPeriodEnd: new Date(
                (subscription as any).current_period_end * 1000
              ),
              plan,
            })
            .where(eq(users.id, user.id));
        }
      }

      return NextResponse.json({
        status: "success",
        message: "Subscription synced",
      });
    }

    return NextResponse.json({
      status: "pending",
      message: "Payment not completed",
    });
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error);
    console.error("Verify session error:", error);
    return NextResponse.json(
      { detail: String(error) },
      { status: 500 }
    );
  }
}
