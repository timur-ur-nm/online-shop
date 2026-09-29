from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from django.views.generic import RedirectView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from cart.views import CartItemViewSet
from config.health import HealthView
from config.jwt import StoreTokenObtainPairView
from config.views import ChangePasswordView, MeView, RegisterView
from feedback.views import FeedbackMessageCreateView, SubscriberCreateView
from orders.views import OrderViewSet
from products.views import BrandViewSet, CategoryViewSet, ProductViewSet

router = DefaultRouter()
router.register("categories", CategoryViewSet, basename="category")
router.register("brands", BrandViewSet, basename="brand")
router.register("products", ProductViewSet, basename="product")
router.register("cart", CartItemViewSet, basename="cart")
router.register("orders", OrderViewSet, basename="order")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("health/", HealthView.as_view(), name="health"),
    path("", include(router.urls)),
    path(
        "auth/register/",
        RegisterView.as_view(),
        name="register",
    ),
    path(
        "auth/token/",
        StoreTokenObtainPairView.as_view(),
        name="token_obtain_pair",
    ),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/me/", MeView.as_view(), name="me"),
    path(
        "auth/change-password/",
        ChangePasswordView.as_view(),
        name="change_password",
    ),
    path(
        "feedback/subscribe/",
        SubscriberCreateView.as_view(),
        name="feedback-subscribe",
    ),
    path(
        "feedback/messages/",
        FeedbackMessageCreateView.as_view(),
        name="feedback-messages",
    ),
    path("schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path("redoc/", SpectacularSwaggerView.as_view(url_name="schema"), name="redoc"),
    path("favicon.ico", RedirectView.as_view(url="/static/favicon.ico")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
