from django.conf import settings
from django.db import models

from apps.users.models import PremiumPlan, SubscriptionStatus


class CheckoutSession(models.Model):
    class SessionStatus(models.TextChoices):
        CREATED = "created", "Created"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    plan = models.CharField(max_length=16, choices=PremiumPlan.choices)
    session_id = models.CharField(max_length=128, unique=True)
    status = models.CharField(
        max_length=16, choices=SessionStatus.choices, default=SessionStatus.CREATED
    )
    amount_total = models.PositiveBigIntegerField(default=0)  # cents
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"CheckoutSession {self.session_id} - {self.plan} ({self.status})"


class SubscriptionEvent(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    event_type = models.CharField(max_length=64)
    plan = models.CharField(max_length=16, choices=PremiumPlan.choices)
    subscription_status = models.CharField(
        max_length=16, choices=SubscriptionStatus.choices
    )
    amount_cents = models.PositiveBigIntegerField(default=0)
    stripe_reference = models.CharField(max_length=128, null=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.event_type} - {self.plan} ({self.created_at.strftime('%Y-%m-%d %H:%M')})"
