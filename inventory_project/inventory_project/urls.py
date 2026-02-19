from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/v1/auth/token/", TokenObtainPairView.as_view(), name="token-obtain-pair"),
    path("api/v1/auth/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("api/v1/", include("apps.users.urls")),
    path("api/v1/", include("apps.core.urls")),
    path("api/v1/", include("apps.products.urls")),
    path("api/v1/", include("apps.sales.urls")),
    path("api/v1/", include("apps.reports.urls")),
    path("api/v1/", include("apps.customers.urls")),
    path("api/v1/", include("apps.purchases.urls")),
    path("api/v1/", include("apps.finance.urls")),
    path("api/v1/", include("apps.employees.urls")),
    path("api/v1/", include("apps.inventory.urls")),
]
