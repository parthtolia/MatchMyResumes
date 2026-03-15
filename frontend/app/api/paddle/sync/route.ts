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

    if (!user.paddleCustomerId) {
      return NextResponse.json({ plan: user.plan || "free" });
    }

    // Check Paddle for the most recent completed transaction
    const paddle = getPaddle();
    const transactions = paddle.transactions.list({
      customerId: [user.paddleCustomerId],
      status: ["completed"],
    });

    let latestPlan: "free" | "pro" | "premium" = user.plan || "free";

    for await (const txn of transactions) {
      const priceId = txn.items?.[0]?.price?.id;

      if (priceId === config.paddlePricePremium) {
        latestPlan = "premium";
        break; // Premium is highest tier
      } else if (priceId === config.paddlePricePro && latestPlan !== "premium") {
        latestPlan = "pro";
      }
    }

    if (latestPlan !== user.plan) {
      await db
        .update(users)
        .set({ plan: latestPlan })
        .where(eq(users.id, userId));
    }

    return NextResponse.json({ plan: latestPlan });
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error);
    console.error("Paddle sync error:", error);
    return NextResponse.json({ plan: "free" });
  }
}
