import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import burgerdots from '../../assets/icons/burger.png'
import { catalogCategories } from "../../data/db";

export default function SearchBar() {
  const { t } = useTranslation();
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

  const handleCategoryClick = () => {
    setIsDropdownOpen(false);
  };

  return (
    <div className="border-t border-gray-100 bg-white">
      <div className="container mx-auto flex items-center gap-3 px-4 py-3 md:gap-8">
        <div ref={dropdownRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setIsDropdownOpen((open) => !open)}
            className="flex items-center gap-2 rounded-2xl bg-[#0071E4] px-3 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#005bb5] md:px-4"
          >
            <img src={burgerdots} alt="burger" className="h-5 w-5 object-contain" />
            <span className="hidden md:inline">{t("header.catalogTitle")}</span>
          </button>

          {isDropdownOpen && (
            <div className="absolute left-0 top-full z-50 mt-2 w-64 overflow-hidden rounded border border-gray-200 bg-white shadow-lg">
              <p className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
                {t("header.catalogTitle")}
              </p>
              {catalogCategories.map(({ to, label }) => (
                <Link
                  key={label}
                  to={to}
                  onClick={handleCategoryClick}
                  className="block px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 hover:text-[#0071E4]"
                >
                  {t(label)}
                </Link>
              ))}
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
            to="catalog"
            aria-label={t("header.wishlist")}
            className="flex items-center gap-2 rounded bg-gray-100 px-3 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 md:px-4"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M12 21s-8-5.3-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.7-8 11-8 11Z" />
            </svg>
            <span className="hidden md:inline">{t("header.wishlist")}</span>
          </Link>
          <Link
            to="catalog"
            aria-label={t("header.cart")}
            className="flex items-center gap-2 rounded bg-gray-100 px-3 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 md:px-4"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M3 4h2l2.5 12h11L21 8H6" />
              <circle cx="9" cy="20" r="1.5" />
              <circle cx="17" cy="20" r="1.5" />
            </svg>
            <span className="hidden md:inline">{t("header.cart")}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}