import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import type { Product } from "../data/db";
import { expandCategorySlugs } from "../utils/categories";
import { useProducts } from "../context/products";
import ProductCard from "./Home/ProductCard";

type SortKey = "popular" | "priceAsc" | "priceDesc" | "nameAsc" | "discount";

const SORT_KEYS: SortKey[] = ["popular", "priceAsc", "priceDesc", "nameAsc", "discount"];

const CATEGORY_ALIASES: Record<string, string> = {
  smartphones: "iphone",
  tablets: "ipad",
  computers: "macbook",
  watches: "apple-watch",
  watch: "apple-watch",
  appleWatch: "apple-watch",
};

function sortProducts(list: Product[], sort: SortKey): Product[] {
  const copy = [...list];
  switch (sort) {
    case "priceAsc":
      return copy.sort((a, b) => a.price - b.price);
    case "priceDesc":
      return copy.sort((a, b) => b.price - a.price);
    case "nameAsc":
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case "discount":
      return copy.sort((a, b) => {
        const da = a.oldPrice && a.oldPrice > a.price ? (a.oldPrice - a.price) / a.oldPrice : 0;
        const db = b.oldPrice && b.oldPrice > b.price ? (b.oldPrice - b.price) / b.oldPrice : 0;
        return db - da;
      });
    default:
      return copy.sort((a, b) => (b.ratingCount ?? 0) - (a.ratingCount ?? 0));
  }
}

interface FiltersProps {
  sort: SortKey;
  onSortChange: (v: SortKey) => void;
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (v: string) => void;
  onMaxPriceChange: (v: string) => void;
  inStockOnly: boolean;
  onInStockOnlyChange: (v: boolean) => void;
  onSaleOnly: boolean;
  onSaleOnlyChange: (v: boolean) => void;
  colors: string[];
  color: string | null;
  onColorChange: (v: string | null) => void;
  storages: number[];
  storage: number | null;
  onStorageChange: (v: number | null) => void;
  conditions: { value: string; label: string }[];
  condition: string | null;
  onConditionChange: (v: string | null) => void;
  onReset: () => void;
}

function FiltersSidebar({
  sort,
  onSortChange,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  inStockOnly,
  onInStockOnlyChange,
  onSaleOnly,
  onSaleOnlyChange,
  colors,
  color,
  onColorChange,
  storages,
  storage,
  onStorageChange,
  conditions,
  condition,
  onConditionChange,
  onReset,
}: FiltersProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-800">
          {t("pages.catalog.sort")}
        </h3>
        <div className="flex flex-col gap-1.5">
          {SORT_KEYS.map((key) => (
            <label key={key} className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
              <input
                type="radio"
                name="sort"
                checked={sort === key}
                onChange={() => onSortChange(key)}
                className="h-4 w-4 accent-[#0071E4]"
              />
              {t(`pages.catalog.sortBy.${key}`)}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-800">
          {t("pages.catalog.price")}
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            placeholder={t("pages.catalog.from")}
            value={minPrice}
            onChange={(e) => onMinPriceChange(e.target.value)}
            className="w-full rounded border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-[#0071E4]"
          />
          <span className="text-gray-400">—</span>
          <input
            type="number"
            min="0"
            placeholder={t("pages.catalog.to")}
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
            className="w-full rounded border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-[#0071E4]"
          />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-800">
          {t("pages.catalog.availability")}
        </h3>
        <div className="flex flex-col gap-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => onInStockOnlyChange(e.target.checked)}
              className="h-4 w-4 accent-[#0071E4]"
            />
            {t("pages.catalog.inStockOnly")}
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={onSaleOnly}
              onChange={(e) => onSaleOnlyChange(e.target.checked)}
              className="h-4 w-4 accent-[#0071E4]"
            />
            {t("pages.catalog.discountOnly")}
          </label>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-800">
          {t("pages.catalog.condition")}
        </h3>
        <div className="flex flex-col gap-1.5">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
            <input
              type="radio"
              name="condition"
              checked={condition === null}
              onChange={() => onConditionChange(null)}
              className="h-4 w-4 accent-[#0071E4]"
            />
            {t("pages.catalog.allConditions")}
          </label>
          {conditions.map((c) => (
            <label key={c.value} className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
              <input
                type="radio"
                name="condition"
                checked={condition === c.value}
                onChange={() => onConditionChange(c.value)}
                className="h-4 w-4 accent-[#0071E4]"
              />
              {c.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-800">
          {t("pages.catalog.color")}
        </h3>
        <div className="flex flex-col gap-1.5">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
            <input
              type="radio"
              name="color"
              checked={color === null}
              onChange={() => onColorChange(null)}
              className="h-4 w-4 accent-[#0071E4]"
            />
            {t("pages.catalog.allColors")}
          </label>
          {colors.map((c) => (
            <label key={c} className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
              <input
                type="radio"
                name="color"
                checked={color === c}
                onChange={() => onColorChange(c)}
                className="h-4 w-4 accent-[#0071E4]"
              />
              {c}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-800">
          {t("pages.catalog.storage")}
        </h3>
        <div className="flex flex-col gap-1.5">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
            <input
              type="radio"
              name="storage"
              checked={storage === null}
              onChange={() => onStorageChange(null)}
              className="h-4 w-4 accent-[#0071E4]"
            />
            {t("pages.catalog.allStorages")}
          </label>
          {storages.map((s) => (
            <label key={s} className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
              <input
                type="radio"
                name="storage"
                checked={storage === s}
                onChange={() => onStorageChange(s)}
                className="h-4 w-4 accent-[#0071E4]"
              />
              {s} GB
            </label>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900"
      >
        {t("pages.catalog.reset")}
      </button>
    </div>
  );
}

export default function Catalog() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { products: allProducts, facets, categories: apiCategories, categoryTree, loading } = useProducts();
  const [sort, setSort] = useState<SortKey>("popular");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [color, setColor] = useState<string | null>(null);
  const [storage, setStorage] = useState<number | null>(null);
  const [condition, setCondition] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const categoryParam = useMemo(() => {
    const raw = searchParams.get("category") ?? "";
    const canonical = CATEGORY_ALIASES[raw] ?? raw;
    return apiCategories.some((c) => c.slug === canonical) ? canonical : "";
  }, [searchParams, apiCategories]);

  const expandedCategorySlugs = useMemo(() => {
    if (!categoryParam) return null;
    return expandCategorySlugs(categoryTree, categoryParam);
  }, [categoryParam, categoryTree]);

  const products = useMemo(() => {
    const min = minPrice ? Number(minPrice) : null;
    const max = maxPrice ? Number(maxPrice) : null;
    const filtered = allProducts.filter((p) => {
      if (categoryParam && (!expandedCategorySlugs || !p.category || !expandedCategorySlugs.has(p.category))) return false;
      if (inStockOnly && !p.inStock) return false;
      if (onSaleOnly && !(p.oldPrice !== undefined && p.oldPrice > p.price)) return false;
      if (min !== null && p.price < min) return false;
      if (max !== null && p.price > max) return false;
      if (color && p.color !== color) return false;
      if (storage !== null && p.storage !== storage) return false;
      if (condition && p.condition !== condition) return false;
      return true;
    });
    return sortProducts(filtered, sort);
  }, [sort, minPrice, maxPrice, inStockOnly, onSaleOnly, color, storage, condition, categoryParam, expandedCategorySlugs, allProducts]);

  const resetFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setInStockOnly(false);
    setOnSaleOnly(false);
    setColor(null);
    setStorage(null);
    setCondition(null);
  };

  const sidebar = (
    <FiltersSidebar
      sort={sort}
      onSortChange={setSort}
      minPrice={minPrice}
      maxPrice={maxPrice}
      onMinPriceChange={setMinPrice}
      onMaxPriceChange={setMaxPrice}
      inStockOnly={inStockOnly}
      onInStockOnlyChange={setInStockOnly}
      onSaleOnly={onSaleOnly}
      onSaleOnlyChange={setOnSaleOnly}
      colors={facets.colors}
      color={color}
      onColorChange={setColor}
      storages={facets.storages}
      storage={storage}
      onStorageChange={setStorage}
      conditions={facets.conditions}
      condition={condition}
      onConditionChange={setCondition}
      onReset={resetFilters}
    />
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900">{t("pages.catalog.title")}</h1>

      <button
        type="button"
        onClick={() => setFiltersOpen((open) => !open)}
        className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 md:hidden"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
          <path d="M4 6h16M7 12h10M10 18h4" />
        </svg>
        {t("pages.catalog.filters")}
        <span
          className={`transition-transform ${filtersOpen ? "rotate-180" : ""}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </button>

      {filtersOpen && (
        <div className="fixed inset-0 z-[70] md:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 animate-fade-in bg-black/50"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[85dvh] animate-slide-in-up flex-col rounded-t-2xl bg-white shadow-2xl">
            <header className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
              <h2 className="text-lg font-semibold">{t("pages.catalog.filtersTitle")}</h2>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setFiltersOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </header>
            <div className="scrollbar-thin flex-1 overflow-y-auto px-5 py-4">{sidebar}</div>
            <div className="border-t border-gray-100 p-4">
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="w-full rounded-lg bg-[#0071E4] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#005bb5]"
              >
                {t("pages.catalog.show")} ({products.length})
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 md:mt-6">
        <div className="flex gap-8">
          <aside className="hidden w-64 shrink-0 md:block">
            <div className="md:sticky md:top-20">{sidebar}</div>
          </aside>

          <div className="min-w-0 flex-1">
            {loading ? (
              <p className="py-16 text-center text-sm text-gray-500">{t("common.loading")}</p>
            ) : (
              <>
                <p className="mb-4 text-sm text-gray-500">
                  {t("pages.catalog.found", { count: products.length })}
                </p>

                {products.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <p className="text-[22px] font-semibold text-gray-800">
                      {categoryParam ? t("pages.catalog.noStock") : t("pages.catalog.empty")}
                    </p>
                    <p className="mt-2 text-sm text-gray-500">{t("pages.catalog.empty")}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}