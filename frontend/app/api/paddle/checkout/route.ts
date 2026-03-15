import { NextRequest, NextResponse } from "next/server";
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

    // Get user email for Paddle customer
    const [user] = await db
      .select({ email: users.email, paddleCustomerId: users.paddleCustomerId })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const paddle = getPaddle();

    const transaction = await paddle.transactions.create({
      items: [{ priceId, quantity: 1 }],
      customData: { user_id: userId },
      ...(user?.paddleCustomerId
        ? { customerId: user.paddleCustomerId }
        : {}),
    });

    return NextResponse.json({ transactionId: transaction.id });
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
