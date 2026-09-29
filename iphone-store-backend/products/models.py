from decimal import Decimal

from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.db.models import Q
from django.utils.text import slugify


def expand_category_ids(pk_list) -> list[int]:
    """
    Возвращает переданные pk категорий вместе со всеми их потомками.

    Обход в ширину по уровням: на каждую глубину делается ровно один запрос,
    поэтому N+1 не возникает.
    """
    result = {int(pk) for pk in pk_list}
    frontier = list(result)
    while frontier:
        children = set(
            Category.objects.filter(parent_id__in=frontier).values_list(
                "pk", flat=True
            )
        )
        children -= result
        if not children:
            break
        result |= children
        frontier = children
    return sorted(result)


class CategoryQuerySet(models.QuerySet):
    def roots(self) -> "CategoryQuerySet":
        """Только категории верхнего уровня (без родителя)."""
        return self.filter(parent__isnull=True)

    def with_descendant_counts(self, prefix: str = "") -> "CategoryQuerySet":
        """
        Добавляет аннотацию products_count, считающую товары самой категории
        и всех её подкатегорий (для дерева глубиной 2 уровня).
        """
        return self.annotate(
            **{
                f"{prefix}products_count": models.Count(
                    "products",
                    filter=Q(products__is_active=True),
                    distinct=True,
                )
                + models.Count(
                    "children__products",
                    filter=Q(children__products__is_active=True),
                    distinct=True,
                )
            }
        )


class Category(models.Model):
    name = models.CharField("Название", max_length=120, unique=True)
    slug = models.SlugField(max_length=140, unique=True, blank=True)
    parent = models.ForeignKey(
        "self",
        verbose_name="Родительская категория",
        related_name="children",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        help_text="Пусто — категория верхнего уровня.",
    )
    description = models.TextField("Описание", blank=True)
    image = models.ImageField("Иконка/обложка", upload_to="categories/", blank=True)
    is_active = models.BooleanField("Активна", default=True)
    position = models.PositiveSmallIntegerField("Порядок", default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = CategoryQuerySet.as_manager()

    class Meta:
        verbose_name = "Категория"
        verbose_name_plural = "Категории"
        ordering = ("position", "name")

    def __str__(self) -> str:
        return "— " * self.level + self.name

    def save(self, *args, **kwargs) -> None:
        if not self.slug:
            self.slug = slugify(self.name, allow_unicode=True)
        super().save(*args, **kwargs)

    def clean(self) -> None:
        super().clean()
        if self.parent_id is None:
            return
        if self.pk and self.parent_id == self.pk:
            raise ValidationError({"parent": "Категория не может быть своим родителем."})
        if self.pk and self.pk in {ancestor.pk for ancestor in self.ancestors()}:
            raise ValidationError(
                {"parent": "Нельзя сделать подкатегорию родителем её же потомка."}
            )

    @property
    def is_root(self) -> bool:
        return self.parent_id is None

    @property
    def level(self) -> int:
        """0 — верхний уровень, 1 — подкатегория."""
        return len(self.ancestors())

    def ancestors(self) -> list["Category"]:
        """Список предков от ближайшего к корню."""
        result: list[Category] = []
        seen: set[int] = set()
        current = self.parent
        while current is not None and current.pk not in seen:
            seen.add(current.pk)
            result.append(current)
            current = current.parent
        return result

    def breadcrumbs(self) -> list[dict]:
        """Хлебные крошки от корня к текущей категории."""
        chain = [*reversed(self.ancestors()), self]
        return [{"id": item.pk, "name": item.name, "slug": item.slug} for item in chain]

    def include_descendants(self) -> models.QuerySet:
        """Эта категория и все её потомки."""
        return Category.objects.filter(pk__in=expand_category_ids([self.pk]))


class Brand(models.Model):
    name = models.CharField("Название", max_length=80, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)

    class Meta:
        verbose_name = "Бренд"
        verbose_name_plural = "Бренды"
        ordering = ("name",)

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs) -> None:
        if not self.slug:
            self.slug = slugify(self.name, allow_unicode=True)
        super().save(*args, **kwargs)


class Product(models.Model):
    class Condition(models.TextChoices):
        NEW = "new", "Новый"
        SEALED = "sealed", "Запечатанный"
        USED = "used", "Б/у"

    name = models.CharField("Название", max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    category = models.ForeignKey(
        Category,
        verbose_name="Категория",
        related_name="products",
        on_delete=models.PROTECT,
    )
    brand = models.ForeignKey(
        Brand,
        verbose_name="Бренд",
        related_name="products",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    article = models.CharField("Артикул", max_length=50, unique=True)
    description = models.TextField("Описание", blank=True)
    price = models.DecimalField(
        "Цена",
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.00"))],
    )
    old_price = models.DecimalField(
        "Старая цена",
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )
    condition = models.CharField(
        "Состояние",
        max_length=10,
        choices=Condition.choices,
        default=Condition.NEW,
    )
    color = models.CharField("Цвет", max_length=50, blank=True)
    storage = models.PositiveSmallIntegerField("Память, ГБ", null=True, blank=True)
    rating = models.DecimalField(
        "Рейтинг",
        max_digits=2,
        decimal_places=1,
        default=Decimal("5.0"),
        validators=[MinValueValidator(Decimal("0")), MaxValueValidator(Decimal("5"))],
    )
    rating_count = models.PositiveIntegerField("Число отзывов", default=0)
    image = models.ImageField("Изображение", upload_to="products/%Y/%m/", blank=True)
    stock = models.PositiveIntegerField("Остаток на складе", default=0)
    is_active = models.BooleanField("Активен", default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Товар"
        verbose_name_plural = "Товары"
        ordering = ("-created_at",)
        indexes = [
            models.Index(fields=("category", "is_active")),
            models.Index(fields=("price",)),
            models.Index(fields=("storage",)),
        ]

    def __str__(self) -> str:
        return f"{self.name} ({self.article})"

    def save(self, *args, **kwargs) -> None:
        if not self.slug:
            self.slug = slugify(self.name, allow_unicode=True)
        super().save(*args, **kwargs)

    @property
    def in_stock(self) -> bool:
        return self.is_active and self.stock > 0

    @property
    def has_discount(self) -> bool:
        return bool(self.old_price and self.old_price > self.price)

    @property
    def discount_percent(self) -> int:
        if not self.has_discount:
            return 0
        return int((self.old_price - self.price) / self.old_price * 100)
