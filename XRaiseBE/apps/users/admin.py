from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from apps.users.models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    fieldsets = (
        *BaseUserAdmin.fieldsets,
        (
            "Subscription",
            {"fields": ("subscription_status", "current_plan", "total_amount_paid", "stripe_customer_id")},
        ),
    )

    list_display = (*BaseUserAdmin.list_display, "subscription_status", "current_plan", "total_amount_paid")
