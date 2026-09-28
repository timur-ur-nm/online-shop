import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import burgerdots from '../../assets/icons/burger.png'
import { catalogCategories } from "../../data/db";
import { useCart } from "../../context/cart";

export default function SearchBar() {
  const { t } = useTranslation();
  const { openCart } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="hidden border-t border-gray-100 bg-white md:block">
      <div className="container mx-auto flex items-center gap-3 px-4 py-3 md:gap-8">
        <div ref={dropdownRef} className="relative shrink-0">
          <button
            type="button"
            aria-expanded={isDropdownOpen}
            onClick={() => setIsDropdownOpen((open) => !open)}
            className="flex items-center gap-2 rounded-2xl bg-[#0071E4] px-3 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#005bb5] md:px-4"
          >
            <img src={burgerdots} alt="burger" className="h-5 w-5 object-contain" />
            <span className="hidden md:inline">{t("header.catalogTitle")}</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`hidden h-4 w-4 transition-transform md:inline ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {isDropdownOpen && (
            <div className="absolute left-0 top-full z-50 mt-3 w-72 animate-fade-in-down origin-top-left overflow-hidden rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
              <p className="flex items-center gap-2 px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
                {t("header.catalogTitle")}
              </p>
              <div className="h-px bg-gray-100" />
              <div className="py-1">
                {catalogCategories.map(({ to, label }) => (
                  <Link
                    key={label}
                    to={to}
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-blue-50 hover:text-[#0071E4]"
                  >
                    {t(label)}
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-4 w-4 text-gray-300"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative min-w-0 flex-1">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="text"
            placeholder={t("header.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded border border-gray-300 py-3 pl-12 pr-4 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-[#0071E4]"
          />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            to="wishlist"
            aria-label={t("header.wishlist")}
            className="flex items-center gap-2 rounded bg-gray-100 px-3 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 md:px-4"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M12 21s-8-5.3-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.7-8 11-8 11Z" />
            </svg>
            <span className="hidden md:inline">{t("header.wishlist")}</span>
          </Link>
          <button
            type="button"
            onClick={openCart}
            aria-label={t("header.cart")}
            className="flex items-center gap-2 rounded bg-gray-100 px-3 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 md:px-4"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M3 4h2l2.5 12h11L21 8H6" />
              <circle cx="9" cy="20" r="1.5" />
              <circle cx="17" cy="20" r="1.5" />
            </svg>
            <span className="hidden md:inline">{t("header.cart")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}