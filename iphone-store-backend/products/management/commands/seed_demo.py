"""
Наполнение базы данными, совпадающими с мок-базой фронтенда
(frontend/src/data/*.ts и frontend/src/i18n/locales/*.json): дерево
категорий (категория → подкатегория), товары, демо-заказ, тестовые admin.

Структура подкатегорий повторяет группы из `products.items.*`, которые раньше
лежали в i18n фронтенда и использовались в мега-меню «Каталог товаров».
"""

from collections import namedtuple
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction

from orders.models import Order, OrderItem
from products.models import Brand, Category, Product

# slug, название, описание, порядок
CATEGORIES = [
    ("iPhone", "iphone", "Смартфоны Apple", 1),
    ("iPad", "ipad", "Планшеты Apple", 2),
    ("MacBook", "macbook", "Ноутбуки Apple", 3),
    ("Apple Watch", "apple-watch", "Умные часы", 4),
    ("AirPods", "airpods", "Беспроводные наушники", 5),
    ("Аксессуары", "accessories", "Аксессуары и чехлы", 6),
]

# категория, название, slug, порядок
SUBCATEGORIES = [
    ("iphone", "iPhone 16", "iphone-16", 1),
    ("iphone", "iPhone 15", "iphone-15", 2),
    ("iphone", "iPhone 14", "iphone-14", 3),
    ("iphone", "iPhone 13 и старше", "iphone-13-older", 4),
    ("iphone", "iPhone SE", "iphone-se", 5),
    ("ipad", "iPad Pro", "ipad-pro", 1),
    ("ipad", "iPad Air", "ipad-air", 2),
    ("ipad", "iPad mini", "ipad-mini", 3),
    ("macbook", "MacBook Pro", "macbook-pro", 1),
    ("macbook", "MacBook Air", "macbook-air", 2),
    ("macbook", "iMac", "imac", 1),
    ("apple-watch", "Apple Watch Ultra", "apple-watch-ultra", 1),
    ("apple-watch", "Apple Watch Series", "apple-watch-series", 2),
    ("apple-watch", "Apple Watch SE", "apple-watch-se", 3),
    ("airpods", "Наушники", "headphones", 1),
]

ProductSeed = namedtuple(
    "ProductSeed",
    "name sub article price old_price storage color stock rating rating_count",
)

# Товары висят на подкатегориях, а не на категориях верхнего уровня:
# category=iphone вернёт их все благодаря раскрытию потомков в фильтре.
PRODUCTS = [
    # iPhone 16
    ProductSeed("iPhone 16 Pro 256GB", "iphone-16", "IP16PRO-256", 119990, None, 256, "Desert Titanium", 6, "5.0", 24),
    ProductSeed("iPhone 16 128GB", "iphone-16", "IP16-128", 84990, 89990, 128, "Ultramarine", 0, "4.9", 31),
    # iPhone 15
    ProductSeed("iPhone 15 Pro 128GB", "iphone-15", "IP15PRO-128", 99990, 109990, 128, "Blue Titanium", 7, "4.9", 213),
    ProductSeed("iPhone 15 128GB", "iphone-15", "IP15-128", 79990, None, 128, "Black", 12, "4.8", 176),
    ProductSeed("iPhone 15 Pro Max 256GB", "iphone-15", "IP15PMAX-256", 124990, 129990, 256, "Natural Titanium", 4, "4.9", 189),
    # iPhone 14
    ProductSeed("iPhone 14 Pro Max 256GB", "iphone-14", "IP14PMAX-256", 109990, 119990, 256, "Deep Purple", 3, "4.9", 145),
    ProductSeed("iPhone 14 128GB", "iphone-14", "IP14-128", 69990, 74990, 128, "Midnight", 15, "4.7", 98),
    # iPhone 13 и старше
    ProductSeed("iPhone 13 128GB", "iphone-13-older", "IP13-128", 54990, None, 128, "Blue", 0, "4.6", 154),
    ProductSeed("iPhone 12 64GB", "iphone-13-older", "IP12-64", 47990, None, 64, "White", 5, "4.5", 87),
    ProductSeed("iPhone 11 64GB", "iphone-13-older", "IP11-64", 39990, 42990, 64, "Black", 2, "4.4", 132),
    ProductSeed("iPhone XR 64GB", "iphone-13-older", "IPXR-64", 34990, None, 64, "White", 8, "4.3", 76),
    # iPhone SE
    ProductSeed("iPhone SE 2022", "iphone-se", "IPSE-128", 44990, 47990, 128, "Midnight", 9, "4.5", 61),
    # iPad Pro / Air / mini
    ProductSeed("iPad Pro 11 M4 256GB", "ipad-pro", "IPADPRO11-256", 99990, None, 256, "Space Black", 5, "4.9", 88),
    ProductSeed("iPad Pro 13 M4 512GB", "ipad-pro", "IPADPRO13-512", 129990, 139990, 512, "Silver", 3, "4.8", 64),
    ProductSeed("iPad Air 11 M2 128GB", "ipad-air", "IPADAIR11-128", 74990, 79990, 128, "Blue", 11, "4.7", 112),
    ProductSeed("iPad Air 13 M2 256GB", "ipad-air", "IPADAIR13-256", 94990, None, 256, "Starlight", 6, "4.7", 57),
    ProductSeed("iPad mini 7 128GB", "ipad-mini", "IPADMINI7-128", 54990, None, 128, "Purple", 14, "4.6", 73),
    # MacBook Pro / Air / iMac
    ProductSeed("MacBook Pro 14 M3 512GB", "macbook-pro", "MBP14-512", 189990, None, 512, "Space Black", 4, "4.9", 121),
    ProductSeed("MacBook Pro 16 M3 Max 1TB", "macbook-pro", "MBP16-1024", 329990, 349990, 1024, "Space Black", 2, "5.0", 47),
    ProductSeed("MacBook Air 13 M3 256GB", "macbook-air", "MBA13-256", 129990, None, 256, "Midnight", 9, "4.8", 156),
    ProductSeed("MacBook Air 15 M2 512GB", "macbook-air", "MBA15-512", 159990, 169990, 512, "Starlight", 5, "4.7", 68),
    ProductSeed("iMac 24 M3 256GB", "imac", "IMAC24-256", 169990, None, 256, "Blue", 3, "4.8", 39),
    # Apple Watch
    ProductSeed("Apple Watch Ultra 2 49mm", "apple-watch-ultra", "AWU2-49", 74990, None, None, "Natural Titanium", 7, "4.9", 54),
    ProductSeed("Apple Watch Series 10 46mm", "apple-watch-series", "AWS10-46", 49990, 54990, None, "Jet Black", 13, "4.9", 187),
    ProductSeed("Apple Watch Series 9 45mm", "apple-watch-series", "AWS9-45", 39990, None, None, "Midnight", 18, "4.8", 241),
    ProductSeed("Apple Watch SE 2 40mm", "apple-watch-se", "AWSE2-40", 27990, 29990, None, "Storm Blue", 21, "4.6", 92),
    # AirPods
    ProductSeed("AirPods Pro 2 с MagSafe", "headphones", "APP2-MAG", 24990, 26990, None, "White", 32, "4.9", 428),
    ProductSeed("AirPods 4 с ANC", "headphones", "AP4-ANC", 14990, None, None, "White", 40, "4.6", 163),
    ProductSeed("AirPods Max", "headphones", "APMAX-USB", 64990, 69990, None, "Midnight", 5, "4.7", 84),
]

DEMO_ADMIN = {"username": "demo", "password": "demo12345", "email": "demo@example.com"}
DEMO_CUSTOMER = {"username": "customer", "password": "customer12345", "email": "customer@example.com"}


class Command(BaseCommand):
    help = "Наполняет базу демо-категориями, подкатегориями, товарами, заказом и пользователями."

    def add_arguments(self, parser) -> None:
        parser.add_argument(
            "--flush",
            action="store_true",
            help="Удалить товары и категории перед наполнением.",
        )
        parser.add_argument(
            "--no-order",
            action="store_true",
            help="Не создавать демонстрационный заказ.",
        )

    @transaction.atomic
    def handle(self, *args, **options) -> None:
        if options["flush"]:
            Product.objects.all().delete()
            # Category.parent — PROTECT: сначала подкатегории, затем корневые.
            Category.objects.filter(parent__isnull=False).delete()
            Category.objects.all().delete()
            self.stdout.write(self.style.WARNING("Товары и категории удалены."))

        brand, _ = Brand.objects.get_or_create(slug="apple", defaults={"name": "Apple"})

        categories = self._create_categories()
        subcategories = self._create_subcategories(categories)

        created_count = 0
        for seed in PRODUCTS:
            subcategory = subcategories[seed.sub]
            _, created = Product.objects.get_or_create(
                article=seed.article,
                defaults={
                    "name": seed.name,
                    "category": subcategory,
                    "brand": brand,
                    "price": Decimal(seed.price),
                    "old_price": Decimal(seed.old_price) if seed.old_price else None,
                    "storage": seed.storage,
                    "color": seed.color,
                    "stock": seed.stock,
                    "rating": Decimal(seed.rating),
                    "rating_count": seed.rating_count,
                    "description": (
                        f"{seed.name}. Оригинальный товар, гарантия 1 год, "
                        "бесплатная доставка по России."
                    ),
                },
            )
            created_count += int(created)

        admin = self._create_user(**DEMO_ADMIN, is_staff=True)
        customer = self._create_user(**DEMO_CUSTOMER)

        if not options["no_order"]:
            self._create_demo_order(customer)

        self.stdout.write(
            self.style.SUCCESS(
                f"Готово: категорий {Category.objects.roots().count()}, "
                f"подкатегорий {Category.objects.filter(parent__isnull=False).count()}, "
                f"брендов {Brand.objects.count()}, "
                f"товаров {Product.objects.count()} (новых {created_count}), "
                f"заказов {Order.objects.count()}."
            )
        )
        self.stdout.write(f"Admin:    {admin.username} / {DEMO_ADMIN['password']}")
        self.stdout.write(f"Покупатель: {customer.username} / {DEMO_CUSTOMER['password']}")

    def _create_categories(self) -> dict:
        categories = {}
        for name, slug, description, position in CATEGORIES:
            category, _ = Category.objects.get_or_create(
                slug=slug,
                defaults={"name": name, "description": description, "position": position},
            )
            categories[slug] = category
        return categories

    def _create_subcategories(self, categories: dict) -> dict:
        subcategories = {}
        for parent_slug, name, slug, position in SUBCATEGORIES:
            subcategory, _ = Category.objects.get_or_create(
                slug=slug,
                defaults={
                    "name": name,
                    "parent": categories[parent_slug],
                    "position": position,
                },
            )
            subcategories[slug] = subcategory
        return subcategories

    def _create_user(self, username: str, password: str, email: str, is_staff: bool = False):
        user_model = get_user_model()
        user, created = user_model.objects.get_or_create(
            username=username, defaults={"email": email, "is_staff": is_staff}
        )
        if created:
            user.set_password(password)
            user.save(update_fields=["password", "email", "is_staff"])
        return user

    def _create_demo_order(self, customer) -> None:
        if Order.objects.exists():
            return
        items = list(Product.objects.filter(stock__gte=2)[:2])
        if not items:
            return
        order = Order.objects.create(
            user=customer,
            full_name="Иван Петров",
            phone="+7 900 000-00-00",
            email="ivan@example.com",
            address="Москва, ул. Ленина, д. 1, кв. 10",
            payment_method=Order.PaymentMethod.CARD,
            is_paid=True,
            status=Order.Status.PAID,
            total_price=sum((item.price * 2 for item in items), Decimal("0.00")),
        )
        OrderItem.objects.bulk_create(
            [
                OrderItem(
                    order=order,
                    product=item,
                    name=item.name,
                    price=item.price,
                    quantity=2,
                )
                for item in items
            ]
        )
        self.stdout.write(f"Создан заказ {order.number}")
