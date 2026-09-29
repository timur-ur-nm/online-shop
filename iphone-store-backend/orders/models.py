from decimal import Decimal

from django.core.validators import MinValueValidator
from django.db import models


class Order(models.Model):
    class Status(models.TextChoices):
        NEW = "new", "Новый"
        CONFIRMED = "confirmed", "Подтверждён"
        PAID = "paid", "Оплачен"
        SHIPPED = "shipped", "Отправлен"
        DELIVERED = "delivered", "Доставлен"
        CANCELLED = "cancelled", "Отменён"

    class PaymentMethod(models.TextChoices):
        CARD = "card", "Карта"
        CASH = "cash", "При получении"
        YANDEX = "yandex", "ЮMoney"
        SBP = "sbp", "СБП"

    user = models.ForeignKey(
        "auth.User",
        verbose_name="Пользователь",
        related_name="orders",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    number = models.CharField("Номер заказа", max_length=20, unique=True)
    status = models.CharField(
        "Статус",
        max_length=20,
        choices=Status.choices,
        default=Status.NEW,
    )
    payment_method = models.CharField(
        "Способ оплаты",
        max_length=10,
        choices=PaymentMethod.choices,
        default=PaymentMethod.CARD,
    )
    is_paid = models.BooleanField("Оплачен", default=False)
    full_name = models.CharField("ФИО получателя", max_length=150)
    phone = models.CharField("Телефон", max_length=20)
    email = models.EmailField("Email", blank=True)
    address = models.TextField("Адрес доставки")
    comment = models.TextField("Комментарий", blank=True)
    total_price = models.DecimalField(
        "Сумма",
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Заказ"
        verbose_name_plural = "Заказы"
        ordering = ("-created_at",)

    def __str__(self) -> str:
        return f"Заказ {self.number}"

    def save(self, *args, **kwargs) -> None:
        if not self.number:
            self.number = self._generate_number()
        super().save(*args, **kwargs)

    @staticmethod
    def _generate_number() -> str:
        import secrets
        from datetime import datetime

        stamp = datetime.now().strftime("%y%m%d")
        return f"IP-{stamp}-{secrets.token_hex(3).upper()}"


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        verbose_name="Заказ",
        related_name="items",
        on_delete=models.CASCADE,
    )
    product = models.ForeignKey(
        "products.Product",
        verbose_name="Товар",
        related_name="order_items",
        on_delete=models.SET_NULL,
        null=True,
    )
    name = models.CharField("Название на момент заказа", max_length=200)
    price = models.DecimalField(
        "Цена",
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.00"))],
    )
    quantity = models.PositiveIntegerField("Количество", default=1)

    class Meta:
        verbose_name = "Позиция заказа"
        verbose_name_plural = "Позиции заказа"

    def __str__(self) -> str:
        return f"{self.name} x{self.quantity}"

    @property
    def total_price(self) -> Decimal:
        return self.price * self.quantity
