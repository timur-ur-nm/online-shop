from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from products.models import Product

from .models import FeedbackMessage, Subscriber


class SubscriberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscriber
        fields = ("email", "created_at")
        read_only_fields = ("created_at",)
        extra_kwargs = {
            "email": {
                "validators": [],
            }
        }


class FeedbackMessageSerializer(serializers.ModelSerializer):
    product = serializers.IntegerField(required=False, write_only=True)

    class Meta:
        model = FeedbackMessage
        fields = (
            "id",
            "kind",
            "name",
            "email",
            "phone",
            "message",
            "product",
            "product_name",
            "created_at",
        )
        read_only_fields = ("id", "created_at")

    def validate(self, attrs):
        if not any((attrs.get("name"), attrs.get("email"), attrs.get("phone"), attrs.get("message"))):
            raise ValidationError("Заполните хотя бы одно поле из: имя, email, телефон, сообщение.")
        product_id = attrs.pop("product", None)
        if product_id is None:
            return attrs
        product = Product.objects.filter(pk=product_id).first()
        if product:
            attrs["product"] = product
            if not attrs.get("product_name"):
                attrs["product_name"] = product.name
        return attrs