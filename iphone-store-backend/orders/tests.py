from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from products.models import Category, Product

from .models import Order, OrderItem

CHECKOUT = {
    "full_name": "Иван Петров",
    "phone": "+7 900 000-00-00",
    "email": "ivan@example.com",
    "address": "Москва, ул. Ленина, 1",
    "payment_method": "card",
}


class OrderModelTests(TestCase):
    def test_number_is_generated(self):
        category = Category.objects.create(name="iPhone")
        order = Order.objects.create(
            full_name="A", phone="1", address="x", total_price=Decimal("10.00")
        )
        self.assertTrue(order.number.startswith("IP-"))
        self.assertEqual(Order.objects.filter(number=order.number).count(), 1)

    def test_total_price_of_items(self):
        order = Order.objects.create(full_name="A", phone="1", address="x")
        item = OrderItem(order=order, name="iPhone", price=Decimal("10.00"), quantity=3)
        self.assertEqual(item.total_price, Decimal("30.00"))


class CheckoutApiTests(APITestCase):
    def setUp(self):
        self.category = Category.objects.create(name="iPhone")
        self.product = Product.objects.create(
            name="iPhone 15 128GB",
            category=self.category,
            article="IP15-128",
            price=Decimal("79990.00"),
            stock=5,
        )
        self.user = get_user_model().objects.create_user("buyer", password="buyer-pass-123")
        self.client.force_authenticate(self.user)
        self.client.post(
            reverse("cart-list"), {"product": self.product.id, "quantity": 2}
        )

    def test_requires_authentication(self):
        self.client.force_authenticate(None)
        response = self.client.post(reverse("order-list"), CHECKOUT)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_checkout_creates_order_and_clears_cart(self):
        response = self.client.post(reverse("order-list"), CHECKOUT)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        order = Order.objects.get()
        self.assertEqual(order.total_price, Decimal("159980.00"))
        self.assertEqual(order.user, self.user)
        self.assertEqual(order.items.count(), 1)
        self.assertEqual(order.status, Order.Status.NEW)
        self.assertEqual(response.data["user"], "buyer")
        self.assertIn("items", response.data)

        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 3)
        self.assertEqual(self.client.get(reverse("cart-list")).data["items"], [])

    def test_checkout_with_empty_cart_fails(self):
        self.client.post(reverse("cart-clear"))
        response = self.client.post(reverse("order-list"), CHECKOUT)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_missing_fields(self):
        response = self.client.post(reverse("order-list"), {"phone": "123"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("full_name", response.data)
        self.assertIn("address", response.data)

    def test_invalid_payment_method(self):
        response = self.client.post(
            reverse("order-list"), {**CHECKOUT, "payment_method": "crypto"}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_order_when_not_enough_stock(self):
        self.product.stock = 1
        self.product.save()
        response = self.client.post(reverse("order-list"), CHECKOUT)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Order.objects.count(), 0)

    def test_order_list_only_for_owner(self):
        self.client.post(reverse("order-list"), CHECKOUT)
        other = get_user_model().objects.create_user("hacker", password="hacker-pass-123")
        self.client.force_authenticate(other)
        self.assertEqual(self.client.get(reverse("order-list")).data["count"], 0)

    def test_staff_sees_all_orders(self):
        self.client.post(reverse("order-list"), CHECKOUT)
        staff = get_user_model().objects.create_user(
            "admin", password="admin-pass-123", is_staff=True
        )
        self.client.force_authenticate(staff)
        self.assertEqual(self.client.get(reverse("order-list")).data["count"], 1)

    def test_cancel_restores_stock(self):
        number = self.client.post(reverse("order-list"), CHECKOUT).data["number"]
        response = self.client.post(reverse("order-cancel", args=[number]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.product.refresh_from_db()
        order = Order.objects.get()
        self.assertEqual(order.status, Order.Status.CANCELLED)
        self.assertEqual(self.product.stock, 5)

    def test_cancel_twice_is_idempotent(self):
        number = self.client.post(reverse("order-list"), CHECKOUT).data["number"]
        self.client.post(reverse("order-cancel", args=[number]))
        self.client.post(reverse("order-cancel", args=[number]))
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 5)

    def test_retrieve_by_number(self):
        number = self.client.post(reverse("order-list"), CHECKOUT).data["number"]
        response = self.client.get(reverse("order-detail", args=[number]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["number"], number)
        self.assertEqual(len(response.data["items"]), 1)

    def test_cannot_cancel_other_users_order(self):
        number = self.client.post(reverse("order-list"), CHECKOUT).data["number"]
        other = get_user_model().objects.create_user("hacker", password="hacker-pass-123")
        self.client.force_authenticate(other)
        response = self.client.post(reverse("order-cancel", args=[number]))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_order_item_snapshot_keeps_name_and_price(self):
        self.client.post(reverse("order-list"), CHECKOUT)
        item = OrderItem.objects.get()
        self.product.delete()
        self.assertEqual(item.name, "iPhone 15 128GB")
        self.assertEqual(item.price, Decimal("79990.00"))


class QuickOrderApiTests(APITestCase):
    def setUp(self):
        self.category = Category.objects.create(name="iPhone")
        self.product = Product.objects.create(
            name="iPhone SE 2022",
            category=self.category,
            article="IPSE-2022",
            price=Decimal("44990.00"),
            stock=5,
        )

    def test_guest_can_place_quick_order(self):
        self.client.force_authenticate(None)
        response = self.client.post(
            reverse("order-quick"),
            {"product_id": self.product.id, "quantity": 2, "phone": "+7 900 000-00-00"},
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        order = Order.objects.get()
        self.assertEqual(order.user, None)
        self.assertEqual(order.total_price, Decimal("89980.00"))
        self.assertEqual(order.payment_method, Order.PaymentMethod.CASH)
        self.assertEqual(order.items.count(), 1)
        self.assertEqual(order.items.get().quantity, 2)
        self.assertEqual(order.address, "-")
        self.assertEqual(order.full_name, "Быстрый заказ")
        self.assertIn("number", response.data)

        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 3)

    def test_authenticated_user_is_linked(self):
        user = get_user_model().objects.create_user("oneclick", password="one-click-123")
        self.client.force_authenticate(user)
        response = self.client.post(
            reverse("order-quick"),
            {
                "product_id": self.product.id,
                "quantity": 1,
                "phone": "+7 900 000-00-00",
                "full_name": "Иван Петров",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Order.objects.get().user, user)
        self.assertEqual(Order.objects.get().full_name, "Иван Петров")

    def test_unknown_product_fails(self):
        self.client.force_authenticate(None)
        response = self.client.post(
            reverse("order-quick"), {"product_id": 9999, "phone": "1"}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Order.objects.count(), 0)

    def test_not_enough_stock_fails(self):
        self.client.force_authenticate(None)
        response = self.client.post(
            reverse("order-quick"),
            {"product_id": self.product.id, "quantity": 99, "phone": "1"},
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Order.objects.count(), 0)
