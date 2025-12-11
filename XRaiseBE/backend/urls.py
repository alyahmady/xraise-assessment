from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from backend.views import HealthCheckView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/health/", HealthCheckView.as_view(), name="health-check"),
    path("api/users/", include("apps.users.urls")),
    path("api/billing/", include("apps.billing.urls")),
]
