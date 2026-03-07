"""
Stripe Service
Handles subscription checkout, webhook processing, and plan management.
"""
import stripe
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import get_settings
from app.models.subscription import Subscription, SubscriptionStatus, SubscriptionPlan
from app.models.user import User, PlanType

settings = get_settings()
stripe.api_key = settings.stripe_secret_key


async def create_checkout_session(
    user_id: str,
    user_email: str,
    plan: str,
    success_url: str,
    cancel_url: str,
) -> dict:
    """Create a Stripe Checkout Session for a subscription."""
    price_id = (
        settings.stripe_price_pro if plan == "pro" else settings.stripe_price_premium
    )
    
    if not price_id:
        raise ValueError(f"No Stripe price configured for plan: {plan}")
    
    session = stripe.checkout.Session.create(
        customer_email=user_email,
        payment_method_types=["card"],
        line_items=[{"price": price_id, "quantity": 1}],
        mode="subscription",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={"user_id": user_id, "plan": plan},
        subscription_data={
            "metadata": {"user_id": user_id, "plan": plan}
        },
    )
    
    return {"checkout_url": session.url, "session_id": session.id}


async def handle_webhook(payload: bytes, sig_header: str, db: AsyncSession) -> dict:
    """Process Stripe webhook events."""
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.stripe_webhook_secret
        )
    except stripe.error.SignatureVerificationError:
        raise ValueError("Invalid Stripe webhook signature")
    
    event_type = event["type"]
    data = event["data"]["object"]
    
    if event_type in ("customer.subscription.created", "customer.subscription.updated"):
        await _sync_subscription(data, db)
    
    elif event_type == "customer.subscription.deleted":
        await _cancel_subscription(data, db)
    
    elif event_type == "invoice.payment_succeeded":
        sub_id = data.get("subscription")
        if sub_id:
            sub = stripe.Subscription.retrieve(sub_id)
            await _sync_subscription(sub, db)
    
    elif event_type == "invoice.payment_failed":
        sub_id = data.get("subscription")
        if sub_id:
            await _update_subscription_status(sub_id, SubscriptionStatus.past_due, db)
    
    return {"status": "processed", "event_type": event_type}


async def _sync_subscription(stripe_sub: dict, db: AsyncSession):
    """Sync a Stripe subscription to the local database."""
    user_id = stripe_sub.get("metadata", {}).get("user_id")
    plan_name = stripe_sub.get("metadata", {}).get("plan", "pro")
    
    if not user_id:
        return
    
    status_map = {
        "active": SubscriptionStatus.active,
        "past_due": SubscriptionStatus.past_due,
        "canceled": SubscriptionStatus.canceled,
        "trialing": SubscriptionStatus.trialing,
        "incomplete": SubscriptionStatus.incomplete,
    }
    status = status_map.get(stripe_sub["status"], SubscriptionStatus.incomplete)
    plan = SubscriptionPlan.pro if plan_name == "pro" else SubscriptionPlan.premium
    
    period_start = datetime.fromtimestamp(stripe_sub["current_period_start"], tz=timezone.utc)
    period_end = datetime.fromtimestamp(stripe_sub["current_period_end"], tz=timezone.utc)
    
    # Upsert subscription
    result = await db.execute(select(Subscription).where(Subscription.user_id == user_id))
    sub_record = result.scalar_one_or_none()
    
    if sub_record:
        sub_record.stripe_subscription_id = stripe_sub["id"]
        sub_record.stripe_customer_id = stripe_sub["customer"]
        sub_record.plan = plan
        sub_record.status = status
        sub_record.current_period_start = period_start
        sub_record.current_period_end = period_end
        sub_record.cancel_at_period_end = stripe_sub.get("cancel_at_period_end", False)
    else:
        sub_record = Subscription(
            user_id=user_id,
            stripe_subscription_id=stripe_sub["id"],
            stripe_customer_id=stripe_sub["customer"],
            plan=plan,
            status=status,
            current_period_start=period_start,
            current_period_end=period_end,
        )
        db.add(sub_record)
    
    # Update user plan
    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()
    if user:
        user.plan = PlanType(plan_name)
        user.stripe_customer_id = stripe_sub["customer"]
    
    await db.commit()


async def _cancel_subscription(stripe_sub: dict, db: AsyncSession):
    user_id = stripe_sub.get("metadata", {}).get("user_id")
    if not user_id:
        return
    
    result = await db.execute(select(Subscription).where(Subscription.user_id == user_id))
    sub_record = result.scalar_one_or_none()
    if sub_record:
        sub_record.status = SubscriptionStatus.canceled
    
    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()
    if user:
        user.plan = PlanType.free
    
    await db.commit()


async def _update_subscription_status(
    stripe_sub_id: str, status: SubscriptionStatus, db: AsyncSession
):
    result = await db.execute(
        select(Subscription).where(Subscription.stripe_subscription_id == stripe_sub_id)
    )
    sub = result.scalar_one_or_none()
    if sub:
        sub.status = status
        await db.commit()
