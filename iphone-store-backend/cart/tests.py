from decimal import Decimal

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from products.models import Category, Product

from .models import Cart, CartItem


class CartApiTests(APITestCase):
    def setUp(self):
        self.category = Category.objects.create(name="iPhone")
        self.product = Product.objects.create(
            name="iPhone 15 128GB",
            category=self.category,
            article="IP15-128",
            price=Decimal("79990.00"),
            stock=3,
        )

    def add(self, quantity=1, product=None):
        return self.client.post(
            reverse("cart-list"),
            {"product": product.id if product else self.product.id, "quantity": quantity},
        )

    def test_empty_cart_for_guest(self):
        response = self.client.get(reverse("cart-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["items"], [])
        self.assertEqual(response.data["total_price"], "0.00")

    def test_add_item(self):
        response = self.add(quantity=2)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["quantity"], 2)
        self.assertEqual(response.data["total_price"], "159980.00")

    def test_add_item_accumulates_quantity(self):
        self.add(quantity=1)
        response = self.add(quantity=2)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["quantity"], 3)
        self.assertEqual(CartItem.objects.count(), 1)

    def test_quantity_is_capped_by_stock(self):
        response = self.add(quantity=10)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_json_and_form_payloads_are_equal(self):
        self.client.post(
            reverse("cart-list"), {"product": self.product.id, "quantity": 2}
        )
        response = self.client.post(
            reverse("cart-list"),
            {"product": self.product.id, "quantity": 1},
            format="json",
        )
        self.assertEqual(response.data["quantity"], 3)

    def test_out_of_stock_product_rejected(self):
        self.product.stock = 0
        self.product.save()
        response = self.add()
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unknown_product_rejected(self):
        response = self.client.post(
            reverse("cart-list"), {"product": 999999, "quantity": 1}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_totals(self):
        self.add(quantity=2)
        response = self.client.get(reverse("cart-list"))
        self.assertEqual(response.data["total_quantity"], 2)
        self.assertEqual(response.data["total_price"], "159980.00")

    def test_summary_endpoint(self):
        self.add(quantity=1)
        response = self.client.get(reverse("cart-summary"))
        self.assertEqual(response.data, {"total_quantity": 1, "total_price": "79990.00"})

    def test_update_quantity(self):
        self.add(quantity=1)
        item = CartItem.objects.get()
        response = self.client.patch(
            reverse("cart-detail", args=[item.id]), {"quantity": 2}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        item.refresh_from_db()
        self.assertEqual(item.quantity, 2)

    def test_update_to_zero_removes_item(self):
        self.add(quantity=1)
        item = CartItem.objects.get()
        response = self.client.patch(
            reverse("cart-detail", args=[item.id]), {"quantity": 0}
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(CartItem.objects.count(), 0)

    def test_update_above_stock_rejected(self):
        self.add(quantity=1)
        item = CartItem.objects.get()
        response = self.client.patch(
            reverse("cart-detail", args=[item.id]), {"quantity": 99}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete_item(self):
        self.add(quantity=1)
        item = CartItem.objects.get()
        response = self.client.delete(reverse("cart-detail", args=[item.id]))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(CartItem.objects.count(), 0)

    def test_cannot_touch_other_cart(self):
        other = get_user_model().objects.create_user("other", password="other-pass-123")
        self.client.force_authenticate(other)
        self.add(quantity=1)
        item = CartItem.objects.get()
        self.client.force_authenticate(None)
        response = self.client.delete(reverse("cart-detail", args=[item.id]))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_clear(self):
        self.add(quantity=1)
        response = self.client.post(reverse("cart-clear"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["items"], [])

    def test_guest_cart_is_bound_to_session(self):
        self.add(quantity=1)
        other_client = self.client_class()
        other_client.get(reverse("cart-list"))
        self.assertEqual(Cart.objects.count(), 2)

    def test_authenticated_user_cart_is_persistent(self):
        user = get_user_model().objects.create_user("buyer", password="buyer-pass-123")
        self.client.force_authenticate(user)
        self.add(quantity=1)
        self.assertEqual(Cart.objects.get(user=user).total_quantity, 1)
        self.client.force_authenticate(None)
        self.assertEqual(Cart.objects.get(user=user).total_quantity, 1)
