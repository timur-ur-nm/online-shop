from django.db import transaction
from drf_spectacular.utils import extend_schema
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import CartItem
from .serializers import (
    CartItemAddSerializer,
    CartItemSerializer,
    CartItemUpdateSerializer,
    CartSerializer,
    get_or_create_cart,
)


@extend_schema(tags=["cart"])
class CartItemViewSet(viewsets.ModelViewSet):
    """
    Корзина текущего пользователя (либо гостя — по сессии).
    Гостевая корзина переносится в аккаунт при авторизации.
    """

    permission_classes = [AllowAny]
    queryset = CartItem.objects.select_related("product", "cart")
    serializer_class = CartItemSerializer

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return self.queryset.none()
        return (
            CartItem.objects.filter(cart=get_or_create_cart(self.request))
            .select_related("product", "cart")
            .order_by("created_at")
        )

    def list(self, request, *args, **kwargs):
        cart = get_or_create_cart(request)
        return Response(CartSerializer(cart).data)

    @extend_schema(
        tags=["cart"], summary="Добавить товар в корзину", request=CartItemAddSerializer
    )
    def create(self, request, *args, **kwargs):
        cart = get_or_create_cart(request)
        payload = CartItemAddSerializer(data=request.data, context={"cart": cart})
        payload.is_valid(raise_exception=True)
        product = payload.validated_data["product"]
        quantity = payload.validated_data["quantity"]

        with transaction.atomic():
            item, created = CartItem.objects.select_for_update().get_or_create(
                cart=cart,
                product=product,
                defaults={"quantity": quantity},
            )
            if not created:
                item.quantity += quantity
                item.save(update_fields=["quantity"])

        return Response(
            CartItemSerializer(item).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

    @extend_schema(tags=["cart"], summary="Изменить количество", request=CartItemUpdateSerializer)
    def update(self, request, *args, **kwargs):
        item = self.get_object()
        payload = CartItemUpdateSerializer(
            data=request.data, context={"item": item, "request": request}
        )
        payload.is_valid(raise_exception=True)
        quantity = payload.validated_data["quantity"]

        if quantity == 0:
            item.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

        item.quantity = quantity
        item.save(update_fields=["quantity"])
        return Response(CartItemSerializer(item).data)

    def partial_update(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def perform_destroy(self, instance) -> None:
        instance.delete()

    @extend_schema(tags=["cart"], summary="Очистить корзину")
    @action(detail=False, methods=["post", "delete"])
    def clear(self, request):
        self.get_queryset().delete()
        return Response(CartSerializer(get_or_create_cart(request)).data)

    @extend_schema(tags=["cart"], summary="Количество и сумма")
    @action(detail=False, methods=["get"])
    def summary(self, request):
        cart = get_or_create_cart(request)
        return Response(
            {
                "total_quantity": cart.total_quantity,
                "total_price": str(cart.total_price),
            }
        )
