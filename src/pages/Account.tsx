import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/auth";
import { cancelOrder, fetchOrders, type ApiOrder } from "../api/orders";

export default function Account() {
  const { t } = useTranslation();
  const { lang } = useParams();
  const { isAuthenticated, user, username, logout } = useAuth();
  const [orders, setOrders] = useState<ApiOrder[] | null>(null);
  const [ordersError, setOrdersError] = useState(false);
  const [canceling, setCanceling] = useState<string | null>(null);

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
  }, [isAuthenticated]);

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

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto flex justify-center px-4 py-16">
        <div className="w-full max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900">{t("auth.loginRequired")}</h1>
          <p className="mt-2 text-sm text-gray-500">{t("auth.loginRequiredHint")}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to={`/${lang}/login`}
              className="rounded-lg bg-[#0071E4] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#005bb5]"
            >
              {t("auth.login")}
            </Link>
            <Link
              to={`/${lang}/register`}
              className="rounded-lg border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300"
            >
              {t("auth.register")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("account.title")}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {t("account.greeting", { username: user?.username ?? username ?? "" })}
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:text-gray-900"
        >
          {t("auth.logout")}
        </button>
      </div>

      {(user?.email || username) && (
        <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-5">
          <h2 className="text-lg font-semibold text-gray-900">{t("account.profile")}</h2>
          <dl className="mt-3 divide-y divide-gray-100">
            <div className="flex justify-between py-2.5 text-sm">
              <dt className="text-gray-500">{t("auth.username")}</dt>
              <dd className="font-medium text-gray-800">{user?.username ?? username}</dd>
            </div>
            {user?.email && (
              <div className="flex justify-between py-2.5 text-sm">
                <dt className="text-gray-500">{t("auth.email")}</dt>
                <dd className="font-medium text-gray-800">{user.email}</dd>
              </div>
            )}
          </dl>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900">{t("account.orders")}</h2>
        <div className="mt-3 rounded-2xl border border-gray-100 bg-white p-5">
          {orders === null && !ordersError ? (
            <p className="text-sm text-gray-500">{t("common.loading")}</p>
          ) : ordersError ? (
            <p className="text-sm text-gray-500">{t("account.ordersError")}</p>
          ) : orders && orders.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {orders.map((order) => (
                <li key={order.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div>
                    <p className="font-semibold text-gray-900">{order.number}</p>
                    {order.created_at && <p className="text-xs text-gray-500">{order.created_at}</p>}
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {order.total_price ? `${order.total_price} ₽` : "—"}
                      </p>
                      {order.status && <p className="text-xs text-gray-500">{order.status}</p>}
                    </div>
                    {order.status !== "cancelled" && (
                      <button
                        type="button"
                        onClick={() => handleCancel(order.number)}
                        disabled={canceling === order.number}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900 disabled:opacity-50"
                      >
                        {canceling === order.number ? t("common.loading") : t("account.cancelOrder")}
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">{t("account.noOrders")}</p>
          )}
        </div>
      </section>
    </div>
  );
}