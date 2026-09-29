# iPhone Store — Backend

REST API магазина: Django 6 + Django REST Framework.
Каталог, корзина (гостевая и пользовательская), заказы, JWT-авторизация, Swagger.

Полный список эндпоинтов — ниже и в интерактивном виде на `/docs/`.

---

## Запуск

```powershell
.venv\Scripts\activate
python manage.py runserver
```

Swagger UI: <http://127.0.0.1:8000/docs/>

С чистого листа:

```powershell
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python manage.py migrate
python manage.py seed_demo
python manage.py runserver
```

| Роль       | Логин      | Пароль           |
| ---------- | ---------- | ---------------- |
| admin      | `demo`     | `demo12345`      |
| покупатель | `customer` | `customer12345`  |

---

## Все эндпоинты

Базовый URL: `http://127.0.0.1:8000`
Все списки пагинированы: `{count, next, previous, results}` (`?page=`, `?page_size=` ≤ 100).

### Служебные

| Метод | Путь          | Описание                              |
| ----- | ------------- | ------------------------------------- |
| GET   | `/health/`    | `{"status":"ok","database":"ok"}`     |
| GET   | `/schema/`    | OpenAPI 3 (YAML)                      |
| GET   | `/docs/`      | Swagger UI                            |
| GET   | `/redoc/`     | ReDoc                                 |
| GET   | `/admin/`     | Django admin                          |
| GET   | `/media/...`  | загруженные файлы (только `DEBUG=True`)|

### Регистрация и авторизация

| Метод | Путь                   | Тело                                        | Ответ |
| ----- | ---------------------- | ------------------------------------------- | ----- |
| POST  | `/auth/register/`      | `{username, email, password, password_confirm}` | `201 {user, access, refresh}` |
| POST  | `/auth/token/`         | `{username, password}`                      | `{access, refresh}` |
| POST  | `/auth/token/refresh/` | `{refresh}`                                 | `{access, rotate}` |
| GET   | `/auth/me/`            | —                                           | профиль текущего пользователя |

Токен передаётся как `Authorization: Bearer <access>`.
При регистрации и логине гостевая корзина автоматически переносится в аккаунт.

**Тело `POST /auth/register/`**

```json
{
  "username": "ivan",
  "email": "ivan@example.com",
  "password": "Slozhnyy-Parol-2026",
  "password_confirm": "Slozhnyy-Parol-2026"
}
```

Пароль должен пройти стандартные проверки Django (минимум 8 символов,
не похож на логин, не только цифры, не из списка популярных).
Ответ `201` сразу содержит токены — второй запрос за логином не нужен:

```json
{
  "user": {
    "id": 3,
    "username": "ivan",
    "email": "ivan@example.com",
    "first_name": "",
    "last_name": "",
    "is_staff": false
  },
  "access": "eyJhbGciOi...",
  "refresh": "eyJhbGciOi..."
}
```

Ошибки `400` при регистрации:

```json
{
  "username": ["Пользователь с таким логином уже существует."],
  "password_confirm": ["Пароли не совпадают."],
  "password": ["Этот пароль слишком похож на ваш логин."]
}
```


### Товары `/products`

Чтение — публичное, запись — только `is_staff`.

| Метод           | Путь                 | Описание                     |
| --------------- | -------------------- | ---------------------------- |
| GET             | `/products/`         | список с фильтрами           |
| GET             | `/products/{slug}/`  | карточка товара              |
| GET             | `/products/facets/`  | значения для фильтров        |
| POST            | `/products/`         | создать *(staff)*            |
| PUT / PATCH     | `/products/{slug}/`  | изменить *(staff)*           |
| DELETE          | `/products/{slug}/`  | удалить *(staff)*            |

**Параметры `GET /products/`**

| Параметр                  | Пример                       | Описание                             |
| ------------------------- | ---------------------------- | ------------------------------------ |
| `search`                  | `?search=XR`                 | название / артикул / описание        |
| `category`                | `?category=iphone,ipad`      | slug или pk, несколько через запятую |
| `price_min` / `price_max` | `?price_min=40000`           | диапазон цены                        |
| `storage`                 | `?storage=128,256`           | память, ГБ                           |
| `color`                   | `?color=Black`               | цвет                                 |
| `condition`               | `?condition=new`             | `new` / `sealed` / `used`            |
| `brand`                   | `?brand=1`                   | id бренда                            |
| `rating_min`              | `?rating_min=4.5`            | рейтинг не ниже                      |
| `in_stock`                | `?in_stock=true`             | только в наличии                     |
| `on_sale`                 | `?on_sale=true`              | только со скидкой                    |
| `ordering`                | `?ordering=price`            | `price`,`-price`,`rating`,`name`     |
| `page`, `page_size`       | `?page=2&page_size=50`       | пагинация                            |

**Тело для создания/изменения (staff)**

```json
{
  "name": "iPhone 15 Pro 128GB",
  "category": 5,
  "brand": 1,
  "article": "IP15PRO-128",
  "description": "Оригинал, гарантия 1 год",
  "price": "99990.00",
  "old_price": "109990.00",
  "condition": "new",
  "color": "Blue Titanium",
  "storage": 128,
  "rating": "4.9",
  "rating_count": 213,
  "stock": 7,
  "is_active": true
}
```

`old_price` должен быть больше `price`, иначе `400`.

### Категории `/categories`

Категории образуют дерево в два уровня: категория верхнего уровня → подкатегории
(серии вроде «iPhone 16»). Товары висят на подкатегориях.

| Метод       | Путь                 | Доступ |
| ----------- | -------------------- | ------ |
| GET         | `/categories/`       | все    |
| GET         | `/categories/tree/`  | все    |
| GET         | `/categories/{id}/`  | все    |
| POST        | `/categories/`       | staff  |
| PUT/PATCH   | `/categories/{id}/`  | staff  |
| DELETE      | `/categories/{id}/`  | staff  |

Поля: `name`, `slug` (генерируется), `parent`, `parent_slug`, `level`, `is_root`,
`breadcrumbs`, `description`, `image`, `position`, `is_active`, `products_count`,
`children_count`.

`products_count` считает товары самой категории **и всех её подкатегорий**.
`parent` — pk родителя, `null` у категории верхнего уровня. Циклы и
присвоение категории себе в родители отклоняются валидацией.

**`GET /categories/tree/`** — дерево для мега-меню, максимум 2 уровня:

```json
{
  "count": 1,
  "results": [
    {
      "id": 1, "name": "iPhone", "slug": "iphone", "image": null,
      "position": 1, "products_count": 12, "is_active": true,
      "children": [
        { "id": 7, "name": "iPhone 16", "slug": "iphone-16", "image": null,
          "position": 1, "products_count": 2, "is_active": true, "children": [] }
      ]
    }
  ]
}
```

Всего два SQL-запроса независимо от количества категорий. Неактивные
категории скрыты от гостей.

**Фильтр по родителю** у `/categories/`: `?parent=iphone` — только подкатегории
`iPhone`; `?parent=null` (также `none`, `root`, `top`, пустое значение) — только
категории верхнего уровня. Принимается slug или pk.

**Фильтр товаров по категории** раскрывает потомков: `?category=iphone`
возвращает товары всех подкатегорий iPhone, а `?category=iphone-16` — только
этой серии. Несколько значений через запятую, принимаются slug и pk.

### Бренды `/brands`

| Метод     | Путь              | Доступ |
| --------- | ----------------- | ------ |
| GET       | `/brands/`        | все    |
| GET       | `/brands/{id}/`   | все    |
| POST/PUT/PATCH/DELETE | те же пути | staff  |

### Корзина `/cart`

Публично: гость — по сессии, пользователь — по аккаунту.

| Метод         | Путь             | Тело / результат                                        |
| ------------- | ---------------- | ------------------------------------------------------- |
| GET           | `/cart/`         | вся корзина: `items`, `total_quantity`, `total_price`    |
| GET           | `/cart/summary/` | `{"total_quantity":2,"total_price":"89980.00"}`          |
| GET           | `/cart/{id}/`    | одна позиция                                            |
| POST          | `/cart/`         | `{"product":24,"quantity":2}`                           |
| PUT / PATCH   | `/cart/{id}/`    | `{"quantity":3}`; `quantity:0` — удалить позицию        |
| DELETE        | `/cart/{id}/`    | удалить позицию                                         |
| POST / DELETE | `/cart/clear/`   | очистить корзину                                        |

Повторный `POST` с тем же товаром увеличивает количество.
Количество ограничивается остатком на складе, при превышении — `400`.

### Заказы `/orders`

Нужен `Bearer`-токен. Свой — только свои, staff — все.

| Метод | Путь                       | Описание                              |
| ----- | -------------------------- | ------------------------------------- |
| GET   | `/orders/`                 | список заказов                         |
| GET   | `/orders/{number}/`        | заказ по номеру (`IP-260928-B8D337`)  |
| POST  | `/orders/`                 | оформить заказ из корзины              |
| POST  | `/orders/{number}/cancel/` | отменить заказ, склад восстановится   |

**Тело `POST /orders/`**

```json
{
  "full_name": "Иван Петров",
  "phone": "+7 900 000-00-00",
  "email": "ivan@example.com",
  "address": "Москва, ул. Ленина, д. 1",
  "comment": "",
  "payment_method": "card"
}
```

`payment_method`: `card` | `cash` | `yandex` | `sbp`

Позиции сохраняют название и цену на момент покупки, остатки списываются,
корзина очищается — всё в одной транзакции.

---

## Примеры ответов

**Элемент списка товаров**

```json
{
  "id": 24,
  "name": "iPhone SE 2022",
  "slug": "iphone-se-2022",
  "article": "IPSE-128",
  "category": "iPhone",
  "category_slug": "iphone",
  "price": "44990.00",
  "old_price": "47990.00",
  "discount_percent": 6,
  "has_discount": true,
  "condition": "new",
  "color": "Midnight",
  "storage": 128,
  "rating": "4.5",
  "rating_count": 61,
  "image": null,
  "stock": 7,
  "in_stock": true
}
```

**Карточка товара** — те же поля + `description`, `brand`, `is_active`, `created_at`, `updated_at`

**Корзина**

```json
{
  "id": 2,
  "items": [
    {
      "id": 3,
      "product": 24,
      "product_name": "iPhone SE 2022",
      "product_slug": "iphone-se-2022",
      "product_image": null,
      "product_price": "44990.00",
      "product_stock": 7,
      "quantity": 2,
      "total_price": "89980.00"
    }
  ],
  "total_quantity": 2,
  "total_price": "89980.00",
  "updated_at": "2026-09-28T15:37:23.240434+03:00"
}
```

**Заказ**

```json
{
  "id": 2,
  "number": "IP-260928-B8D337",
  "user": "customer",
  "status": "new",
  "status_display": "Новый",
  "payment_method": "card",
  "is_paid": false,
  "full_name": "Иван Петров",
  "phone": "+7 900 000-00-00",
  "email": "ivan@example.com",
  "address": "Москва, ул. Ленина, д. 1",
  "comment": "",
  "total_price": "89980.00",
  "items": [
    {
      "id": 3,
      "product": 24,
      "name": "iPhone SE 2022",
      "price": "44990.00",
      "quantity": 2,
      "total_price": "89980.00"
    }
  ],
  "created_at": "2026-09-28T15:37:23.459831+03:00"
}
```

`status`: `new` · `confirmed` · `paid` · `shipped` · `delivered` · `cancelled`

**`GET /products/facets/`**

```json
{
  "categories": [
    {
      "id": 1, "name": "iPhone", "slug": "iphone", "parent": null,
      "parent_slug": null, "level": 0, "is_root": true, "is_active": true,
      "breadcrumbs": [{ "id": 1, "name": "iPhone", "slug": "iphone" }],
      "image": null, "description": "Смартфоны Apple", "position": 1,
      "products_count": 12, "children_count": 5
    }
  ],
  "colors": ["Black", "Blue", "Blue Titanium"],
  "storages": [64, 128, 256],
  "conditions": [
    { "value": "new", "label": "Новый" },
    { "value": "sealed", "label": "Запечатанный" },
    { "value": "used", "label": "Б/у" }
  ]
}
```

**Ошибки** — стандартные DRF: `400` валидация, `401` нет токена, `403` нет прав,
`404` не найдено.

```json
{ "quantity": ["Доступно только 7 шт."] }
```

---

## Пример полного цикла (curl)

```bash
# регистрация (сразу возвращает токены)
curl -s -X POST localhost:8000/auth/register/ -H 'Content-Type: application/json' \
  -d '{"username":"ivan","email":"ivan@example.com","password":"Slozhnyy-Parol-2026","password_confirm":"Slozhnyy-Parol-2026"}'

TOKEN=$(curl -s -X POST localhost:8000/auth/token/ \
  -H 'Content-Type: application/json' \
  -d '{"username":"customer","password":"customer12345"}' | jq -r .access)

curl -s localhost:8000/auth/me/ -H "Authorization: Bearer $TOKEN"

# каталог со скидками
curl -s 'localhost:8000/products/?category=iphone&on_sale=true&ordering=price'

# в корзину
curl -s -X POST localhost:8000/cart/ -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' -d '{"product":24,"quantity":2}'

curl -s localhost:8000/cart/ -H "Authorization: Bearer $TOKEN"

# оформить заказ
curl -s -X POST localhost:8000/orders/ -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"full_name":"Иван Петров","phone":"+79000000000","address":"Москва, Ленина 1","payment_method":"card"}'
```

---

## Структура

```
config/          настройки, urls, регистрация/логин, health-check, пагинация
products/        Category (дерево), Brand, Product, фильтры каталога, seed_demo
cart/            Cart, CartItem — сессионная корзина гостя + корзина юзера
orders/          Order, OrderItem, оформление заказа из корзины
```

## Настройки

Все параметры читаются из `.env` (см. `.env.example`).
SQLite из коробки, PostgreSQL — замените `DATABASE_URL`:

```
DATABASE_URL=postgres://user:password@localhost:5432/iphone_store
```

При `DEBUG=False` автоматически включаются HSTS, secure-cookie и редирект на HTTPS.

## Команды

```bash
python manage.py migrate            # миграции
python manage.py makemigrations     # новые миграции
python manage.py seed_demo          # демо-данные (--flush — пересоздать)
python manage.py createsuperuser    # свой админ
python manage.py test               # 98 тестов
python manage.py spectacular --file schema.yml
```
