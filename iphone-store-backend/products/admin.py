from django.contrib import admin
from django.utils.html import format_html

from .models import Category, Product


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("indented_name", "slug", "parent", "position", "is_active")
    list_display_links = ("indented_name",)
    list_filter = ("is_active", "parent")
    list_editable = ("position", "is_active")
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}
    autocomplete_fields = ("parent",)
    fieldsets = (
        (None, {"fields": ("name", "slug", "parent", "description")}),
        ("Отображение", {"fields": ("image", "position", "is_active")}),
    )

    def get_queryset(self, request):
        # select_related исключает N+1 в __str__/level при выводе списка.
        return super().get_queryset(request).select_related("parent")

    @admin.display(description="Категория", ordering="name")
    def indented_name(self, obj) -> str:
        return f"{'— ' * obj.level}{obj.name}"


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "article",
        "category",
        "price",
        "old_price",
        "stock",
        "condition",
        "is_active",
        "image_preview",
    )
    list_filter = ("category", "condition", "is_active", "storage")
    search_fields = ("name", "article", "description")
    ordering = ("-created_at",)
    readonly_fields = ("image_preview", "created_at", "updated_at")
    fieldsets = (
        (None, {"fields": ("name", "slug", "article", "category", "description")}),
        ("Цена и наличие", {"fields": ("price", "old_price", "stock", "condition")}),
        ("Характеристики", {"fields": ("color", "storage")}),
        ("Изображение", {"fields": ("image", "image_preview")}),
        ("Статус", {"fields": ("is_active", "created_at", "updated_at")}),
    )

    @admin.display(description="Изображение")
    def image_preview(self, obj):
        if not obj.image:
            return "—"
        return format_html(
            '<img src="{}" style="max-height:60px;border-radius:6px;" />',
            obj.image.url,
        )
