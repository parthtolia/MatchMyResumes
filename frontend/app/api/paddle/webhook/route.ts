import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getPaddle } from "@/lib/services/paddle-service";
import { config } from "@/lib/config";
import type { EventEntity, SubscriptionNotification } from "@paddle/paddle-node-sdk";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("paddle-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: EventEntity;
  try {
    const paddle = getPaddle();
    event = await paddle.webhooks.unmarshal(body, config.paddleWebhookSecret, signature);
  } catch {
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    switch (event.eventType) {
      case "subscription.created":
      case "subscription.updated": {
        const sub = event.data as SubscriptionNotification;
        await handleSubscriptionChange(sub);
        break;
      }
      case "subscription.canceled": {
        const sub = event.data as SubscriptionNotification;
        await handleSubscriptionCanceled(sub);
        break;
      }
    }
  } catch (e) {
    console.error("Paddle webhook handler error:", e);
  }

  return NextResponse.json({ status: "success" });
}

async function handleSubscriptionChange(sub: SubscriptionNotification) {
  const customData = (sub.customData as Record<string, string>) || {};
  const userId = customData.user_id;
  const customerId = sub.customerId;

  if (!userId && !customerId) return;

  const [user] = userId
    ? await db.select().from(users).where(eq(users.id, userId)).limit(1)
    : await db
        .select()
        .from(users)
        .where(eq(users.paddleCustomerId, customerId!))
        .limit(1);

  if (!user) return;

  const priceId = sub.items?.[0]?.price?.id;
  let plan: "free" | "pro" | "premium" = user.plan || "free";

  if (sub.status === "active" || sub.status === "trialing") {
    if (priceId === config.paddlePricePremium) plan = "premium";
    else if (priceId === config.paddlePricePro) plan = "pro";
  }

  const periodEnd = sub.currentBillingPeriod?.endsAt
    ? new Date(sub.currentBillingPeriod.endsAt)
    : null;

  await db
    .update(users)
    .set({
      paddleCustomerId: customerId || user.paddleCustomerId,
      paddleSubscriptionId: sub.id,
      paddleCurrentPeriodEnd: periodEnd,
      plan,
    })
    .where(eq(users.id, user.id));

  console.log(`User ${user.email} subscription updated to ${plan}.`);
}

async function handleSubscriptionCanceled(sub: SubscriptionNotification) {
  const customData = (sub.customData as Record<string, string>) || {};
  const userId = customData.user_id;
  const customerId = sub.customerId;

  const [user] = userId
    ? await db.select().from(users).where(eq(users.id, userId)).limit(1)
    : customerId
      ? await db
          .select()
          .from(users)
          .where(eq(users.paddleCustomerId, customerId))
          .limit(1)
      : [];

  if (!user) return;

  await db
    .update(users)
    .set({
      plan: "free",
      paddleSubscriptionId: null,
    })
    .where(eq(users.id, user.id));

  console.log(
    `User ${user.email} subscription canceled. Reverted to Free plan.`
  );
}
