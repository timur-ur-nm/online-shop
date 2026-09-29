from django.db import transaction
from drf_spectacular.utils import extend_schema
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Order
from .serializers import CheckoutSerializer, OrderSerializer, QuickOrderSerializer


@extend_schema(tags=["orders"])
class OrderViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]
    queryset = Order.objects.prefetch_related("items").all()
    lookup_field = "number"
    serializer_class = OrderSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        if getattr(self, "swagger_fake_view", False):
            return queryset
        user = self.request.user
        if user.is_staff:
            return queryset
        return queryset.filter(user=user)

    @extend_schema(
        tags=["orders"],
        summary="Оформить заказ из корзины",
        request=CheckoutSerializer,
        responses={201: OrderSerializer},
    )
    def create(self, request, *args, **kwargs):
        checkout = CheckoutSerializer(data=request.data, context={"request": request})
        checkout.is_valid(raise_exception=True)
        with transaction.atomic():
            order = checkout.save()
        return Response(
            OrderSerializer(order, context=self.get_serializer_context()).data,
            status=status.HTTP_201_CREATED,
        )

    @extend_schema(
        tags=["orders"],
        summary="Быстрый заказ в один клик",
        request=QuickOrderSerializer,
        responses={201: OrderSerializer},
    )
    @action(detail=False, methods=["post"], permission_classes=[AllowAny])
    def quick(self, request, *args, **kwargs):
        serializer = QuickOrderSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            order = serializer.save()
        return Response(
            OrderSerializer(order, context=self.get_serializer_context()).data,
            status=status.HTTP_201_CREATED,
        )

    @extend_schema(tags=["orders"], summary="Отменить заказ")
    @action(detail=True, methods=["post"])
    def cancel(self, request, number=None):
        order = self.get_object()
        if order.status in (Order.Status.SHIPPED, Order.Status.DELIVERED):
            raise PermissionDenied("Отменённый заказ уже отправлен.")
        if order.status == Order.Status.CANCELLED:
            return Response(OrderSerializer(order).data)

        with transaction.atomic():
            for item in order.items.select_related("product"):
                if item.product:
                    item.product.stock += item.quantity
                    item.product.save(update_fields=["stock"])
            order.status = Order.Status.CANCELLED
            order.save(update_fields=["status", "updated_at"])
        return Response(OrderSerializer(order).data)
