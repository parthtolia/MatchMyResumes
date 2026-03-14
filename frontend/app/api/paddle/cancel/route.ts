import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getAuthUserId, handleAuthError, AuthError } from "@/lib/auth";
import { getPaddle } from "@/lib/services/paddle-service";

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUserId();

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user || !user.paddleSubscriptionId) {
      return NextResponse.json(
        { detail: "No active subscription found" },
        { status: 400 }
      );
    }

    const paddle = getPaddle();
    await paddle.subscriptions.cancel(user.paddleSubscriptionId, {
      effectiveFrom: "next_billing_period",
    });

    return NextResponse.json({
      status: "success",
      message: "Subscription will cancel at end of billing period",
    });
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error);
    console.error("Cancel subscription error:", error);
    return NextResponse.json(
      { detail: String(error) },
      { status: 500 }
    );
  }
}
