import warnings
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.core.paginator import UnorderedObjectListWarning
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Category, Product, expand_category_ids


def make_product(**kwargs) -> Product:
    defaults = {
        "name": "iPhone 17 Pro",
        "article": "IP17P-0001",
        "price": Decimal("119990.00"),
        "stock": 5,
    }
    defaults.update(kwargs)
    defaults.setdefault("category", Category.objects.get_or_create(name="iPhone")[0])
    return Product.objects.create(**defaults)


class CategoryHierarchyTests(APITestCase):
    def setUp(self):
        self.iphone = Category.objects.create(name="iPhone", position=1)
        self.iphone_16 = Category.objects.create(
            name="iPhone 16", parent=self.iphone, position=1
        )
        self.iphone_16_pro = Category.objects.create(
            name="iPhone 16 Pro", parent=self.iphone_16, position=1
        )
        self.ipad = Category.objects.create(name="iPad", position=2)

    def test_slug_generated_for_subcategory(self):
        self.assertEqual(self.iphone_16.slug, "iphone-16")
        self.assertEqual(self.iphone.slug, "iphone")

    def test_is_root_and_level(self):
        self.assertTrue(self.iphone.is_root)
        self.assertEqual(self.iphone.level, 0)
        self.assertFalse(self.iphone_16.is_root)
        self.assertEqual(self.iphone_16.level, 1)
        self.assertEqual(self.iphone_16_pro.level, 2)

    def test_str_indents_children(self):
        self.assertEqual(str(self.iphone), "iPhone")
        self.assertEqual(str(self.iphone_16), "— iPhone 16")
        self.assertEqual(str(self.iphone_16_pro), "— — iPhone 16 Pro")

    def test_ancestors_ordered_from_nearest_to_root(self):
        self.assertEqual(
            [item.pk for item in self.iphone_16_pro.ancestors()],
            [self.iphone_16.pk, self.iphone.pk],
        )
        self.assertEqual(self.iphone.ancestors(), [])

    def test_breadcrumbs_from_root(self):
        self.assertEqual(
            self.iphone_16.breadcrumbs(),
            [
                {"id": self.iphone.pk, "name": "iPhone", "slug": "iphone"},
                {
                    "id": self.iphone_16.pk,
                    "name": "iPhone 16",
                    "slug": "iphone-16",
                },
            ],
        )

    def test_expand_category_ids_includes_all_descendants(self):
        self.assertEqual(
            expand_category_ids([self.iphone.pk]),
            sorted(
                [self.iphone.pk, self.iphone_16.pk, self.iphone_16_pro.pk]
            ),
        )
        self.assertEqual(expand_category_ids([self.ipad.pk]), [self.ipad.pk])

    def test_include_descendants(self):
        self.assertEqual(
            set(self.iphone.include_descendants().values_list("pk", flat=True)),
            {self.iphone.pk, self.iphone_16.pk, self.iphone_16_pro.pk},
        )

    def test_roots_manager(self):
        self.assertEqual(
            set(Category.objects.roots().values_list("pk", flat=True)),
            {self.iphone.pk, self.ipad.pk},
        )

    def test_category_cannot_be_its_own_parent(self):
        self.iphone.parent = self.iphone
        with self.assertRaises(ValidationError):
            self.iphone.full_clean()

    def test_cycle_is_rejected(self):
        # Делаем корень потомком собственной ветки и ждём ошибку.
        self.iphone.parent = self.iphone_16_pro
        with self.assertRaises(ValidationError):
            self.iphone.full_clean()

    def test_protected_from_deleting_parent_with_children(self):
        with self.assertRaises(Exception):
            self.iphone.delete()


class CategoryTreeApiTests(APITestCase):
    def setUp(self):
        self.iphone = Category.objects.create(name="iPhone", position=1)
        self.iphone_16 = Category.objects.create(
            name="iPhone 16", parent=self.iphone, position=1
        )
        self.iphone_15 = Category.objects.create(
            name="iPhone 15", parent=self.iphone, position=2
        )
        self.accessories = Category.objects.create(
            name="Аксессуары", slug="accessories", position=2
        )
        make_product(category=self.iphone_16, article="IP16-128", name="iPhone 16 128GB")
        make_product(category=self.iphone_15, article="IP15-128", name="iPhone 15 128GB")
        make_product(
            category=self.accessories, article="CASE-001", name="Чехол силиконовый"
        )

    def test_tree_returns_nested_categories(self):
        response = self.client.get(reverse("category-tree"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 2)
        roots = response.data["results"]
        self.assertEqual([item["slug"] for item in roots], ["iphone", "accessories"])
        self.assertEqual(
            [item["slug"] for item in roots[0]["children"]],
            ["iphone-16", "iphone-15"],
        )

    def test_tree_parents_without_children(self):
        response = self.client.get(reverse("category-tree"))
        accessories = response.data["results"][1]
        self.assertEqual(accessories["children"], [])

    def test_tree_count_includes_descendant_products(self):
        response = self.client.get(reverse("category-tree"))
        iphone = response.data["results"][0]
        self.assertEqual(iphone["products_count"], 2)
        self.assertEqual(
            [child["products_count"] for child in iphone["children"]], [1, 1]
        )

    def test_tree_uses_two_queries(self):
        with self.assertNumQueries(2):
            self.client.get(reverse("category-tree"))

    def test_tree_hides_inactive_categories(self):
        self.iphone_15.is_active = False
        self.iphone_15.save()
        response = self.client.get(reverse("category-tree"))
        children = response.data["results"][0]["children"]
        self.assertEqual([item["slug"] for item in children], ["iphone-16"])

    def test_tree_hides_inactive_parents(self):
        self.iphone.is_active = False
        self.iphone.save()
        response = self.client.get(reverse("category-tree"))
        self.assertEqual([item["slug"] for item in response.data["results"]], ["accessories"])


class CategoryListApiTests(APITestCase):
    def setUp(self):
        self.iphone = Category.objects.create(name="iPhone", position=1)
        self.iphone_16 = Category.objects.create(
            name="iPhone 16", parent=self.iphone, position=1
        )

    def test_exposes_parent_and_helpers(self):
        response = self.client.get(reverse("category-list"))
        payload = {item["slug"]: item for item in response.data["results"]}
        self.assertIsNone(payload["iphone"]["parent"])
        self.assertIsNone(payload["iphone"]["parent_slug"])
        self.assertTrue(payload["iphone"]["is_root"])
        self.assertEqual(payload["iphone"]["level"], 0)
        self.assertEqual(payload["iphone"]["children_count"], 1)
        self.assertEqual(payload["iphone-16"]["parent"], self.iphone.pk)
        self.assertEqual(payload["iphone-16"]["parent_slug"], "iphone")
        self.assertEqual(payload["iphone-16"]["level"], 1)
        self.assertEqual(
            payload["iphone-16"]["breadcrumbs"],
            [
                {"id": self.iphone.pk, "name": "iPhone", "slug": "iphone"},
                {
                    "id": self.iphone_16.pk,
                    "name": "iPhone 16",
                    "slug": "iphone-16",
                },
            ],
        )

    def test_list_groups_parents_before_children(self):
        other = Category.objects.create(name="iPad", slug="ipad", position=2)
        Category.objects.create(name="iPad Air", slug="ipad-air", parent=other, position=1)
        response = self.client.get(reverse("category-list"))
        self.assertEqual(
            [item["slug"] for item in response.data["results"]],
            ["iphone", "iphone-16", "ipad", "ipad-air"],
        )

    def test_list_is_ordered_for_pagination(self):
        # GROUP BY из-за аннотаций Count обнуляет Meta.ordering, поэтому
        # queryset обязан быть упорядочен явно, иначе DRF ругается на
        # пагинацию и страницы могут пересекаться.
        with warnings.catch_warnings():
            warnings.simplefilter("error", UnorderedObjectListWarning)
            response = self.client.get(reverse("category-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_filter_by_parent_slug(self):
        response = self.client.get(reverse("category-list"), {"parent": "iphone"})
        self.assertEqual(
            [item["slug"] for item in response.data["results"]], ["iphone-16"]
        )

    def test_filter_by_parent_pk(self):
        response = self.client.get(reverse("category-list"), {"parent": self.iphone.pk})
        self.assertEqual(response.data["count"], 1)

    def test_filter_roots(self):
        for value in ("null", "none", "root", "top", ""):
            with self.subTest(value=value):
                response = self.client.get(
                    reverse("category-list"), {"parent": value}
                )
                self.assertEqual(
                    [item["slug"] for item in response.data["results"]], ["iphone"]
                )

    def test_staff_can_assign_parent(self):
        staff = get_user_model().objects.create_user(
            "boss", password="boss-pass-123", is_staff=True
        )
        self.client.force_authenticate(staff)
        response = self.client.post(
            reverse("category-list"),
            {"name": "iPhone SE", "parent": self.iphone.pk},
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["parent"], self.iphone.pk)
        self.assertEqual(response.data["parent_slug"], "iphone")


class CategoryApiTests(APITestCase):
    def test_list_is_public(self):
        Category.objects.create(name="iPhone 16")
        response = self.client.get(reverse("category-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)

    def test_guest_cannot_create(self):
        response = self.client.post(reverse("category-list"), {"name": "iPhone 15"})
        self.assertIn(response.status_code, (401, 403))

    def test_create_by_staff(self):
        user = get_user_model().objects.create_user(
            "boss", password="boss-pass-123", is_staff=True
        )
        self.client.force_authenticate(user)
        response = self.client.post(reverse("category-list"), {"name": "iPhone 15"})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["slug"])

    def test_hidden_categories_are_not_public(self):
        Category.objects.create(name="iOS", is_active=False)
        response = self.client.get(reverse("category-list"))
        self.assertEqual(response.data["count"], 0)


class ProductApiTests(APITestCase):
    def setUp(self):
        self.category = Category.objects.create(name="iPhone 17")
        self.active = make_product(
            category=self.category, rating_count=120, rating=Decimal("4.8")
        )
        self.hidden = make_product(
            article="IP17P-HIDDEN", name="Скрытый", is_active=False, category=self.category
        )
    def test_hidden_products_are_not_exposed_to_guests(self):
        response = self.client.get(reverse("product-list"))
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["id"], self.active.id)

    def test_staff_sees_hidden_products(self):
        staff = get_user_model().objects.create_user(
            "boss", password="boss-pass-123", is_staff=True
        )
        self.client.force_authenticate(staff)
        response = self.client.get(reverse("product-list"))
        self.assertEqual(response.data["count"], 2)

    def test_filter_by_category_slug_and_ordering(self):
        response = self.client.get(
            reverse("product-list"),
            {"category": self.category.slug, "ordering": "price"},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        prices = [item["price"] for item in response.data["results"]]
        self.assertEqual(prices, sorted(prices))

    def test_filter_price_range(self):
        response = self.client.get(
            reverse("product-list"), {"price_min": 120000, "price_max": 130000}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 0)

    def test_filter_in_stock(self):
        self.active.stock = 0
        self.active.save()
        response = self.client.get(reverse("product-list"), {"in_stock": "true"})
        self.assertEqual(response.data["count"], 0)
        response = self.client.get(reverse("product-list"), {"in_stock": "false"})
        self.assertEqual(response.data["count"], 1)

    def test_filter_on_sale(self):
        self.active.old_price = Decimal("149990.00")
        self.active.save()
        response = self.client.get(reverse("product-list"), {"on_sale": "true"})
        self.assertEqual(response.data["count"], 1)
        self.assertTrue(response.data["results"][0]["has_discount"])

    def test_search(self):
        self.client.get(reverse("product-list"), {"search": "Pro"})

    def test_retrieve_by_slug(self):
        response = self.client.get(reverse("product-detail", args=[self.active.slug]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "iPhone 17 Pro")
        self.assertEqual(response.data["rating_count"], 120)

    def test_discount_percent(self):
        self.active.old_price = Decimal("149990.00")
        self.active.save()
        response = self.client.get(reverse("product-detail", args=[self.active.slug]))
        self.assertEqual(response.data["discount_percent"], 20)

    def test_guest_cannot_create(self):
        response = self.client.post(reverse("product-list"), {"name": "X"})
        self.assertIn(response.status_code, (401, 403))

    def test_write_serializer_rejects_old_price_below_current(self):
        staff = get_user_model().objects.create_user(
            "boss", password="boss-pass-123", is_staff=True
        )
        self.client.force_authenticate(staff)
        response = self.client.patch(
            reverse("product-detail", args=[self.active.slug]),
            {"old_price": "10.00"},
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_facets(self):
        self.active.color = "Black"
        self.active.storage = 256
        self.active.save()
        response = self.client.get(reverse("product-facets"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("Black", response.data["colors"])
        self.assertIn(256, response.data["storages"])
        self.assertIn("categories", response.data)


class ProductCategoryFilterTests(APITestCase):
    """Фильтр по категории должен раскрывать подкатегории."""

    def setUp(self):
        self.iphone = Category.objects.create(name="iPhone", position=1)
        self.iphone_16 = Category.objects.create(
            name="iPhone 16", parent=self.iphone, position=1
        )
        self.iphone_15 = Category.objects.create(
            name="iPhone 15", parent=self.iphone, position=2
        )
        self.ipad = Category.objects.create(name="iPad", position=2)
        self.ipad_pro = Category.objects.create(
            name="iPad Pro", parent=self.ipad, position=1
        )

        self.p16 = make_product(category=self.iphone_16, article="A-1", name="iPhone 16")
        self.p15 = make_product(category=self.iphone_15, article="A-2", name="iPhone 15")
        self.ppro = make_product(category=self.ipad_pro, article="A-3", name="iPad Pro")
        self.plain = make_product(
            category=self.iphone, article="A-4", name="iPhone (без подкатегории)"
        )

    def test_parent_category_includes_descendants(self):
        response = self.client.get(reverse("product-list"), {"category": "iphone"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 3)
        self.assertEqual(
            {item["name"] for item in response.data["results"]},
            {"iPhone 16", "iPhone 15", "iPhone (без подкатегории)"},
        )

    def test_subcategory_returns_only_its_products(self):
        response = self.client.get(reverse("product-list"), {"category": "iphone-16"})
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["name"], "iPhone 16")

    def test_filter_by_parent_pk(self):
        response = self.client.get(
            reverse("product-list"), {"category": self.ipad.pk}
        )
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["name"], "iPad Pro")

    def test_several_categories_at_once(self):
        response = self.client.get(
            reverse("product-list"), {"category": "iphone-16,ipad-pro"}
        )
        self.assertEqual(response.data["count"], 2)

    def test_unknown_category_returns_empty(self):
        response = self.client.get(reverse("product-list"), {"category": "нет-такой"})
        self.assertEqual(response.data["count"], 0)

    def test_facets_expose_roots_with_descendant_counts(self):
        response = self.client.get(reverse("product-facets"))
        categories = {item["slug"]: item for item in response.data["categories"]}
        self.assertEqual(set(categories), {"iphone", "ipad"})
        self.assertEqual(categories["iphone"]["products_count"], 3)
        self.assertEqual(categories["iphone"]["children_count"], 2)
        self.assertEqual(categories["ipad"]["products_count"], 1)
        self.assertTrue(categories["iphone"]["is_root"])

