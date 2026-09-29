from rest_framework import serializers

from .models import Brand, Category, Product


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ("id", "name", "slug")


class CategorySerializer(serializers.ModelSerializer):
    products_count = serializers.IntegerField(read_only=True)
    children_count = serializers.SerializerMethodField()
    parent_slug = serializers.CharField(source="parent.slug", read_only=True, allow_null=True)
    level = serializers.IntegerField(read_only=True)
    is_root = serializers.BooleanField(read_only=True)
    breadcrumbs = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = (
            "id",
            "name",
            "slug",
            "parent",
            "parent_slug",
            "level",
            "is_root",
            "breadcrumbs",
            "description",
            "image",
            "position",
            "products_count",
            "children_count",
            "is_active",
        )
        read_only_fields = ("slug", "position", "level", "is_root")

    def get_children_count(self, obj) -> int:
        return getattr(obj, "children_count", 0)

    def get_breadcrumbs(self, obj) -> list:
        return obj.breadcrumbs()


class CategoryTreeNodeSerializer(serializers.Serializer):
    """
    Узел дерева категорий — подкатегория. Дерево намеренно ограничено двумя
    уровнями (категория → подкатегория), поэтому children у узла всегда пуст.
    """

    id = serializers.IntegerField()
    name = serializers.CharField()
    slug = serializers.CharField()
    image = serializers.CharField(allow_null=True)
    position = serializers.IntegerField()
    products_count = serializers.IntegerField()
    is_active = serializers.BooleanField()
    children = serializers.ListField(child=serializers.DictField())


class CategoryTreeSerializer(CategoryTreeNodeSerializer):
    """Корень дерева: раскрывает список подкатегорий."""

    children = CategoryTreeNodeSerializer(many=True)


class ProductListSerializer(serializers.ModelSerializer):
    category = serializers.StringRelatedField()
    category_slug = serializers.CharField(source="category.slug", read_only=True)
    in_stock = serializers.BooleanField(read_only=True)
    has_discount = serializers.BooleanField(read_only=True)
    discount_percent = serializers.IntegerField(read_only=True)

    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            "slug",
            "article",
            "category",
            "category_slug",
            "price",
            "old_price",
            "discount_percent",
            "has_discount",
            "condition",
            "color",
            "storage",
            "rating",
            "rating_count",
            "image",
            "stock",
            "in_stock",
        )


class ProductDetailSerializer(ProductListSerializer):
    class Meta(ProductListSerializer.Meta):
        fields = ProductListSerializer.Meta.fields + (
            "description",
            "brand",
            "is_active",
            "created_at",
            "updated_at",
        )


class ProductWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = "__all__"
        read_only_fields = ("slug", "created_at", "updated_at")

    def validate(self, attrs):
        instance = self.instance
        old_price = attrs.get("old_price", getattr(instance, "old_price", None))
        price = attrs.get("price", getattr(instance, "price", None))
        if old_price is not None and price is not None and old_price <= price:
            raise serializers.ValidationError(
                {"old_price": "Старая цена должна быть больше текущей."}
            )
        return attrs
