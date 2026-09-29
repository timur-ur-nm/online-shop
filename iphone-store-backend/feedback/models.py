from django.db import models


class Subscriber(models.Model):
    email = models.EmailField("Email", unique=True)
    created_at = models.DateTimeField("Дата подписки", auto_now_add=True)

    class Meta:
        verbose_name = "Подписчик"
        verbose_name_plural = "Подписчики"
        ordering = ("-created_at",)

    def __str__(self) -> str:
        return self.email


class FeedbackMessage(models.Model):
    class Kind(models.TextChoices):
        FEEDBACK = "feedback", "Обратная связь"
        CHEAPER = "cheaper", "Хочу дешевле"

    kind = models.CharField(
        "Тип",
        max_length=20,
        choices=Kind.choices,
        default=Kind.FEEDBACK,
    )
    name = models.CharField("Имя", max_length=150, blank=True)
    email = models.EmailField("Email", blank=True)
    phone = models.CharField("Телефон", max_length=20, blank=True)
    message = models.TextField("Сообщение", blank=True)
    product = models.ForeignKey(
        "products.Product",
        verbose_name="Товар",
        related_name="feedback_messages",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    product_name = models.CharField("Название товара", max_length=200, blank=True)
    created_at = models.DateTimeField("Дата", auto_now_add=True)

    class Meta:
        verbose_name = "Сообщение"
        verbose_name_plural = "Сообщения"
        ordering = ("-created_at",)

    def __str__(self) -> str:
        label = self.name or self.phone or self.email
        return f"{self.get_kind_display()}: {label or 'Аноним'}"