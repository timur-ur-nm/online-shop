import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import burgerdots from '../../assets/icons/burger.png'
import { categories } from "../../data/db";
import { useCart } from "../../context/cart";
import SearchResultsPanel from "../search/SearchResultsPanel";

interface ItemGroup {
  group: string;
  items: string[];
}

export default function SearchBar() {
  const { t } = useTranslation();
  const { lang } = useParams();
  const { openCart } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeGroup, setActiveGroup] = useState<Record<string, number>>({});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
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
            <div className="absolute left-0 top-full z-50 mt-3 w-80 animate-fade-in-down origin-top-left rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
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
                {categories.map(({ key, label, icon }) => {
                  const to = `/${lang}/catalog?category=${key}`;
                  const groups = t(`products.items.${key}`, { returnObjects: true }) as ItemGroup[];
                  const current = groups.length > 0 ? Math.min(activeGroup[key] ?? 0, groups.length - 1) : 0;
                  const currentGroup = groups.length > 0 ? groups[current] : null;
                  return (
                    <div key={key} className="group relative">
                      <Link
                        to={to}
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm text-gray-700 transition-colors group-hover:bg-blue-50 group-hover:text-[#0071E4]"
                      >
                        <span className="flex items-center gap-2">
                          <img src={icon} alt={t(label)} className="h-5 w-5 object-contain" />
                          {t(label)}
                        </span>
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

                      <div className="pointer-events-none absolute left-full top-0 z-[60] hidden w-[460px] max-w-[calc(100vw-360px)] rounded-md border border-gray-100 bg-white opacity-0 shadow-xl transition-opacity duration-150 group-hover:pointer-events-auto group-hover:flex group-hover:opacity-100">
                        <div className="flex w-full">
                          <div className="w-48 shrink-0 border-r border-gray-100 p-2">
                            {groups.map((group, i) => (
                              <button
                                key={group.group}
                                type="button"
                                onMouseEnter={() => setActiveGroup((prev) => ({ ...prev, [key]: i }))}
                                className={`flex w-full items-center justify-between gap-2 rounded px-3 py-2 text-left text-sm transition-colors ${
                                  i === current
                                    ? "bg-blue-50 font-medium text-[#0071E4]"
                                    : "text-gray-700 hover:bg-gray-50 hover:text-[#0071E4]"
                                }`}
                              >
                                {group.group}
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  className={`h-4 w-4 shrink-0 ${
                                    i === current ? "text-[#0071E4]" : "text-gray-300"
                                  }`}
                                >
                                  <path d="m9 18 6-6-6-6" />
                                </svg>
                              </button>
                            ))}
                          </div>
                          <div className="scrollbar-thin max-h-[300px] min-h-0 flex-1 overflow-y-auto p-2">
                            {currentGroup && (
                              <>
                                <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                  {currentGroup.group}
                                </p>
                                <div className="h-px bg-gray-100" />
                                <div className="py-1">
                                  {currentGroup.items.map((item) => (
                                    <Link
                                      key={item}
                                      to={to}
                                      onClick={() => setIsDropdownOpen(false)}
                                      className="block rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-blue-50 hover:text-[#0071E4]"
                                    >
                                      {item}
                                    </Link>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div ref={searchRef} className="relative min-w-0 flex-1">
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
            onFocus={() => setIsSearchFocused(true)}
            className="w-full rounded border border-gray-300 py-3 pl-12 pr-4 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-[#0071E4]"
          />
          {isSearchFocused && (
            <div className="absolute inset-x-0 top-full z-50 mt-2">
              <SearchResultsPanel query={searchQuery} onNavigate={() => setIsSearchFocused(false)} />
            </div>
          )}
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