import { NextResponse } from "next/server";
import { getAuthUserId, handleAuthError, AuthError } from "@/lib/auth";
import { getPaddle } from "@/lib/services/paddle-service";
import { config } from "@/lib/config";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * POST /api/paddle/sync
 *
 * Called by the frontend after checkout.completed to sync the plan
 * from Paddle in case the webhook hasn't arrived yet.
 */
export async function POST() {
  try {
    const userId = await getAuthUserId();

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ plan: "free" });
    }

    // If already upgraded, return current plan
    if (user.plan !== "free") {
      return NextResponse.json({ plan: user.plan });
    }

    // No subscription ID yet (webhook hasn't arrived) — check Paddle directly
    // Look up transactions with this user's custom data
    const paddle = getPaddle();
    const transactions = paddle.transactions.list({
      customerId: user.paddleCustomerId ? [user.paddleCustomerId] : undefined,
      status: ["completed"],
    });

    for await (const txn of transactions) {
      const customData = (txn.customData as Record<string, string>) || {};
      if (customData.user_id !== userId) continue;

      const priceId = txn.items?.[0]?.price?.id;
      let plan: "free" | "pro" | "premium" = "free";

      if (priceId === config.paddlePricePremium) plan = "premium";
      else if (priceId === config.paddlePricePro) plan = "pro";

      if (plan !== "free") {
        await db
          .update(users)
          .set({
            paddleCustomerId: txn.customerId || user.paddleCustomerId,
            paddleSubscriptionId: txn.subscriptionId || user.paddleSubscriptionId,
            plan,
          })
          .where(eq(users.id, userId));

        return NextResponse.json({ plan });
      }
    }

    return NextResponse.json({ plan: "free" });
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error);
    console.error("Paddle sync error:", error);
    return NextResponse.json({ plan: "free" });
  }
}
