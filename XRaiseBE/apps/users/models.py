from django.contrib.auth.models import AbstractUser
from django.db import models


class SubscriptionStatus(models.TextChoices):
    ACTIVE = "active", "Active"
    INACTIVE = "inactive", "Inactive"


class PremiumPlan(models.TextChoices):
    NONE = "none", "No Plan"
    BASIC = "basic", "Basic"
    PRO = "pro", "Pro"


class User(AbstractUser):
    subscription_status = models.CharField(
        max_length=16,
        choices=SubscriptionStatus.choices,
        default=SubscriptionStatus.INACTIVE,
    )
    current_plan = models.CharField(
        max_length=16,
        choices=PremiumPlan.choices,
        default=PremiumPlan.NONE,
    )
    total_amount_paid = models.PositiveBigIntegerField(default=0)  # stored in cents
    stripe_customer_id = models.CharField(max_length=128, blank=True, null=True)

    def mark_inactive(self):
        self.subscription_status = SubscriptionStatus.INACTIVE
        self.current_plan = PremiumPlan.NONE
        self.save(update_fields=["subscription_status", "current_plan"])

