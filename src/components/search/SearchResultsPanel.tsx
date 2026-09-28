import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { getProducts } from "../../data/db";
import { useRecentlyViewed } from "../../context/recentlyViewed";

interface SearchResultsPanelProps {
  query: string;
  onNavigate: () => void;
}

export default function SearchResultsPanel({ query, onNavigate }: SearchResultsPanelProps) {
  const { t } = useTranslation();
  const { lang } = useParams();
  const { products: recentlyViewed } = useRecentlyViewed();

  const normalized = query.trim().toLowerCase();
  const products = normalized
    ? getProducts().filter((p) => p.name.toLowerCase().includes(normalized))
    : getProducts();

  const showRecently = !normalized && recentlyViewed.length > 0;
  const showProducts = products.length > 0;

  const row = (id: string, name: string, image: string, price: number) => (
    <Link
      key={id}
      to={`/${lang}/catalog`}
      onClick={onNavigate}
      className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-gray-50"
    >
      <img src={image} alt={name} className="h-10 w-10 shrink-0 object-contain" />
      <span className="min-w-0 flex-1 truncate text-sm text-gray-700">{name}</span>
      <span className="shrink-0 text-sm font-semibold text-gray-900">{price} ₽</span>
    </Link>
  );

  return (
    <div className="animate-fade-in-down overflow-hidden rounded-lg border border-gray-100 bg-white shadow-lg">
      <div className="scrollbar-thin max-h-[400px] overflow-y-auto py-2">
        {showRecently && (
          <>
            <p className="px-4 pb-1 pt-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
              {t("header.recentlyViewed")}
            </p>
            <div className="px-2">{recentlyViewed.map((p) => row(p.id, p.name, p.image ?? "", p.price))}</div>
          </>
        )}
        {showProducts && (
          <>
            {showRecently && <div className="mx-4 my-2 h-px bg-gray-100" />}
            <p className="px-4 pb-1 pt-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
              {t("header.products")}
            </p>
            <div className="px-2">{products.map((p) => row(p.id, p.name, p.image ?? "", p.price))}</div>
          </>
        )}
        {!showProducts && !showRecently && (
          <p className="px-4 py-6 text-center text-sm text-gray-500">{t("header.noResults")}</p>
        )}
      </div>
    </div>
  );
}