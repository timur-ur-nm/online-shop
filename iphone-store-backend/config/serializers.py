from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name", "is_staff")
        read_only_fields = fields


class ProfileUpdateSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ("username", "email", "first_name", "last_name")

    def validate_username(self, value: str) -> str:
        value = value.strip()
        existing = (
            User.objects.filter(username__iexact=value)
            .exclude(pk=self.instance.pk if self.instance else None)
            .first()
        )
        if existing is not None:
            raise serializers.ValidationError(
                "Пользователь с таким логином уже существует."
            )
        return value

    def validate_email(self, value: str) -> str:
        value = value.strip().lower()
        if not value:
            return value
        existing = (
            User.objects.filter(email__iexact=value)
            .exclude(pk=self.instance.pk if self.instance else None)
            .first()
        )
        if existing is not None:
            raise serializers.ValidationError(
                "Пользователь с таким email уже существует."
            )
        return value

    def validate_first_name(self, value: str) -> str:
        return value.strip()

    def validate_last_name(self, value: str) -> str:
        return value.strip()


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    new_password_confirm = serializers.CharField(write_only=True)

    def validate_old_password(self, value: str) -> str:
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Неверный текущий пароль.")
        return value

    def validate(self, attrs: dict) -> dict:
        if attrs["new_password"] != attrs["new_password_confirm"]:
            raise serializers.ValidationError(
                {"new_password_confirm": "Пароли не совпадают."}
            )
        try:
            user = self.context["request"].user
            validate_password(attrs["new_password"], user=user)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"new_password": list(exc.messages)}) from exc
        return attrs

    def save(self) -> None:
        user = self.context["request"].user
        user.set_password(self.validated_data["new_password"])
        user.save(update_fields=["password"])


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150, help_text="Логин")
    email = serializers.EmailField(help_text="Email")
    password = serializers.CharField(
        write_only=True, style={"input_type": "password"}, help_text="Пароль"
    )
    password_confirm = serializers.CharField(
        write_only=True, style={"input_type": "password"}, help_text="Повтор пароля"
    )

    def validate_username(self, value: str) -> str:
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError(
                "Пользователь с таким логином уже существует."
            )
        return value

    def validate_email(self, value: str) -> str:
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "Пользователь с таким email уже существует."
            )
        return value

    def validate(self, attrs: dict) -> dict:
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError(
                {"password_confirm": "Пароли не совпадают."}
            )
        try:
            validate_password(attrs["password"])
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"password": list(exc.messages)}) from exc
        return attrs

    def create(self, validated_data: dict) -> dict:
        validated_data.pop("password_confirm")
        user = User.objects.create_user(**validated_data)

        request = self.context.get("request")
        if request is not None:
            from cart.serializers import merge_carts

            request.user = user
            merge_carts(request)

        refresh = RefreshToken.for_user(user)
        return {
            "user": user,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }


class RegisterResponseSerializer(serializers.Serializer):
    user = UserSerializer()
    access = serializers.CharField()
    refresh = serializers.CharField()
