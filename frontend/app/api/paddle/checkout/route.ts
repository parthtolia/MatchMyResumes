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

    // Get Paddle customer ID from DB
    const [user] = await db
      .select({ paddleCustomerId: users.paddleCustomerId })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    // Get real email from Clerk (DB may have placeholder)
    let email: string | null = null;
    try {
      const clerk = await clerkClient();
      const clerkUser = await clerk.users.getUser(userId);
      email = clerkUser.emailAddresses?.[0]?.emailAddress || null;
    } catch {
      // Non-critical — checkout will just ask for email
    }

    const paddle = getPaddle();

    // Build the origin from the incoming request so the checkout URL
    // works in both preview and production deployments.
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

    return NextResponse.json({
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
