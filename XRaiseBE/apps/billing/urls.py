from django.urls import path

from apps.billing.views import BillingStatusView, DowngradeView, UpgradeView, stripe_webhook

urlpatterns = [
    path("status/", BillingStatusView.as_view(), name="billing_status"),
    path("upgrade/", UpgradeView.as_view(), name="upgrade"),
    path("downgrade/", DowngradeView.as_view(), name="downgrade"),
    path("webhook/stripe/", stripe_webhook, name="stripe_webhook"),
]
