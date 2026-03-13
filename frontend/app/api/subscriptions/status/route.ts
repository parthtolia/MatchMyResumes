import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getAuthUserId, handleAuthError, AuthError } from "@/lib/auth";

export async function GET() {
  try {
    const userId = await getAuthUserId();

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user || user.plan === "free") {
      return NextResponse.json({
        plan: "free",
        status: "none",
        current_period_end: null,
        cancel_at_period_end: false,
      });
    }

    return NextResponse.json({
      plan: user.plan,
      status: "active",
      current_period_end: user.stripeCurrentPeriodEnd,
      cancel_at_period_end: false,
    });
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error);
    console.error("Subscription status error:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
