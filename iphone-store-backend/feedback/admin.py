from django.contrib import admin

from .models import FeedbackMessage, Subscriber


@admin.register(Subscriber)
class SubscriberAdmin(admin.ModelAdmin):
    list_display = ("email", "created_at")
    search_fields = ("email",)
    readonly_fields = ("created_at",)


@admin.register(FeedbackMessage)
class FeedbackMessageAdmin(admin.ModelAdmin):
    list_display = ("kind", "product_name", "name", "phone", "email", "created_at")
    list_filter = ("kind", "created_at")
    search_fields = ("name", "phone", "email", "message", "product_name")
    readonly_fields = ("created_at",)
    raw_id_fields = ("product",)