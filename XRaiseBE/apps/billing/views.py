import stripe
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.billing.models import CheckoutSession, SubscriptionEvent
from apps.billing.serializers import BillingStatusSerializer, DowngradeSerializer, UpgradeSerializer
from apps.users.models import PremiumPlan, SubscriptionStatus, User
from backend.enums import Currency, PlanPrice

stripe.api_key = settings.STRIPE_SECRET_KEY


def plan_to_price(plan: str) -> int:
    if plan == PremiumPlan.BASIC:
        return PlanPrice.BASIC
    if plan == PremiumPlan.PRO:
        return PlanPrice.PRO
    raise ValueError("Unsupported plan for price lookup")


class BillingStatusView(APIView):
    def get(self, request):
        serializer = BillingStatusSerializer(request.user)
        return Response(serializer.data)


class UpgradeView(APIView):
    def post(self, request):
        serializer = UpgradeSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        plan = serializer.validated_data["plan"]

        success_url = f"{settings.FRONTEND_URL}/dashboard?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{settings.FRONTEND_URL}/dashboard"

        session = stripe.checkout.Session.create(
            mode="payment",
            line_items=[
                {
                    "price_data": {
                        "currency": Currency.US_DOLLAR.lower(),
                        "product_data": {"name": f"{plan.title()} Plan Upgrade"},
                        "unit_amount": plan_to_price(plan),
                    },
                    "quantity": 1,
                }
            ],
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={"user_id": request.user.id, "plan": plan},
        )

        CheckoutSession.objects.create(user=request.user, plan=plan, session_id=session.id)
        return Response({"checkout_url": session.url})


class DowngradeView(APIView):
    def post(self, request):
        serializer = DowngradeSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        plan = serializer.validated_data["plan"]

        if plan == PremiumPlan.NONE:
            request.user.subscription_status = SubscriptionStatus.INACTIVE
            request.user.current_plan = PremiumPlan.NONE
            request.user.save(update_fields=["subscription_status", "current_plan"])
            SubscriptionEvent.objects.create(
                user=request.user,
                event_type="manual_downgrade",
                plan=plan,
                subscription_status=SubscriptionStatus.INACTIVE,
                amount_cents=0,
            )
            return Response({"detail": "Downgraded to no plan"})

        success_url = f"{settings.FRONTEND_URL}/dashboard?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{settings.FRONTEND_URL}/dashboard"

        session = stripe.checkout.Session.create(
            mode="payment",
            line_items=[
                {
                    "price_data": {
                        "currency": Currency.US_DOLLAR.lower(),
                        "product_data": {"name": f"{plan.title()} Plan"},
                        "unit_amount": plan_to_price(plan),
                    },
                    "quantity": 1,
                }
            ],
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={"user_id": request.user.id, "plan": plan},
        )

        CheckoutSession.objects.create(user=request.user, plan=plan, session_id=session.id)
        return Response({"checkout_url": session.url})


@csrf_exempt
@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get("HTTP_STRIPE_SIGNATURE", "")
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, settings.STRIPE_WEBHOOK_SECRET)
    except (ValueError, stripe.error.SignatureVerificationError):
        return Response(status=status.HTTP_400_BAD_REQUEST)

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        user_id = session["metadata"].get("user_id")
        plan = session["metadata"].get("plan")
        amount_total = session.get("amount_total", 0)

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        user.current_plan = plan
        user.subscription_status = SubscriptionStatus.ACTIVE
        user.total_amount_paid = (user.total_amount_paid or 0) + int(amount_total or 0)
        user.save(update_fields=["current_plan", "subscription_status", "total_amount_paid"])

        CheckoutSession.objects.filter(session_id=session["id"]).update(
            status=CheckoutSession.SessionStatus.COMPLETED, amount_total=amount_total
        )
        SubscriptionEvent.objects.create(
            user=user,
            event_type="checkout.session.completed",
            plan=plan,
            subscription_status=SubscriptionStatus.ACTIVE,
            amount_cents=amount_total or 0,
            stripe_reference=session["id"],
        )

    return Response(status=status.HTTP_200_OK)
