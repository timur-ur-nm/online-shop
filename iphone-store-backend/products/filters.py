import django_filters as filters
from django.db.models import F, Q

from .models import Category, Product, expand_category_ids


class ProductFilter(filters.FilterSet):
    """
    Фильтры каталога.

    category   — slug или pk категории (несколько значений через запятую).
                 В выборку попадают товары и самой категории, и всех её
                 подкатегорий, поэтому ?category=iphone возвращает всю
                 линейку iPhone, а ?category=iphone-16 — только её.
    price_min / price_max — диапазон цены
    storage    — память в ГБ (несколько значений: 128,256)
    color      — цвет (без учёта регистра)
    in_stock   — только товары в наличии
    on_sale    — только товары со скидкой
    """

    category = filters.CharFilter(method="filter_category")
    price_min = filters.NumberFilter(field_name="price", lookup_expr="gte")
    price_max = filters.NumberFilter(field_name="price", lookup_expr="lte")
    storage = filters.NumberFilter(field_name="storage", lookup_expr="in")
    color = filters.CharFilter(field_name="color", lookup_expr="iexact")
    in_stock = filters.BooleanFilter(method="filter_in_stock")
    on_sale = filters.BooleanFilter(method="filter_on_sale")
    rating_min = filters.NumberFilter(field_name="rating", lookup_expr="gte")

    class Meta:
        model = Product
        fields = ("condition", "brand")

    def filter_category(self, queryset, name, value):
        keys = [chunk.strip() for chunk in str(value).split(",") if chunk.strip()]
        if not keys:
            return queryset
        direct_ids = list(
            Category.objects.filter(
                Q(slug__in=keys) | Q(pk__in=[key for key in keys if key.isdigit()])
            ).values_list("pk", flat=True)
        )
        if not direct_ids:
            return queryset.none()
        return queryset.filter(category_id__in=expand_category_ids(direct_ids))

    def filter_in_stock(self, queryset, name, value):
        if value is None:
            return queryset
        return queryset.filter(stock__gt=0) if value else queryset.filter(stock=0)

    def filter_on_sale(self, queryset, name, value):
        if value is None:
            return queryset
        discounted = Q(old_price__isnull=False) & Q(old_price__gt=F("price"))
        return queryset.filter(discounted) if value else queryset.exclude(discounted)
