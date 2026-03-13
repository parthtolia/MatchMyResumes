import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getStripe } from "@/lib/services/stripe-service";
import { config } from "@/lib/config";

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const body = await request.text(); // Raw body for signature verification
  const sigHeader = request.headers.get("stripe-signature");

  if (!sigHeader) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sigHeader,
      config.stripeWebhookSecret
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as any;
      await handleCheckoutCompleted(session);
      break;
    }
    case "customer.subscription.updated": {
      const subscription = event.data.object as any;
      await handleSubscriptionUpdated(subscription);
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as any;
      await handleSubscriptionDeleted(subscription);
      break;
    }
  }

  return NextResponse.json({ status: "success" });
}

async function handleCheckoutCompleted(session: any) {
  const customerId = session.customer;
  const subscriptionId = session.subscription;
  const metadata = session.metadata || {};
  const userId = metadata.user_id;

  if (!customerId || !subscriptionId) return;

  const [user] = userId
    ? await db.select().from(users).where(eq(users.id, userId)).limit(1)
    : await db
        .select()
        .from(users)
        .where(eq(users.stripeCustomerId, customerId))
        .limit(1);

  if (!user) return;

  try {
    const stripe = getStripe();
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const priceId = subscription.items.data[0]?.price?.id;

    let plan: "free" | "pro" | "premium" = user.plan || "free";
    if (priceId === config.stripePricePremium) plan = "premium";
    else if (priceId === config.stripePricePro) plan = "pro";

    await db
      .update(users)
      .set({
        stripeCustomerId: user.stripeCustomerId || customerId,
        stripeSubscriptionId: subscriptionId,
        stripeCurrentPeriodEnd: new Date(
          (subscription as any).current_period_end * 1000
        ),
        plan,
      })
      .where(eq(users.id, user.id));

    console.log(
      `User ${user.email} successfully subscribed to ${plan}.`
    );
  } catch (e) {
    console.error("Error recording checkout session:", e);
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  const customerId = subscription.customer;
  const subscriptionId = subscription.id;
  const metadata = subscription.metadata || {};
  const userId = metadata.user_id;

  const [user] = userId
    ? await db.select().from(users).where(eq(users.id, userId)).limit(1)
    : await db
        .select()
        .from(users)
        .where(eq(users.stripeCustomerId, customerId))
        .limit(1);

  if (!user) return;

  const updateData: Record<string, any> = {
    stripeSubscriptionId: subscriptionId,
  };

  if (subscription.current_period_end != null) {
    updateData.stripeCurrentPeriodEnd = new Date(
      subscription.current_period_end * 1000
    );
  }

  const status = subscription.status;
  if (status === "active" || status === "trialing") {
    const items = subscription.items || {};
    const data = items.data || [];
    if (data.length > 0) {
      const priceId = data[0]?.price?.id;
      if (priceId === config.stripePricePremium)
        updateData.plan = "premium";
      else if (priceId === config.stripePricePro)
        updateData.plan = "pro";
    }
  }

  await db.update(users).set(updateData).where(eq(users.id, user.id));
}

async function handleSubscriptionDeleted(subscription: any) {
  const customerId = subscription.customer;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.stripeCustomerId, customerId))
    .limit(1);

  if (!user) return;

  await db
    .update(users)
    .set({
      plan: "free",
      stripeSubscriptionId: null,
      // KEEP the customer_id in case they re-subscribe
    })
    .where(eq(users.id, user.id));

  console.log(
    `User ${user.email} subscription canceled/ended. Reverted to Free plan.`
  );
}
