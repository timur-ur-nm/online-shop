from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView


class StoreTokenObtainPairSerializer(TokenObtainPairSerializer):
    """После успешной авторизации переносит гостевую корзину в аккаунт."""

    def validate(self, attrs):
        data = super().validate(attrs)
        request = self.context.get("request")
        if request is not None:
            from cart.serializers import merge_carts

            request.user = self.user
            merge_carts(request)
        return data


class StoreTokenObtainPairView(TokenObtainPairView):
    serializer_class = StoreTokenObtainPairSerializer
