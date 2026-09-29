import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/auth";
import { useWishlist } from "../context/wishlist";
import { useCompare } from "../context/compare";
import { useProducts } from "../context/products";
import { PRODUCT_IMAGE_FALLBACK } from "../api/client";
import type { AuthUser } from "../api/auth";
import { cancelOrder, fetchOrders, type ApiOrder, type ApiOrderItem } from "../api/orders";

function fieldErrors(body: unknown): string[] {
  if (!body || typeof body !== "object") return [];
  const messages: string[] = [];
  const rec = body as Record<string, unknown>;
  if (typeof rec.non_field_errors === "string") return [rec.non_field_errors];
  if (Array.isArray(rec.non_field_errors)) {
    messages.push(...rec.non_field_errors.map(String));
  }
  for (const [key, value] of Object.entries(rec)) {
    if (key === "non_field_errors") continue;
    if (Array.isArray(value)) messages.push(...value.map(String));
    else if (typeof value === "string") messages.push(value);
  }
  return messages;
}

const STATUS_STYLES: Record<string, string> = {
  new: "bg-blue-50 text-blue-700 ring-blue-200",
  confirmed: "bg-amber-50 text-amber-700 ring-amber-200",
  shipped: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  delivered: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  cancelled: "bg-red-50 text-red-600 ring-red-200",
};

function formatPrice(value: string | undefined, lang: string): string {
  if (!value) return "—";
  const n = Number(value);
  if (Number.isNaN(n)) return value;
  return `${n.toLocaleString(lang === "en" ? "en-US" : "ru-RU")} ₽`;
}

function formatDate(value: string | undefined, lang: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

const inputClass =
  "peer w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition-all focus:border-[#0071E4] focus:bg-white focus:ring-4 focus:ring-[#0071E4]/10";

const labelClass =
  "mb-1.5 block text-xs font-medium text-gray-600";

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

function Alert({ type, children }: { type: "success" | "error"; children: ReactNode }) {
  const styles =
    type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-red-200 bg-red-50 text-red-600";
  return (
    <div className={`rounded-xl border px-3.5 py-2.5 text-xs ${styles}`}>{children}</div>
  );
}

function useAutoHide(active: boolean, delay = 4000) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    const showTimer = window.setTimeout(() => {
      if (!cancelled) setVisible(true);
    }, 0);
    const hideTimer = window.setTimeout(() => {
      if (!cancelled) setVisible(false);
    }, delay);
    return () => {
      cancelled = true;
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, [active, delay]);
  return visible;
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0071E4] text-lg font-bold text-white shadow-lg shadow-[#0071E4]/30">
      {initials || "?"}
    </div>
  );
}

function ProfileForm({ user }: { user: AuthUser }) {
  const { t } = useTranslation();
  const { updateProfile } = useAuth();
  const [firstName, setFirstName] = useState(user.first_name ?? "");
  const [lastName, setLastName] = useState(user.last_name ?? "");
  const [email, setEmail] = useState(user.email ?? "");
  const [userName, setUserName] = useState(user.username ?? "");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const showSaved = useAutoHide(saved);

  const dirty =
    firstName !== (user.first_name ?? "") ||
    lastName !== (user.last_name ?? "") ||
    email !== (user.email ?? "") ||
    userName !== (user.username ?? "");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors([]);
    try {
      await updateProfile({ username: userName, email, first_name: firstName, last_name: lastName });
      setSaved(true);
    } catch (err) {
      setErrors(fieldErrors((err as { data?: unknown }).data));
    } finally {
      setSaving(false);
    }
  };

  const disabled = !dirty || saving;

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("account.firstName")}>
          <input
            className={inputClass}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder={t("account.firstName")}
          />
        </Field>
        <Field label={t("account.lastName")}>
          <input
            className={inputClass}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder={t("account.lastName")}
          />
        </Field>
      </div>
      <Field label={t("auth.username")}>
        <input
          className={inputClass}
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder={t("auth.username")}
          required
        />
      </Field>
      <Field label={t("auth.email")}>
        <input
          className={inputClass}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("auth.email")}
        />
      </Field>

      {errors.length > 0 && (
        <Alert type="error">
          <ul className="list-inside list-disc">
            {errors.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </Alert>
      )}
      {showSaved && <Alert type="success">{t("account.saved")}</Alert>}

      <button
        type="submit"
        disabled={disabled}
        className="rounded-xl bg-[#0071E4] px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-[#005bb5] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {saving ? t("account.saving") : t("account.save")}
      </button>
    </form>
  );
}

function PasswordForm() {
  const { t } = useTranslation();
  const { changePassword } = useAuth();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const showSaved = useAutoHide(saved);

  const disabled =
    saving || !oldPassword || !newPassword || newPassword !== confirmPassword;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors([]);
    try {
      await changePassword(oldPassword, newPassword, confirmPassword);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSaved(true);
    } catch (err) {
      setErrors(fieldErrors((err as { data?: unknown }).data));
    } finally {
      setSaving(false);
    }
  };

  const passwordInput = (value: string, setValue: (v: string) => void, label: string) => (
    <Field label={label}>
      <div className="relative">
        <input
          className={inputClass}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="••••••••"
          required
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400 transition-colors hover:text-gray-600"
          aria-label={t(show ? "account.hidePassword" : "account.showPassword")}
        >
          {show ? t("account.hidePassword") : t("account.showPassword")}
        </button>
      </div>
    </Field>
  );

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      {passwordInput(oldPassword, setOldPassword, t("account.oldPassword"))}
      {passwordInput(newPassword, setNewPassword, t("account.newPassword"))}
      {passwordInput(confirmPassword, setConfirmPassword, t("account.confirmPassword"))}
      <p className="text-xs text-gray-400">{t("account.passwordHint")}</p>

      {errors.length > 0 && (
        <Alert type="error">
          <ul className="list-inside list-disc">
            {errors.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </Alert>
      )}
      {showSaved && <Alert type="success">{t("account.passwordChanged")}</Alert>}

      <button
        type="submit"
        disabled={disabled}
        className="rounded-xl bg-[#0071E4] px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-[#005bb5] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {saving ? t("account.saving") : t("account.changePassword")}
      </button>
    </form>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const { t } = useTranslation();
  if (!status) return null;
  const style = STATUS_STYLES[status] ?? "bg-gray-50 text-gray-600 ring-gray-200";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${style}`}>
      {t(`account.status.${status}`, { defaultValue: status })}
    </span>
  );
}

function OrderItemRow({ item, lang }: { item: ApiOrderItem; lang: string }) {
  const { products } = useProducts();
  const product = products.find((p) => String(p.id) === String(item.product));
  const image = product?.image ?? PRODUCT_IMAGE_FALLBACK;
  const href =
    item.product_slug || product?.slug
      ? `/${lang}/product/${item.product_slug ?? product?.slug}`
      : null;
  const itemName = item.name ?? item.product_name ?? "";
  const body = (
    <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-2.5">
      <img
        src={image}
        alt={itemName}
        loading="lazy"
        className="h-14 w-14 rounded-lg bg-white object-contain p-1"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-gray-800">{itemName}</p>
        <p className="text-xs text-gray-400">×{item.quantity ?? 1}</p>
      </div>
      <p className="text-sm font-semibold text-gray-900">
        {item.price ? formatPrice(String(item.price), lang) : ""}
      </p>
    </div>
  );

  return href ? (
    <Link to={href} className="block transition-opacity hover:opacity-80">
      {body}
    </Link>
  ) : (
    body
  );
}

function AccountHeader({
  user,
  username,
  onLogout,
}: {
  user: AuthUser | null;
  username: string | null;
  onLogout: () => void;
}) {
  const { t } = useTranslation();
  const display = user?.username ?? username ?? "";
  const title = user?.first_name || user?.last_name ? [user?.first_name, user?.last_name].filter(Boolean).join(" ") : (user?.username ?? username);

  return (
    <div className="rounded-3xl bg-gradient-to-r from-[#0071E4] to-[#00a3e4] p-6 text-white shadow-xl shadow-[#0071E4]/20">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="border-2 border-white/40 rounded-full">
            <Avatar name={title ?? display} />
          </div>
          <div>
            <h1 className="text-xl font-bold">
              {t("account.greeting", { username: title ?? display })}
            </h1>
            <p className="mt-0.5 text-sm text-white/80">@{display}</p>
            {user?.email ? (
              <p className="text-sm text-white/80">{user.email}</p>
            ) : (
              <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium">
                {t("account.member")}
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex w-fit items-center justify-center gap-2 rounded-xl border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/15"
        >
          {t("auth.logout")}
        </button>
      </div>
    </div>
  );
}

function StatCard({
  href,
  label,
  count,
  icon,
  accent,
}: {
  href: string;
  label: string;
  count: number;
  icon: ReactNode;
  accent: string;
}) {
  return (
    <Link
      to={href}
      className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${accent}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold leading-none text-gray-900">{count}</p>
        <p className="mt-1 truncate text-sm text-gray-500">{label}</p>
      </div>
    </Link>
  );
}

function OrdersSection({
  orders,
  ordersError,
  canceling,
  onCancel,
  onRetry,
  lang,
}: {
  orders: ApiOrder[] | null;
  ordersError: boolean;
  canceling: string | null;
  onCancel: (number: string) => void;
  onRetry: () => void;
  lang: string;
}) {
  const { t } = useTranslation();
  const [confirming, setConfirming] = useState<string | null>(null);

  if (orders === null && !ordersError) {
    return (
      <div className="flex flex-col gap-3">
        {[0, 1].map((i) => (
          <div key={i} className="animate-pulse rounded-2xl border border-gray-100 bg-white p-4">
            <div className="h-4 w-40 rounded bg-gray-200" />
            <div className="mt-3 h-3 w-28 rounded bg-gray-100" />
            <div className="mt-4 h-12 rounded-xl bg-gray-100" />
          </div>
        ))}
      </div>
    );
  }

  if (ordersError) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-gray-100 bg-white px-4 py-12 text-center">
        <p className="text-sm text-gray-500">{t("account.ordersError")}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300"
        >
          {t("account.retry")}
        </button>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-gray-100 bg-white px-4 py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-50 text-2xl">📦</div>
        <p className="mt-4 text-[17px] font-semibold text-gray-800">{t("account.ordersEmptyTitle")}</p>
        <p className="mt-1 max-w-sm text-sm text-gray-500">{t("account.ordersEmptyText")}</p>
        <Link
          to={`/${lang}/catalog`}
          className="mt-5 rounded-xl bg-[#0071E4] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#005bb5]"
        >
          {t("nav.catalog")}
        </Link>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {orders.map((order) => (
        <li key={order.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[15px] font-bold text-gray-900">{order.number}</p>
              <p className="text-xs text-gray-400">{formatDate(order.created_at, lang)}</p>
            </div>
            <StatusBadge status={order.status} />
          </div>
          {order.items && order.items.length > 0 ? (
            <div className="mt-3 flex flex-col gap-2">
              {order.items.map((item) => (
                <OrderItemRow key={item.id ?? `${order.id}-${item.product}`} item={item} lang={lang} />
              ))}
            </div>
          ) : (
            <p className="mt-3 text-xs text-gray-400">{t("account.noOrders")}</p>
          )}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3">
            <p className="text-sm font-semibold text-gray-900">
              {t("account.orderTotal")}:{" "}
              <span className="text-[15px]">{formatPrice(order.total_price, lang)}</span>
            </p>
            {order.status !== "cancelled" &&
              (confirming === order.number ? (
                <span className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{t("account.cancelConfirm")}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirming(null);
                      onCancel(order.number);
                    }}
                    disabled={canceling === order.number}
                    className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
                  >
                    {canceling === order.number ? t("common.loading") : t("account.confirm")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirming(null)}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-gray-300"
                  >
                    {t("common.ok")}
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirming(order.number)}
                  disabled={canceling !== null}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-red-200 hover:text-red-600 disabled:opacity-50"
                >
                  {t("account.cancelOrder")}
                </button>
              ))}
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function Account() {
  const { t } = useTranslation();
  const { lang } = useParams();
  const { isAuthenticated, user, username, logout } = useAuth();
  const { count: wishlistCount } = useWishlist();
  const { count: compareCount } = useCompare();

  const [orders, setOrders] = useState<ApiOrder[] | null>(null);
  const [ordersError, setOrdersError] = useState(false);
  const [canceling, setCanceling] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    fetchOrders()
      .then((list) => {
        if (!cancelled) setOrders(list);
      })
      .catch(() => {
        if (!cancelled) setOrdersError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, reloadKey]);

  const reloadOrders = () => {
    setOrders(null);
    setOrdersError(false);
    setReloadKey((k) => k + 1);
  };

  const handleCancel = async (number: string) => {
    setCanceling(number);
    try {
      await cancelOrder(number);
      setOrders((prev) => prev?.filter((o) => o.number !== number) ?? null);
    } catch {
      // keep the order, no error UI for now
    } finally {
      setCanceling(null);
    }
  };

  const handleLogout = () => {
    logout();
    setOrders(null);
    setOrdersError(false);
  };

  const sectionCard = "rounded-2xl border border-gray-100 bg-white p-5 shadow-sm";

  const quickLinks = useMemo(
    () => [
      { path: `/${lang}/wishlist`, label: t("header.wishlist"), count: wishlistCount, emoji: "❤️" },
      { path: `/${lang}/compare`, label: t("header.compare"), count: compareCount, emoji: "↔️" },
      { path: `/${lang}/catalog`, label: t("nav.catalog"), count: null, emoji: "🛍️" },
      { path: `/${lang}/sales`, label: t("nav.sales"), count: null, emoji: "🔥" },
      { path: `/${lang}/delivery-payment`, label: t("nav.deliveryPayment"), count: null, emoji: "🚚" },
      { path: `/${lang}/warranty`, label: t("nav.warranty"), count: null, emoji: "🛡️" },
      { path: `/${lang}/credit`, label: t("nav.credit"), count: null, emoji: "💳" },
      { path: `/${lang}/contacts`, label: t("nav.contacts"), count: null, emoji: "📞" },
    ],
    [lang, t, wishlistCount, compareCount]
  );

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto flex justify-center px-4 py-16">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-3xl">🔐</div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">{t("auth.loginRequired")}</h1>
          <p className="mt-2 text-sm text-gray-500">{t("auth.loginRequiredHint")}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to={`/${lang}/login`}
              className="rounded-xl bg-[#0071E4] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#005bb5]"
            >
              {t("auth.login")}
            </Link>
            <Link
              to={`/${lang}/register`}
              className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300"
            >
              {t("auth.register")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const orderCount = orders?.length ?? 0;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <AccountHeader user={user} username={username} onLogout={handleLogout} />

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          href={`/${lang}/wishlist`}
          label={t("account.stats.favorites")}
          count={wishlistCount}
          accent="bg-rose-50 text-rose-500"
          icon={<span className="text-xl">❤️</span>}
        />
        <StatCard
          href={`/${lang}/compare`}
          label={t("account.stats.compare")}
          count={compareCount}
          accent="bg-indigo-50 text-indigo-500"
          icon={<span className="text-xl">↔️</span>}
        />
        <StatCard
          href="#orders"
          label={t("account.stats.orders")}
          count={orderCount}
          accent="bg-amber-50 text-amber-500"
          icon={<span className="text-xl">📦</span>}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <section className={sectionCard}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-lg">👤</div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{t("account.profile")}</h2>
                <p className="text-xs text-gray-400">{t("account.emptyProfile")}</p>
              </div>
            </div>
            <div className="mt-5">
              {user ? (
                <ProfileForm key={user.id} user={user} />
              ) : (
                <p className="text-sm text-gray-500">{t("common.loading")}</p>
              )}
            </div>
          </section>

          <section className={sectionCard}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-lg">🔒</div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{t("account.changePassword")}</h2>
                <p className="text-xs text-gray-400">{t("account.passwordTitle")}</p>
              </div>
            </div>
            <div className="mt-5">
              <PasswordForm />
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-6">
          <section className={sectionCard}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-lg">🧭</div>
              <h2 className="text-lg font-semibold text-gray-900">{t("account.links")}</h2>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="group flex items-center justify-between rounded-xl border border-gray-100 px-3.5 py-2.5 text-sm text-gray-800 transition-all hover:border-[#0071E4]/30 hover:bg-blue-50/50"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-base">{link.emoji}</span>
                    {link.label}
                  </span>
                  <span className="flex items-center gap-2">
                    {link.count !== null && link.count > 0 && (
                      <span className="rounded-full bg-[#0071E4] px-2 py-0.5 text-xs font-semibold text-white">
                        {link.count}
                      </span>
                    )}
                    <span className="text-gray-300 transition-transform group-hover:translate-x-0.5">→</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section className={sectionCard} id="orders">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-lg">📦</div>
              <h2 className="text-lg font-semibold text-gray-900">{t("account.orders")}</h2>
              {orders && orders.length > 0 && (
                <span className="ml-auto rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                  {t("account.orderItems", { count: orders.length })}
                </span>
              )}
            </div>
            <div className="mt-4">
              <OrdersSection
                orders={orders}
                ordersError={ordersError}
                canceling={canceling}
                onCancel={handleCancel}
                onRetry={reloadOrders}
                lang={lang ?? "ru"}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}