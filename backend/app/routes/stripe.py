from fastapi import APIRouter, Depends, HTTPException, Request, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime, timezone
import stripe
import logging

from app.core.config import get_settings
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User, PlanType

logger = logging.getLogger(__name__)
settings = get_settings()

stripe.api_key = settings.stripe_secret_key

router = APIRouter(prefix="/api/stripe", tags=["Stripe"])

@router.post("/create-checkout-session")
async def create_checkout_session(
    request: Request,
    price_id: str = Body(..., embed=True),
    email: str = Body(None, embed=True),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        # Determine actual price ID from settings if necessary
        actual_price_id = price_id
        if price_id == "pro" and settings.stripe_price_pro:
            actual_price_id = settings.stripe_price_pro
        elif price_id == "premium" and settings.stripe_price_premium:
            actual_price_id = settings.stripe_price_premium

        # Use absolute URL based on frontend host, assume localhost:3000 for now or pass via env
        frontend_url = getattr(settings, "frontend_url", request.headers.get("origin", "http://localhost:3000"))
        
        # Get actual User record from DB
        user_id = current_user.get("user_id") or current_user.get("sub")
        result = await db.execute(select(User).where(User.id == user_id))
        user_db = result.scalar_one_or_none()
        
        if not user_db:
            # Auto-create user if they don't exist yet (from Clerk)
            user_db = User(
                id=user_id,
                email=current_user.get("email") or f"{user_id}@placeholder.auth",
                clerk_id=user_id,
                plan=PlanType.free,
                usage_count=0,
                is_active=True,
                is_admin=False,
            )
            db.add(user_db)
            await db.commit()
            await db.refresh(user_db)

        # Create or use existing customer ID
        customer_id = user_db.stripe_customer_id
        if not customer_id:
            customer_kwargs: dict = {"metadata": {"user_id": user_db.id}}
            actual_email = email or user_db.email
            if actual_email and not actual_email.endswith("@placeholder.auth"):
                customer_kwargs["email"] = actual_email
                
            customer = stripe.Customer.create(**customer_kwargs)
            customer_id = customer.id
            user_db.stripe_customer_id = customer_id
            await db.commit()
        else:
            # Ensure existing customers receive the most up-to-date email from the frontend payload
            actual_email = email or user_db.email
            if actual_email and not actual_email.endswith("@placeholder.auth"):
                try:
                    stripe.Customer.modify(customer_id, email=actual_email)
                except Exception as e:
                    logger.error(f"Could not update email for existing Customer: {e}")
            elif user_db.email and user_db.email.endswith("@placeholder.auth"):
                try:
                    stripe.Customer.modify(customer_id, email="")
                except Exception as e:
                    logger.error(f"Could not clear placeholder email for existing Customer: {e}")

        checkout_session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=['card'],
            line_items=[
                {
                    'price': actual_price_id,
                    'quantity': 1,
                },
            ],
            mode='subscription',
            success_url=f"{frontend_url}/dashboard/pricing?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{frontend_url}/pricing",
            metadata={"user_id": user_db.id} # Optional fallback
        )
        return {"checkout_url": checkout_session.url}
    except Exception as e:
        logger.error(f"Error creating checkout session: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/verify-session")
async def verify_session(
    session_id: str = Body(..., embed=True),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Manually verifies a checkout session via the frontend. 
    Crucial for local development when Stripe Webhooks cannot reach localhost.
    """
    try:
        session = stripe.checkout.Session.retrieve(session_id)
        if session.payment_status == "paid":
            # Convert stripe object to dict format expected by handle_checkout_completed
            await handle_checkout_completed(session, db)
            return {"status": "success", "message": "Subscription synced"}
        return {"status": "pending", "message": "Payment not completed"}
    except Exception as e:
        logger.error(f"Error verifying session: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/create-portal-session")
async def create_portal_session(
    request: Request,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        user_id = current_user.get("user_id") or current_user.get("sub")
        result = await db.execute(select(User).where(User.id == user_id))
        user_db = result.scalar_one_or_none()

        if not user_db:
            # Auto-create user if they don't exist yet (from Clerk)
            user_db = User(
                id=user_id,
                email=current_user.get("email") or f"{user_id}@placeholder.auth",
                clerk_id=user_id,
                plan=PlanType.free,
                usage_count=0,
                is_active=True,
                is_admin=False,
            )
            db.add(user_db)
            await db.commit()
            await db.refresh(user_db)

        # Create or use existing customer ID
        customer_id = user_db.stripe_customer_id
        if not customer_id:
            customer_kwargs: dict = {"metadata": {"user_id": user_db.id}}
            actual_email = user_db.email
            if actual_email and not actual_email.endswith("@placeholder.auth"):
                customer_kwargs["email"] = actual_email
                
            customer = stripe.Customer.create(**customer_kwargs)
            customer_id = customer.id
            user_db.stripe_customer_id = customer_id
            await db.commit()

        if not user_db.stripe_customer_id:
            raise HTTPException(status_code=400, detail="User is not a Stripe customer yet.")

        frontend_url = getattr(settings, "frontend_url", request.headers.get("origin", "http://localhost:3000"))

        portal_session = stripe.billing_portal.Session.create(
            customer=user_db.stripe_customer_id,
            return_url=f"{frontend_url}/dashboard/settings",
        )
        return {"portal_url": portal_session.url}
    except Exception as e:
        logger.error(f"Error creating portal session: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/webhook")
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.stripe_webhook_secret
        )
    except ValueError as e:
        # Invalid payload
        return {"error": "Invalid payload"}
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        return {"error": "Invalid signature"}

    # Handle the event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        await handle_checkout_completed(session, db)
    elif event['type'] == 'customer.subscription.updated':
        subscription = event['data']['object']
        await handle_subscription_updated(subscription, db)
    elif event['type'] == 'customer.subscription.deleted':
        subscription = event['data']['object']
        await handle_subscription_deleted(subscription, db)

    return {"status": "success"}

async def handle_checkout_completed(session: dict, db: AsyncSession):
    customer_id = session.get("customer")
    subscription_id = session.get("subscription")
    metadata = session.get("metadata", {})
    user_id = metadata.get("user_id")
    
    if not customer_id or not subscription_id:
        return

    # Try resolving via customer_id first, fallback to user_id from metadata
    if user_id:
        result = await db.execute(select(User).where(User.id == user_id))
    else:
        result = await db.execute(select(User).where(User.stripe_customer_id == customer_id))
    
    user = result.scalar_one_or_none()
    
    if user:
        if not user.stripe_customer_id:
            user.stripe_customer_id = customer_id
        # Fetch subscription to get current_period_end and price to map back to PlanType
        try:
            subscription = stripe.Subscription.retrieve(subscription_id)
            user.stripe_subscription_id = subscription_id
            user.stripe_current_period_end = datetime.fromtimestamp(subscription.current_period_end, tz=timezone.utc)
            
            # Use bracket notation for 'items' to avoid collision with python dict.items() method
            price_id = subscription['items'].data[0].price.id
            if price_id == settings.stripe_price_premium:
                user.plan = PlanType.premium
            elif price_id == settings.stripe_price_pro:
                user.plan = PlanType.pro
            
            await db.commit()
            logger.info(f"User {user.email} successfully subscribed to {user.plan}.")
        except Exception as e:
            logger.error(f"Error recording checkout session: {str(e)}")

async def handle_subscription_updated(subscription: dict, db: AsyncSession):
    customer_id = subscription.get("customer")
    subscription_id = subscription.get("id")
    metadata = subscription.get("metadata", {})
    user_id = metadata.get("user_id")
    
    if user_id:
        result = await db.execute(select(User).where(User.id == user_id))
    else:
        result = await db.execute(select(User).where(User.stripe_customer_id == customer_id))
        
    user = result.scalar_one_or_none()
    
    if user:
        user.stripe_subscription_id = subscription_id
        current_period_end = subscription.get("current_period_end")
        if current_period_end is not None:
            user.stripe_current_period_end = datetime.fromtimestamp(current_period_end, tz=timezone.utc)
        
        # Check if canceled?
        cancel_at_period_end = subscription.get("cancel_at_period_end")
        status = subscription.get("status")

        if status == "active" or status == "trialing":
            items = subscription.get("items", {})
            data = items.get("data", [])
            if data:
                price_id = data[0].get("price", {}).get("id")
                if price_id == settings.stripe_price_premium:
                    user.plan = PlanType.premium
                elif price_id == settings.stripe_price_pro:
                    user.plan = PlanType.pro
        elif status in ["canceled", "unpaid", "past_due"]:
            pass # We wait for actual deletion or handle gracefully

        await db.commit()

async def handle_subscription_deleted(subscription: dict, db: AsyncSession):
    customer_id = subscription.get("customer")
    
    result = await db.execute(select(User).where(User.stripe_customer_id == customer_id))
    user = result.scalar_one_or_none()
    
    if user:
        user.plan = PlanType.free
        user.stripe_subscription_id = None
        # KEEP the customer_id in case they re-subscribe
        await db.commit()
        logger.info(f"User {user.email} subscription canceled/ended. Reverted to Free plan.")
