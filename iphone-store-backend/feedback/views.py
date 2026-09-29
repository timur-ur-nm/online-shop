from drf_spectacular.utils import extend_schema
from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import FeedbackMessage, Subscriber
from .serializers import FeedbackMessageSerializer, SubscriberSerializer


@extend_schema(
    tags=["feedback"],
    summary="Подписка на рассылку",
    request=SubscriberSerializer,
    responses={
        201: SubscriberSerializer,
        200: SubscriberSerializer,
    },
)
class SubscriberCreateView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    queryset = Subscriber.objects.all()
    serializer_class = SubscriberSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].strip().lower()
        subscriber, created = Subscriber.objects.get_or_create(email=email)
        data = SubscriberSerializer(subscriber).data
        return Response(data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


@extend_schema(
    tags=["feedback"],
    summary="Отправить сообщение (обратная связь, «хочу дешевле»)",
    request=FeedbackMessageSerializer,
    responses={201: FeedbackMessageSerializer},
)
class FeedbackMessageCreateView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    queryset = FeedbackMessage.objects.all()
    serializer_class = FeedbackMessageSerializer