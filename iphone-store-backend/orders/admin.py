from django.contrib import admin

from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("name", "price", "quantity", "total_price")
    raw_id_fields = ("product",)

    @admin.display(description="Сумма")
    def total_price(self, obj):
        return obj.total_price


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "number",
        "user",
        "full_name",
        "phone",
        "status",
        "total_price",
        "is_paid",
        "created_at",
    )
    list_filter = ("status", "payment_method", "is_paid", "created_at")
    search_fields = ("number", "full_name", "phone", "email", "user__username")
    readonly_fields = ("number", "total_price", "created_at", "updated_at")
    inlines = (OrderItemInline,)
    actions = ("mark_paid", "mark_shipped")

    @admin.action(description="Отметить как оплаченные")
    def mark_paid(self, request, queryset):
        queryset.update(is_paid=True, status="paid")

    @admin.action(description="Отметить как отправленные")
    def mark_shipped(self, request, queryset):
        queryset.update(status="shipped")
