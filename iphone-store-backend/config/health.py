from django.db import connection
from drf_spectacular.utils import extend_schema
from rest_framework import serializers
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


class HealthSerializer(serializers.Serializer):
    status = serializers.CharField()
    database = serializers.CharField()


@extend_schema(tags=["service"])
class HealthView(APIView):
    """Проверка живости сервиса и соединения с БД."""

    permission_classes = [AllowAny]
    authentication_classes = []
    serializer_class = HealthSerializer

    @extend_schema(tags=["service"], summary="Проверка живости сервиса")
    def get(self, request):
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()
            database = "ok"
        except Exception:  # noqa: BLE001 - health-check must never raise
            database = "error"

        return Response({"status": "ok", "database": database})
