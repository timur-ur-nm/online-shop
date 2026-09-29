from django.db import models


class Cart(models.Model):
    user = models.OneToOneField(
        "auth.User",
        verbose_name="Пользователь",
        related_name="cart",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    session_key = models.CharField(max_length=40, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Корзина"
        verbose_name_plural = "Корзины"

    def __str__(self) -> str:
        return f"Корзина #{self.pk}"

    @property
    def total_quantity(self) -> int:
        return sum(item.quantity for item in self.items.all())

    @property
    def total_price(self):
        from decimal import Decimal

        total = Decimal("0.00")
        for item in self.items.select_related("product"):
            total += item.total_price
        return total


class CartItem(models.Model):
    cart = models.ForeignKey(
        Cart,
        verbose_name="Корзина",
        related_name="items",
        on_delete=models.CASCADE,
    )
    product = models.ForeignKey(
        "products.Product",
        verbose_name="Товар",
        related_name="cart_items",
        on_delete=models.CASCADE,
    )
    quantity = models.PositiveIntegerField("Количество", default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Позиция корзины"
        verbose_name_plural = "Позиции корзины"
        constraints = [
            models.UniqueConstraint(
                fields=("cart", "product"),
                name="unique_product_per_cart",
            )
        ]

    def __str__(self) -> str:
        return f"{self.product} x{self.quantity}"

    @property
    def total_price(self):
        return self.product.price * self.quantity
