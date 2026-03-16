import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId, handleAuthError, AuthError } from "@/lib/auth";
import { getPaddle } from "@/lib/services/paddle-service";
import { config } from "@/lib/config";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * POST /api/paddle/sync
 *
 * Called by the frontend after checkout.completed to sync the plan.
 * Accepts optional { customerId, transactionId } from the checkout event
 * so it can resolve the plan even before the webhook arrives.
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUserId();

    let body: { customerId?: string; transactionId?: string } = {};
    try {
      body = await request.json();
    } catch {
      // Empty body is fine — backwards compatible
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ plan: "free" });
    }

    const paddle = getPaddle();

    // Determine the effective Paddle customer ID:
    // 1. From the checkout event (most reliable for first-time checkout)
    // 2. From the DB (set by webhook or previous checkout)
    const effectiveCustomerId =
      body.customerId || user.paddleCustomerId || null;

    // If we got a customerId from the checkout event, persist it
    if (body.customerId && body.customerId !== user.paddleCustomerId) {
      await db
        .update(users)
        .set({ paddleCustomerId: body.customerId })
        .where(eq(users.id, userId));
    }

    // Strategy 1: Look up the specific transaction from the checkout event
    if (body.transactionId) {
      try {
        const txn = await paddle.transactions.get(body.transactionId);
        if (txn.status === "completed" || txn.status === "paid") {
          const priceId = txn.items?.[0]?.price?.id;
          let plan: "free" | "pro" | "premium" = "free";
          if (priceId === config.paddlePricePremium) plan = "premium";
          else if (priceId === config.paddlePricePro) plan = "pro";

          if (plan !== "free") {
            const updateData: Record<string, unknown> = { plan };
            if (txn.customerId && txn.customerId !== user.paddleCustomerId) {
              updateData.paddleCustomerId = txn.customerId;
            }
            if (txn.subscriptionId) {
              updateData.paddleSubscriptionId = txn.subscriptionId;
            }
            await db
              .update(users)
              .set(updateData)
              .where(eq(users.id, userId));

            return NextResponse.json({ plan });
          }
        }
      } catch (e) {
        console.error("Paddle sync: transaction lookup failed:", e);
        // Fall through to customer-based lookup
      }
    }

    // Strategy 2: List completed transactions by customer ID
    if (effectiveCustomerId) {
      try {
        const transactions = paddle.transactions.list({
          customerId: [effectiveCustomerId],
          status: ["completed"],
        });

        let latestPlan: "free" | "pro" | "premium" = user.plan || "free";

        for await (const txn of transactions) {
          const priceId = txn.items?.[0]?.price?.id;

          if (priceId === config.paddlePricePremium) {
            latestPlan = "premium";
            break;
          } else if (
            priceId === config.paddlePricePro &&
            latestPlan !== "premium"
          ) {
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
      } catch (e) {
        console.error("Paddle sync: customer transaction lookup failed:", e);
      }
    }

    // Fallback: return current DB plan
    return NextResponse.json({ plan: user.plan || "free" });
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error);
    console.error("Paddle sync error:", error);
    try {
      const userId = await getAuthUserId();
      const [u] = await db
        .select({ plan: users.plan })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      return NextResponse.json({ plan: u?.plan || "free" });
    } catch {
      return NextResponse.json({ plan: "free" });
    }
  }
}
