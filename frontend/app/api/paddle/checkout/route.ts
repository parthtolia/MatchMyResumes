import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { getAuthUserId, handleAuthError, AuthError } from "@/lib/auth";
import { getPaddle } from "@/lib/services/paddle-service";
import { config } from "@/lib/config";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUserId();
    const { planId } = await request.json();

    const priceId =
      planId === "premium" ? config.paddlePricePremium : config.paddlePricePro;

    if (!priceId) {
      return NextResponse.json(
        { detail: "Price not configured for this plan." },
        { status: 400 }
      );
    }

    const [user] = await db
      .select({
        paddleCustomerId: users.paddleCustomerId,
        paddleSubscriptionId: users.paddleSubscriptionId,
        plan: users.plan,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const paddle = getPaddle();

    // If user already has an active subscription, update it (upgrade/downgrade)
    // This swaps the price on the existing subscription instead of creating a
    // second one, so the old plan is automatically replaced.
    if (user?.paddleSubscriptionId) {
      const updated = await paddle.subscriptions.update(
        user.paddleSubscriptionId,
        {
          items: [{ priceId, quantity: 1 }],
          prorationBillingMode: "prorated_immediately",
          customData: { user_id: userId },
        }
      );

      // Update plan in DB immediately (webhook will also confirm)
      let plan: "free" | "pro" | "premium" = "free";
      if (priceId === config.paddlePricePremium) plan = "premium";
      else if (priceId === config.paddlePricePro) plan = "pro";

      await db
        .update(users)
        .set({ plan })
        .where(eq(users.id, userId));

      return NextResponse.json({
        upgraded: true,
        plan,
        transactionId: null,
        email: null,
      });
    }

    // New subscription — create a transaction for the checkout overlay
    let email: string | null = null;
    try {
      const clerk = await clerkClient();
      const clerkUser = await clerk.users.getUser(userId);
      email = clerkUser.emailAddresses?.[0]?.emailAddress || null;
    } catch {
      // Non-critical — checkout will just ask for email
    }

    const origin = request.headers.get("origin") || request.nextUrl.origin;

    const transaction = await paddle.transactions.create({
      items: [{ priceId, quantity: 1 }],
      customData: { user_id: userId },
      checkout: {
        url: `${origin}/dashboard/pricing`,
      },
      ...(user?.paddleCustomerId
        ? { customerId: user.paddleCustomerId }
        : {}),
    });

    // Save the Paddle customerId immediately so /api/paddle/sync can
    // query transactions even before the webhook arrives.
    if (transaction.customerId && transaction.customerId !== user?.paddleCustomerId) {
      await db
        .update(users)
        .set({ paddleCustomerId: transaction.customerId })
        .where(eq(users.id, userId));
    }

    return NextResponse.json({
      upgraded: false,
      transactionId: transaction.id,
      email,
    });
  } catch (error: any) {
    if (error instanceof AuthError) return handleAuthError(error);
    console.error("Paddle checkout error:", error);
    const message =
      error?.errors?.[0]?.detail ||
      error?.message ||
      "Failed to create checkout session.";
    return NextResponse.json({ detail: message }, { status: 500 });
  }
}
