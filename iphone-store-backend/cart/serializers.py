from rest_framework import serializers

from products.models import Product

from .models import Cart, CartItem


class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_slug = serializers.CharField(source="product.slug", read_only=True)
    product_image = serializers.ImageField(source="product.image", read_only=True)
    product_price = serializers.DecimalField(
        source="product.price", max_digits=12, decimal_places=2, read_only=True
    )
    product_stock = serializers.IntegerField(source="product.stock", read_only=True)
    total_price = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = (
            "id",
            "product",
            "product_name",
            "product_slug",
            "product_image",
            "product_price",
            "product_stock",
            "quantity",
            "total_price",
        )
        read_only_fields = ("id", "quantity")


class CartItemAddSerializer(serializers.Serializer):
    product = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(is_active=True),
        help_text="ID товара",
    )
    quantity = serializers.IntegerField(min_value=1, default=1)

    def validate(self, attrs):
        product: Product = attrs["product"]
        if product.stock < 1:
            raise serializers.ValidationError(
                {"product": "Товара нет в наличии."}
            )
        cart: Cart | None = self.context.get("cart")
        current = 0
        if cart:
            current = (
                cart.items.filter(product=product)
                .values_list("quantity", flat=True)
                .first()
                or 0
            )
        if current + attrs["quantity"] > product.stock:
            raise serializers.ValidationError(
                {"quantity": f"Доступно только {product.stock} шт."}
            )
        return attrs


class CartItemUpdateSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=0)

    def validate_quantity(self, value: int) -> int:
        item: CartItem = self.context["item"]
        if value > item.product.stock:
            raise serializers.ValidationError(
                f"Доступно только {item.product.stock} шт."
            )
        return value


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_quantity = serializers.IntegerField(read_only=True)
    total_price = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = Cart
        fields = ("id", "items", "total_quantity", "total_price", "updated_at")


def get_or_create_cart(request) -> Cart:
    if request.user.is_authenticated:
        cart, _ = Cart.objects.get_or_create(user=request.user)
    else:
        session_key = request.session.session_key
        if not session_key:
            request.session.create()
            session_key = request.session.session_key
        cart, _ = Cart.objects.get_or_create(session_key=session_key)
    return cart


def merge_carts(request) -> Cart:
    """Переносит гостевую корзину в аккаунт при авторизации."""
    session_key = request.session.session_key
    if not session_key:
        return get_or_create_cart(request)

    guest_cart = Cart.objects.filter(session_key=session_key).first()
    if not guest_cart:
        return get_or_create_cart(request)

    user_cart, _ = Cart.objects.get_or_create(user=request.user)
    for item in guest_cart.items.select_related("product"):
        target = user_cart.items.filter(product=item.product).first()
        if target is None:
            item.cart = user_cart
            item.save(update_fields=["cart"])
        else:
            target.quantity = min(
                target.quantity + item.quantity, max(item.product.stock, 0)
            )
            target.save(update_fields=["quantity"])

    guest_cart.delete()
    request.session.flush()
    return user_cart
