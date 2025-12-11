from django.contrib import admin

from apps.billing.models import CheckoutSession, SubscriptionEvent


@admin.register(CheckoutSession)
class CheckoutSessionAdmin(admin.ModelAdmin):
    list_display = ("user", "plan", "session_id", "status", "amount_total", "created_at")
    search_fields = ("session_id", "user__username")


@admin.register(SubscriptionEvent)
class SubscriptionEventAdmin(admin.ModelAdmin):
    list_display = ("user", "event_type", "plan", "subscription_status", "amount_cents", "created_at")
    search_fields = ("event_type", "user__username")
