import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import burgerdots from '../../assets/burgerdots.png'
const dropdownItems = [
  { to: "catalog?category=smartphones", label: "categories.smartphones" },
  { to: "catalog?category=tablets", label: "categories.tablets" },
  { to: "catalog?category=computers", label: "categories.computers" },
  { to: "catalog?category=watches", label: "categories.watches" },
  { to: "catalog?category=accessories", label: "categories.accessories" },
];

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
      <div className="container mx-auto flex items-center gap-8 px-4 py-3">
        <div ref={dropdownRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setIsDropdownOpen((open) => !open)}
            className="flex items-center gap-2 rounded-2xl bg-[#0071E4] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#005bb5]"
          >
            <img src={burgerdots} alt="burger" className="w-1/6"/>
            {t("header.catalogTitle")}
          </button>

          {isDropdownOpen && (
            <div className="absolute left-0 top-full z-50 mt-2 w-64 overflow-hidden rounded border border-gray-200 bg-white shadow-lg">
              <p className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
                {t("header.catalogTitle")}
              </p>
              {dropdownItems.map(({ to, label }) => (
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

        <div className="relative flex-1">
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
            className="flex items-center gap-2 rounded bg-gray-100 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M12 21s-8-5.3-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.7-8 11-8 11Z" />
            </svg>
            {t("header.wishlist")}
          </Link>
          <Link
            to="catalog"
            className="flex items-center gap-2 rounded bg-gray-100 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M3 4h2l2.5 12h11L21 8H6" />
              <circle cx="9" cy="20" r="1.5" />
              <circle cx="17" cy="20" r="1.5" />
            </svg>
            {t("header.cart")}
          </Link>
        </div>
      </div>
    </div>
  );
}