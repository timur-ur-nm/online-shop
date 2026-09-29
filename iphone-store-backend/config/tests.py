from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient, APITestCase

from cart.models import Cart
from products.models import Category, Product


VALID_REGISTRATION = {
    "username": "ivan",
    "email": "ivan@example.com",
    "password": "Slozhnyy-Parol-2026",
    "password_confirm": "Slozhnyy-Parol-2026",
}


class RegisterApiTests(TestCase):
    def setUp(self):
        self.category = Category.objects.create(name="iPhone")
        self.product = Product.objects.create(
            name="iPhone 15 128GB",
            category=self.category,
            article="IP15-128",
            price="79990.00",
            stock=10,
        )

    def register(self, **overrides):
        payload = {**VALID_REGISTRATION, **overrides}
        return self.client.post(reverse("register"), payload, content_type="application/json")

    def test_register_creates_user_and_returns_tokens(self):
        response = self.register()
        self.assertEqual(response.status_code, 201)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertEqual(response.data["user"]["username"], "ivan")
        self.assertEqual(response.data["user"]["email"], "ivan@example.com")
        self.assertNotIn("password", response.data["user"])

        user = get_user_model().objects.get(username="ivan")
        self.assertTrue(user.check_password(VALID_REGISTRATION["password"]))
        self.assertFalse(user.is_staff)

    def test_returned_token_works(self):
        access = self.register().data["access"]
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        self.assertEqual(client.get(reverse("me")).status_code, 200)
        self.assertEqual(client.get(reverse("me")).data["username"], "ivan")

    def test_duplicate_username(self):
        get_user_model().objects.create_user("ivan", password="x")
        response = self.register()
        self.assertEqual(response.status_code, 400)
        self.assertIn("username", response.data)
        self.assertEqual(get_user_model().objects.filter(username="ivan").count(), 1)

    def test_duplicate_username_different_case(self):
        get_user_model().objects.create_user("Ivan", password="x")
        response = self.register()
        self.assertEqual(response.status_code, 400)
        self.assertIn("username", response.data)

    def test_duplicate_email(self):
        get_user_model().objects.create_user("other", password="x", email="ivan@example.com")
        response = self.register()
        self.assertEqual(response.status_code, 400)
        self.assertIn("email", response.data)

    def test_passwords_must_match(self):
        response = self.register(password_confirm="other-pass-2026")
        self.assertEqual(response.status_code, 400)
        self.assertIn("password_confirm", response.data)

    def test_weak_password_rejected(self):
        response = self.register(password="12345", password_confirm="12345")
        self.assertEqual(response.status_code, 400)
        self.assertIn("password", response.data)
        self.assertFalse(get_user_model().objects.filter(username="ivan").exists())

    def test_missing_fields(self):
        response = self.client.post(reverse("register"), {}, content_type="application/json")
        self.assertEqual(response.status_code, 400)
        for field in ("username", "email", "password", "password_confirm"):
            self.assertIn(field, response.data)

    def test_invalid_email(self):
        response = self.register(email="not-an-email")
        self.assertEqual(response.status_code, 400)
        self.assertIn("email", response.data)

    def test_registration_merges_guest_cart(self):
        client = APIClient()
        client.post(
            reverse("cart-list"),
            {"product": self.product.id, "quantity": 2},
            content_type="application/json",
        )
        self.assertEqual(Cart.objects.count(), 1)

        response = client.post(
            reverse("register"), VALID_REGISTRATION, content_type="application/json"
        )
        self.assertEqual(response.status_code, 201)

        cart = Cart.objects.get(user__username="ivan")
        self.assertEqual(cart.total_quantity, 2)
        self.assertEqual(Cart.objects.count(), 1)

    def test_register_is_public(self):
        self.assertEqual(self.client.get(reverse("register")).status_code, 405)


class MeApiTests(APITestCase):
    def setUp(self):
        get_user_model().objects.create_user("buyer", password="buyer-pass-123")
        self.access = self.client.post(
            reverse("token_obtain_pair"),
            {"username": "buyer", "password": "buyer-pass-123"},
            content_type="application/json",
        ).data["access"]

    def test_requires_token(self):
        self.assertEqual(self.client.get(reverse("me")).status_code, 401)

    def test_returns_profile(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access}")
        response = self.client.get(reverse("me"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            set(response.data), {"id", "username", "email", "first_name", "last_name", "is_staff"}
        )

    def test_invalid_token(self):
        self.client.credentials(HTTP_AUTHORIZATION="Bearer garbage")
        self.assertEqual(self.client.get(reverse("me")).status_code, 401)


class ProfileUpdateApiTests(APITestCase):
    def setUp(self):
        get_user_model().objects.create_user(
            "buyer", password="buyer-pass-123", email="buyer@example.com"
        )
        self.access = self.client.post(
            reverse("token_obtain_pair"),
            {"username": "buyer", "password": "buyer-pass-123"},
            content_type="application/json",
        ).data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access}")

    def auth_headers(self):
        return {"HTTP_AUTHORIZATION": f"Bearer {self.access}"}

    def test_patch_updates_fields(self):
        response = self.client.patch(
            reverse("me"),
            {"first_name": "Иван", "last_name": "Петров", "email": "new@example.com"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        user = get_user_model().objects.get(username="buyer")
        self.assertEqual(user.first_name, "Иван")
        self.assertEqual(user.last_name, "Петров")
        self.assertEqual(user.email, "new@example.com")
        self.assertEqual(response.data["first_name"], "Иван")

    def test_empty_email_allowed(self):
        response = self.client.patch(
            reverse("me"), {"email": ""}, content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(get_user_model().objects.get(username="buyer").email, "")

    def test_duplicate_email_rejected(self):
        get_user_model().objects.create_user("other", password="x", email="taken@example.com")
        response = self.client.patch(
            reverse("me"),
            {"email": "taken@example.com"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("email", response.data)

    def test_duplicate_username_rejected(self):
        get_user_model().objects.create_user("ivan", password="x")
        response = self.client.patch(
            reverse("me"), {"username": "ivan"}, content_type="application/json"
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("username", response.data)

    def test_own_username_is_allowed(self):
        response = self.client.patch(
            reverse("me"), {"username": "buyer"}, content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)

    def test_cannot_change_password_via_me(self):
        response = self.client.patch(
            reverse("me"), {"password": "hacked"}, content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(get_user_model().objects.get(username="buyer").check_password("buyer-pass-123"))

    def test_requires_token(self):
        self.client.credentials()
        response = self.client.patch(
            reverse("me"), {"first_name": "X"}, content_type="application/json"
        )
        self.assertEqual(response.status_code, 401)


class ChangePasswordApiTests(APITestCase):
    def setUp(self):
        get_user_model().objects.create_user("buyer", password="buyer-pass-123")
        self.access = self.client.post(
            reverse("token_obtain_pair"),
            {"username": "buyer", "password": "buyer-pass-123"},
            content_type="application/json",
        ).data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access}")

    def test_changes_password(self):
        response = self.client.post(
            reverse("change_password"),
            {
                "old_password": "buyer-pass-123",
                "new_password": "Novyy-Parol-2026",
                "new_password_confirm": "Novyy-Parol-2026",
            },
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 204)
        self.assertTrue(
            get_user_model()
            .objects.get(username="buyer")
            .check_password("Novyy-Parol-2026")
        )

    def test_old_password_required(self):
        response = self.client.post(
            reverse("change_password"),
            {
                "old_password": "wrong",
                "new_password": "Novyy-Parol-2026",
                "new_password_confirm": "Novyy-Parol-2026",
            },
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("old_password", response.data)

    def test_passwords_must_match(self):
        response = self.client.post(
            reverse("change_password"),
            {
                "old_password": "buyer-pass-123",
                "new_password": "Novyy-Parol-2026",
                "new_password_confirm": "Drugoy-Parol-2026",
            },
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("new_password_confirm", response.data)

    def test_weak_password_rejected(self):
        response = self.client.post(
            reverse("change_password"),
            {
                "old_password": "buyer-pass-123",
                "new_password": "12345",
                "new_password_confirm": "12345",
            },
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("new_password", response.data)
        self.assertTrue(
            get_user_model().objects.get(username="buyer").check_password("buyer-pass-123")
        )

    def test_requires_token(self):
        self.client.credentials()
        response = self.client.post(
            reverse("change_password"),
            {
                "old_password": "buyer-pass-123",
                "new_password": "Novyy-Parol-2026",
                "new_password_confirm": "Novyy-Parol-2026",
            },
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 401)


class AuthApiTests(TestCase):
    def setUp(self):
        self.category = Category.objects.create(name="iPhone")
        self.product = Product.objects.create(
            name="iPhone 15 128GB",
            category=self.category,
            article="IP15-128",
            price="79990.00",
            stock=10,
        )
        get_user_model().objects.create_user("buyer", password="buyer-pass-123")

    def test_token_obtain(self):
        response = self.client.post(
            reverse("token_obtain_pair"),
            {"username": "buyer", "password": "buyer-pass-123"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_token_obtain_with_wrong_password(self):
        response = self.client.post(
            reverse("token_obtain_pair"),
            {"username": "buyer", "password": "nope"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 401)

    def test_token_refresh(self):
        token = self.client.post(
            reverse("token_obtain_pair"),
            {"username": "buyer", "password": "buyer-pass-123"},
            content_type="application/json",
        ).data["refresh"]
        response = self.client.post(
            reverse("token_refresh"), {"refresh": token}, content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)

    def test_login_merges_guest_cart_into_user_cart(self):
        client = APIClient()
        client.post(reverse("cart-list"), {"product": self.product.id, "quantity": 2})
        self.assertEqual(Cart.objects.count(), 1)
        self.assertIsNone(Cart.objects.get().user)

        client.post(
            reverse("token_obtain_pair"),
            {"username": "buyer", "password": "buyer-pass-123"},
            content_type="application/json",
        )

        cart = Cart.objects.get(user__username="buyer")
        self.assertEqual(cart.total_quantity, 2)
        self.assertEqual(Cart.objects.count(), 1)

    def test_access_token_grants_orders_api(self):
        access = self.client.post(
            reverse("token_obtain_pair"),
            {"username": "buyer", "password": "buyer-pass-123"},
            content_type="application/json",
        ).data["access"]
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        self.assertEqual(client.get(reverse("order-list")).status_code, 200)
        self.assertEqual(client.get(reverse("cart-list")).status_code, 200)


class ServiceApiTests(TestCase):
    def test_health(self):
        response = self.client.get(reverse("health"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "ok")
        self.assertEqual(response.data["database"], "ok")
