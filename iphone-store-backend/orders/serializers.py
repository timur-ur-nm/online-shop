from decimal import Decimal

from rest_framework import serializers

from products.models import Product

from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    total_price = serializers.DecimalField(
        max_digits=12, decimal_places=2, read_only=True
    )
    product_slug = serializers.CharField(
        source="product.slug", read_only=True, allow_null=True
    )

    class Meta:
        model = OrderItem
        fields = (
            "id",
            "product",
            "product_slug",
            "name",
            "price",
            "quantity",
            "total_price",
        )
        read_only_fields = ("id", "name", "price")


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    user = serializers.SlugRelatedField(
        slug_field="username", read_only=True, allow_null=True
    )

    class Meta:
        model = Order
        fields = (
            "id",
            "number",
            "user",
            "status",
            "status_display",
            "payment_method",
            "is_paid",
            "full_name",
            "phone",
            "email",
            "address",
            "comment",
            "total_price",
            "items",
            "created_at",
        )
        read_only_fields = ("id", "number", "status", "is_paid", "total_price")


class CheckoutSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=150)
    phone = serializers.CharField(max_length=20)
    email = serializers.EmailField(required=False, allow_blank=True)
    address = serializers.CharField()
    comment = serializers.CharField(required=False, allow_blank=True)
    payment_method = serializers.ChoiceField(
        choices=Order.PaymentMethod.choices, default=Order.PaymentMethod.CARD
    )

    def create(self, validated_data: dict) -> Order:
        from cart.models import Cart
        from cart.serializers import get_or_create_cart

        request = self.context["request"]
        cart = get_or_create_cart(request)
        items = list(cart.items.select_related("product"))

        if not items:
            raise serializers.ValidationError("Корзина пуста.")

        total = Decimal("0.00")
        for item in items:
            if item.product.stock < item.quantity:
                raise serializers.ValidationError(
                    {"items": f"Недостаточно товара: {item.product.name}"}
                )
            total += item.product.price * item.quantity

        order = Order.objects.create(
            user=request.user if request.user.is_authenticated else None,
            total_price=total,
            **validated_data,
        )
        OrderItem.objects.bulk_create(
            [
                OrderItem(
                    order=order,
                    product=item.product,
                    name=item.product.name,
                    price=item.product.price,
                    quantity=item.quantity,
                )
                for item in items
            ]
        )

        for item in items:
            Product.objects.filter(pk=item.product_id).update(
                stock=item.product.stock - item.quantity
            )
        cart.items.all().delete()
        return order


class QuickOrderSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, default=1)
    phone = serializers.CharField(max_length=20)
    full_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    comment = serializers.CharField(required=False, allow_blank=True)

    def create(self, validated_data: dict) -> Order:
        request = self.context["request"]
        product = Product.objects.filter(pk=validated_data["product_id"]).first()
        if not product:
            raise serializers.ValidationError({"product_id": "Товар не найден."})

        quantity = validated_data["quantity"]
        if product.stock < quantity:
            raise serializers.ValidationError(
                {"quantity": f"Недостаточно товара: {product.name}"}
            )

        order = Order.objects.create(
            user=request.user if request.user.is_authenticated else None,
            full_name=validated_data.get("full_name") or "Быстрый заказ",
            phone=validated_data["phone"],
            address="-",
            comment=validated_data.get("comment", "") or "",
            payment_method=Order.PaymentMethod.CASH,
            total_price=product.price * quantity,
        )
        OrderItem.objects.create(
            order=order,
            product=product,
            name=product.name,
            price=product.price,
            quantity=quantity,
        )
        Product.objects.filter(pk=product.pk).update(stock=product.stock - quantity)
        return order
