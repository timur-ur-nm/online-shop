from django.contrib import admin

from .models import Cart, CartItem


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    raw_id_fields = ("product",)


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "session_key", "total_quantity", "total_price")
    list_filter = ("created_at",)
    search_fields = ("session_key", "user__username", "user__email")
    inlines = (CartItemInline,)
