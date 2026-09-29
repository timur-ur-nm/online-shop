import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import burgerdots from '../../assets/icons/burger.png'
import { categoryMeta } from "../../data/db";
import { categoryImage } from "../../api/client";
import { useCart } from "../../context/cart";
import { useProducts } from "../../context/products";
import { useWishlist } from "../../context/wishlist";
import { useCompare } from "../../context/compare";
import { computeCategoryCounts } from "../../utils/categories";
import SearchResultsPanel from "../search/SearchResultsPanel";

export default function SearchBar() {
  const { t } = useTranslation();
  const { lang } = useParams();
  const { openCart, count: cartCount } = useCart();
  const { products, categoryTree } = useProducts();
  const { count: wishlistCount } = useWishlist();
  const { count: compareCount } = useCompare();
  const categoryCounts = useMemo(
    () => computeCategoryCounts(categoryTree, products),
    [categoryTree, products]
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
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
                {categoryTree.map((cat) => {
                  const meta = categoryMeta[cat.slug];
                  const label = meta ? t(`products.${meta.groupKey}`) : cat.name;
                  const icon = cat.image ?? categoryImage(cat.slug) ?? meta?.icon;
                  const rootLink = `/${lang}/catalog?category=${cat.slug}`;
                  return (
                    <div key={cat.slug} className="group relative">
                      <Link
                        to={rootLink}
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm text-gray-700 transition-colors group-hover:bg-blue-50 group-hover:text-[#0071E4]"
                      >
                        <span className="flex items-center gap-2">
                          {icon && <img src={icon} alt={label} className="h-5 w-5 object-contain" />}
                          {label}
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

                      <div className="pointer-events-none absolute left-full top-0 z-[60] hidden w-[340px] rounded-md border border-gray-100 bg-white p-2 opacity-0 shadow-xl transition-opacity duration-150 group-hover:pointer-events-auto group-hover:block group-hover:opacity-100">
                        <Link
                          to={rootLink}
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center justify-between px-3 py-2 text-sm font-semibold text-[#0071E4] transition-colors hover:bg-blue-50 hover:text-[#005bb5]"
                        >
                          {t("header.allProducts")}
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                            <path d="m9 18 6-6-6-6" />
                          </svg>
                        </Link>
                        <div className="h-px bg-gray-100" />
                        <div className="scrollbar-thin max-h-[300px] overflow-y-auto py-1">
                          {cat.children.length > 0 ? (
                            cat.children.map((child) => {
                              const childMeta = categoryMeta[child.slug];
                              const childLabel = childMeta ? t(`products.${childMeta.groupKey}`) : child.name;
                              const childIcon = child.image ?? categoryImage(child.slug) ?? childMeta?.icon;
                              return (
                                <Link
                                  key={child.slug}
                                  to={`/${lang}/catalog?category=${child.slug}`}
                                  onClick={() => setIsDropdownOpen(false)}
                                  className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-blue-50 hover:text-[#0071E4]"
                                >
                                  <span className="flex min-w-0 items-center gap-2">
                                    {childIcon && <img src={childIcon} alt={childLabel} className="h-5 w-5 shrink-0 object-contain" />}
                                    <span className="truncate">{childLabel}</span>
                                  </span>
                                  {(() => {
                                    const count = categoryCounts.get(child.slug) ?? 0;
                                    return count > 0 ? (
                                      <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                                        {count}
                                      </span>
                                    ) : null;
                                  })()}
                                </Link>
                              );
                            })
                          ) : (
                            <p className="px-3 py-2 text-sm text-gray-400">{t("header.noSubcategories")}</p>
                          )}
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
            to="account"
            aria-label={t("header.account")}
            className="flex items-center gap-2 rounded bg-gray-100 px-3 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 md:px-4"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5" />
            </svg>
            <span className="hidden md:inline">{t("header.account")}</span>
          </Link>
          <Link
            to="wishlist"
            aria-label={t("header.wishlist")}
            className="relative flex items-center gap-2 rounded bg-gray-100 px-3 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 md:px-4"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M12 21s-8-5.3-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.7-8 11-8 11Z" />
            </svg>
            <span className="hidden md:inline">{t("header.wishlist")}</span>
            {wishlistCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#0071E4] px-1 text-[10px] font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link
            to="compare"
            aria-label={t("header.compare")}
            className="relative flex items-center gap-2 rounded bg-gray-100 px-3 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 md:px-4"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M4 6h16M6 12h12M9 18h6" />
            </svg>
            <span className="hidden md:inline">{t("header.compare")}</span>
            {compareCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gray-800 px-1 text-[10px] font-bold text-white">
                {compareCount}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={openCart}
            aria-label={t("header.cart")}
            className="relative flex items-center gap-2 rounded bg-gray-100 px-3 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 md:px-4"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M3 4h2l2.5 12h11L21 8H6" />
              <circle cx="9" cy="20" r="1.5" />
              <circle cx="17" cy="20" r="1.5" />
            </svg>
            <span className="hidden md:inline">{t("header.cart")}</span>
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#0071E4] px-1 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}