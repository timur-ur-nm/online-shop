from decimal import Decimal

from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from products.models import Category, Product

from .models import FeedbackMessage, Subscriber


class SubscriberApiTests(APITestCase):
    def test_guest_can_subscribe(self):
        self.client.force_authenticate(None)
        response = self.client.post(
            reverse("feedback-subscribe"),
            {"email": "user@example.com"},
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Subscriber.objects.count(), 1)
        self.assertEqual(Subscriber.objects.get().email, "user@example.com")

    def test_email_is_normalized_and_deduped(self):
        self.client.force_authenticate(None)
        first = self.client.post(
            reverse("feedback-subscribe"), {"email": "  User@Example.COM "}
        )
        self.assertEqual(first.status_code, status.HTTP_201_CREATED)

        second = self.client.post(
            reverse("feedback-subscribe"), {"email": "user@example.com"}
        )
        self.assertEqual(second.status_code, status.HTTP_200_OK)
        self.assertEqual(Subscriber.objects.count(), 1)

    def test_invalid_email_fails(self):
        self.client.force_authenticate(None)
        response = self.client.post(reverse("feedback-subscribe"), {"email": "not-an-email"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Subscriber.objects.count(), 0)


class FeedbackMessageApiTests(APITestCase):
    def setUp(self):
        self.category = Category.objects.create(name="iPhone")
        self.product = Product.objects.create(
            name="iPhone 15 128GB",
            category=self.category,
            article="IP15-128",
            price=Decimal("79990.00"),
            stock=5,
        )

    def test_guest_can_send_feedback(self):
        self.client.force_authenticate(None)
        response = self.client.post(
            reverse("feedback-messages"),
            {
                "kind": "feedback",
                "name": "Иван",
                "email": "ivan@example.com",
                "message": "Есть вопрос по доставке",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        message = FeedbackMessage.objects.get()
        self.assertEqual(message.kind, FeedbackMessage.Kind.FEEDBACK)
        self.assertEqual(message.name, "Иван")

    def test_want_cheaper_saves_product_name(self):
        self.client.force_authenticate(None)
        response = self.client.post(
            reverse("feedback-messages"),
            {"kind": "cheaper", "phone": "+7 900 000-00-00", "product": self.product.id},
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        message = FeedbackMessage.objects.get()
        self.assertEqual(message.product, self.product)
        self.assertEqual(message.product_name, "iPhone 15 128GB")

    def test_empty_message_fails(self):
        self.client.force_authenticate(None)
        response = self.client.post(reverse("feedback-messages"), {"kind": "feedback"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(FeedbackMessage.objects.count(), 0)

    def test_unknown_product_allowed_without_name(self):
        self.client.force_authenticate(None)
        response = self.client.post(
            reverse("feedback-messages"),
            {"kind": "cheaper", "phone": "+7 900 000-00-00", "product": 9999},
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(FeedbackMessage.objects.get().product, None)