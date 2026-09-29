import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useCart } from "../../context/cart";
import { useAuth } from "../../context/auth";
import CheckoutModal from "./CheckoutModal";

export default function CartModal() {
  const { t } = useTranslation();
  const { lang } = useParams();
  const navigate = useNavigate();
  const { items, isOpen, closeCart, removeItem, clear, total, count } = useCart();
  const { isAuthenticated } = useAuth();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  if (!isOpen) return null;

  const goToCatalog = () => {
    closeCart();
    navigate(`/${lang}/catalog`);
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      closeCart();
      navigate(`/${lang}/login`);
      return;
    }
    setCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center md:p-6">
      <div className="absolute inset-0 animate-fade-in bg-black/50" onClick={closeCart} />
      <div className="relative flex h-[75dvh] max-h-full w-full max-w-full flex-col animate-fade-in-up bg-white shadow-2xl md:h-[500px] md:w-[700px] md:overflow-hidden md:rounded-2xl">
        <header className="flex shrink-0 items-center justify-between border-b border-gray-100 px-3 py-2.5 md:px-6 md:py-3">
          <div className="flex items-center gap-2 md:gap-3">
            <h2 className="text-base font-semibold md:text-xl">{t("pages.cart.title")}</h2>
            {count > 0 && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 md:px-2.5 md:text-sm">
                {count}
              </span>
            )}
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={closeCart}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 md:h-9 md:w-9"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 md:h-24 md:w-24">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8 text-gray-400 md:h-12 md:w-12">
                <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13 5.4 5M7 13l-2.3 4.6a1 1 0 0 0 .9 1.4h12.3a1 1 0 0 0 .9-1l.8-5" />
                <circle cx="10" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 md:text-xl">{t("pages.cart.emptyTitle")}</h3>
            <p className="max-w-sm text-sm text-gray-500">{t("pages.cart.emptyText")}</p>
            <button
              type="button"
              onClick={goToCatalog}
              className="mt-1 rounded-lg bg-[#0071E4] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#005bb5] md:mt-2 md:px-6 md:py-3"
            >
              {t("pages.cart.goCatalog")}
            </button>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 scrollbar-thin md:px-6 md:py-4">
              <ul className="flex flex-col gap-2.5 md:gap-4">
                {items.map(({ product, quantity }) => (
                  <li key={product.id} className="flex items-center gap-3 rounded-lg border border-gray-100 p-2.5 md:gap-4 md:p-3">
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-14 w-14 shrink-0 object-contain md:h-20 md:w-20"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="line-clamp-2 text-sm font-medium text-gray-900">{product.name}</h4>
                      <p className="mt-1 text-xs text-gray-500 md:text-sm">{product.price} ₽ × {quantity}</p>
                      <p className="mt-0.5 text-sm font-semibold text-gray-900 md:mt-1">
                        {product.price * quantity} ₽
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label="Remove"
                      onClick={() => removeItem(product.id)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-500 md:h-9 md:w-9"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 md:h-5 md:w-5">
                        <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <footer className="shrink-0 border-t border-gray-100 px-3 py-3 md:px-6 md:py-4">
              <div className="flex items-center justify-between gap-3 md:gap-4">
                <div>
                  <p className="text-xs text-gray-500 md:text-sm">{t("pages.cart.total")}</p>
                  <p className="text-xl font-bold text-gray-900 md:text-2xl">{total} ₽</p>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2">
                  <button
                    type="button"
                    onClick={clear}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 md:px-4 md:py-3"
                  >
                    {t("pages.cart.clear")}
                  </button>
                  <button
                    type="button"
                    onClick={handleCheckout}
                    className="rounded-lg bg-[#0071E4] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#005bb5] md:px-6 md:py-3"
                  >
                    {t("pages.cart.checkout")}
                  </button>
                </div>
              </div>
            </footer>
          </div>
        )}
      </div>
      <CheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
    </div>
  );
}