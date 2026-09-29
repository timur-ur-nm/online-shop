from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import (
    ChangePasswordSerializer,
    ProfileUpdateSerializer,
    RegisterResponseSerializer,
    RegisterSerializer,
    UserSerializer,
)


@extend_schema(tags=["auth"])
class RegisterView(APIView):
    """
    Регистрация нового пользователя.

    Сразу возвращает JWT-токены, чтобы клиенту не пришлось делать
    второй запрос за логином. Гостевая корзина переносится в новый аккаунт.
    """

    permission_classes = [permissions.AllowAny]
    authentication_classes = []
    serializer_class = RegisterSerializer

    @extend_schema(
        tags=["auth"],
        summary="Регистрация",
        request=RegisterSerializer,
        responses={201: RegisterResponseSerializer},
    )
    def post(self, request):
        serializer = self.serializer_class(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        result = serializer.save()
        return Response(
            RegisterResponseSerializer(result).data, status=status.HTTP_201_CREATED
        )


@extend_schema_view(
    get=extend_schema(tags=["auth"], summary="Текущий пользователь"),
    patch=extend_schema(
        tags=["auth"],
        summary="Обновить профиль",
        request=ProfileUpdateSerializer,
        responses={200: UserSerializer},
    ),
    put=extend_schema(
        tags=["auth"],
        summary="Обновить профиль (полностью)",
        request=ProfileUpdateSerializer,
        responses={200: UserSerializer},
    ),
)
class MeView(APIView):
    """Профиль пользователя, соответствующий выданному токену."""

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def _get_object(self):
        return self.request.user

    @extend_schema(tags=["auth"], responses=UserSerializer)
    def get(self, request):
        return Response(UserSerializer(request.user).data)

    @extend_schema(tags=["auth"], responses=UserSerializer)
    def patch(self, request):
        return self._update(request, partial=True)

    @extend_schema(tags=["auth"], responses=UserSerializer)
    def put(self, request):
        return self._update(request, partial=False)

    def _update(self, request, partial):
        serializer = ProfileUpdateSerializer(
            instance=self._get_object(),
            data=request.data,
            partial=partial,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user).data)


@extend_schema(
    tags=["auth"],
    summary="Сменить пароль",
    request=ChangePasswordSerializer,
    responses={204: None},
)
class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ChangePasswordSerializer

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
