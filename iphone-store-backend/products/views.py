from django.db.models import Case, Count, Q, Value, When
from django.db.models.functions import Coalesce
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import serializers, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import BasePermission
from rest_framework.response import Response

from .filters import ProductFilter
from .models import Brand, Category, Product
from .serializers import (
    BrandSerializer,
    CategorySerializer,
    CategoryTreeSerializer,
    ProductDetailSerializer,
    ProductListSerializer,
    ProductWriteSerializer,
)

ROOT_PARENT_VALUES = {"", "null", "none", "root", "top"}


class IsAdminOrReadOnly(BasePermission):
    """Читать могут все, создавать/менять/удалять — только сотрудники магазина."""

    def has_permission(self, request, view) -> bool:
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return True
        return bool(request.user and request.user.is_staff)


class ConditionSerializer(serializers.Serializer):
    value = serializers.CharField()
    label = serializers.CharField()


class FacetsResponseSerializer(serializers.Serializer):
    categories = CategorySerializer(many=True)
    colors = serializers.ListField(child=serializers.CharField())
    storages = serializers.ListField(child=serializers.IntegerField())
    conditions = ConditionSerializer(many=True)


@extend_schema(
    tags=["categories"],
    parameters=[
        OpenApiParameter(
            name="parent",
            type=str,
            location=OpenApiParameter.QUERY,
            description=(
                "Slug или pk родителя. Значения null/none/root/top — только "
                "категории верхнего уровня."
            ),
        )
    ],
)
class CategoryViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrReadOnly]
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    search_fields = ("name",)
    ordering_fields = (
        "position",
        "name",
        "products_count",
        "root_position",
        "root_name",
        "is_child",
    )
    # Порядок по умолчанию иерархический: сначала категории верхнего уровня,
    # затем их подкатегории. Он же делает выборку упорядоченной для пагинации,
    # которая иначе ругается на GROUP BY и может дублировать строки.
    ordering = ("root_position", "root_name", "is_child", "position", "name")

    def get_queryset(self):
        queryset = super().get_queryset()
        if not (self.request.user.is_authenticated and self.request.user.is_staff):
            queryset = queryset.filter(is_active=True)
        queryset = queryset.select_related("parent").with_descendant_counts()
        queryset = queryset.annotate(
            children_count=Count("children", distinct=True),
            root_position=Coalesce("parent__position", "position"),
            root_name=Coalesce("parent__name", "name"),
            is_child=Case(
                When(parent__isnull=True, then=Value(0)), default=Value(1)
            ),
        )
        return queryset.filter(**self._parent_filters())

    def _parent_filters(self) -> dict:
        raw = self.request.query_params.get("parent")
        if raw is None:
            return {}
        if raw.strip().lower() in ROOT_PARENT_VALUES:
            return {"parent__isnull": True}
        if raw.strip().isdigit():
            return {"parent_id": int(raw)}
        return {"parent__slug": raw}

    @extend_schema(
        tags=["categories"],
        summary="Дерево категорий для мега-меню",
        description=(
            "Возвращает верхний уровень категорий с вложенными подкатегориями "
            "(максимум 2 уровня). products_count учитывает товары и самой "
            "категории, и всех её подкатегорий. Ровно два SQL-запроса, "
            "независимо от количества категорий."
        ),
        responses={200: CategoryTreeSerializer(many=True)},
    )
    @action(detail=False, methods=["get"])
    def tree(self, request):
        queryset = self.get_queryset().order_by("position", "name")
        roots = list(queryset.filter(parent__isnull=True))
        root_ids = [root.pk for root in roots]

        grouped: dict[int, list[Category]] = {}
        if root_ids:
            for child in queryset.filter(parent_id__in=root_ids):
                grouped.setdefault(child.parent_id, []).append(child)

        nodes = [
            self._tree_node(root, grouped.get(root.pk, [])) for root in roots
        ]
        return Response(
            {"count": len(nodes), "results": CategoryTreeSerializer(nodes, many=True).data}
        )

    @staticmethod
    def _tree_node(category: Category, children: list[Category]) -> dict:
        return {
            "id": category.pk,
            "name": category.name,
            "slug": category.slug,
            "image": category.image.url if category.image else None,
            "position": category.position,
            "products_count": category.products_count,
            "is_active": category.is_active,
            "children": [
                CategoryViewSet._tree_node(child, []) for child in children
            ],
        }


@extend_schema(tags=["brands"])
class BrandViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrReadOnly]
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    search_fields = ("name",)
    ordering_fields = ("name",)


@extend_schema(tags=["products"])
class ProductViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrReadOnly]
    queryset = Product.objects.select_related("category", "brand")
    lookup_field = "slug"
    search_fields = ("name", "article", "description")
    ordering_fields = ("price", "rating", "created_at", "name")
    filterset_class = ProductFilter

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if not (user.is_authenticated and user.is_staff):
            queryset = queryset.filter(is_active=True)
        return queryset

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return ProductWriteSerializer
        if self.action == "retrieve":
            return ProductDetailSerializer
        return ProductListSerializer

    @extend_schema(
        tags=["products"],
        summary="Значения для фильтров каталога",
        description=(
            "categories содержит только категории верхнего уровня — по ним "
            "строится плитка фильтров. Для подкатегорий используйте "
            "GET /categories/?parent=<slug>."
        ),
        responses=FacetsResponseSerializer,
    )
    @action(detail=False, methods=["get"])
    def facets(self, request):
        queryset = Product.objects.filter(is_active=True)
        return Response(
            {
                "categories": CategorySerializer(
                    Category.objects.roots()
                    .filter(is_active=True)
                    .with_descendant_counts()
                    .annotate(children_count=Count("children", distinct=True)),
                    many=True,
                ).data,
                "colors": sorted(
                    set(queryset.exclude(color="").values_list("color", flat=True))
                ),
                "storages": sorted(
                    set(
                        queryset.exclude(storage=None).values_list("storage", flat=True)
                    )
                ),
                "conditions": [
                    {"value": value, "label": label}
                    for value, label in Product.Condition.choices
                ],
            }
        )
