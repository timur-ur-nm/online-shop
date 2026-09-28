import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, NavLink, useLocation, useParams } from "react-router-dom";
import { categories } from "../../data/db";
import { useCart } from "../../context/cart";

export default function BottomNavBar() {
  const { t } = useTranslation();
  const { lang } = useParams();
  const [catalogOpen, setCatalogOpen] = useState(false);
  const { openCart, isOpen: cartOpen } = useCart();
  const location = useLocation();

  const items = [
    {
      label: t("header.catalogTitle"),
      to: "catalog",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
    },
    {
      label: t("header.cart"),
      to: "cart",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
          <path d="M3 4h2l2.5 12h11L21 8H6" />
          <circle cx="9" cy="20" r="1.5" />
          <circle cx="17" cy="20" r="1.5" />
        </svg>
      ),
    },
    {
      label: t("header.wishlist"),
      to: "wishlist",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
          <path d="M12 21s-8-5.3-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.7-8 11-8 11Z" />
        </svg>
      ),
    },
    {
      label: t("header.compare"),
      to: "compare",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
          <path d="M3 7h18M6 12h12M10 17h4" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {catalogOpen && (
        <div className="fixed inset-x-0 bottom-14 top-0 z-50 animate-fade-in-down overflow-y-auto bg-white pb-6 scrollbar-thin md:hidden">
            <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
              <p className="text-base font-semibold">{t("header.catalogTitle")}</p>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setCatalogOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col divide-y divide-gray-100 px-4 py-2">
              {categories.map(({ key, label, icon }) => (
                <Link
                  key={key}
                  to={`/${lang}/catalog?category=${key}`}
                  onClick={() => setCatalogOpen(false)}
                  className="flex items-center gap-2 py-3 text-[15px] font-semibold text-gray-900"
                >
                  <img src={icon} alt={t(label)} className="h-5 w-5 object-contain" />
                  {t(label)}
                </Link>
              ))}
            </div>
        </div>
      )}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
        <div className="grid grid-cols-4">
          {items.map(({ label, to, icon }, index) => {
            if (index === 0) {
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setCatalogOpen((open) => !open)}
                  className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                    catalogOpen || location.pathname.endsWith("/catalog")
                      ? "text-[#0071E4]"
                      : "text-gray-600"
                  }`}
                >
                  {icon}
                  {label}
                </button>
              );
            }
            if (index === 1) {
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    setCatalogOpen(false);
                    openCart();
                  }}
                  className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                    cartOpen ? "text-[#0071E4]" : "text-gray-600"
                  }`}
                >
                  {icon}
                  {label}
                </button>
              );
            }
            return (
              <NavLink
                key={label}
                to={to}
                onClick={() => setCatalogOpen(false)}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                    isActive ? "text-[#0071E4]" : "text-gray-600"
                  }`
                }
              >
                {icon}
                {label}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}