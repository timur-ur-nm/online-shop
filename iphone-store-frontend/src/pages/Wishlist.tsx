import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import ProductCard from "./Home/ProductCard";
import { useWishlist } from "../context/wishlist";
import { useProducts } from "../context/products";

export default function Wishlist() {
  const { t } = useTranslation();
  const { lang } = useParams();
  const { ids, clear } = useWishlist();
  const { products, loading } = useProducts();

  const wishlistProducts = products.filter((p) => ids.includes(p.id));

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">{t("pages.wishlist.title")}</h1>
        {wishlistProducts.length > 0 && (
          <button
            type="button"
            onClick={clear}
            className="text-sm font-medium text-gray-500 transition-colors hover:text-red-500"
          >
            {t("pages.wishlist.clear")}
          </button>
        )}
      </div>

      {loading ? (
        <p className="py-16 text-center text-sm text-gray-500">{t("common.loading")}</p>
      ) : wishlistProducts.length > 0 ? (
        <>
          <p className="mt-2 text-sm text-gray-500">{t("pages.wishlist.count", { count: wishlistProducts.length })}</p>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {wishlistProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center py-16 text-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-14 w-14 text-gray-300">
            <path d="M12 21s-8-5.3-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.7-8 11-8 11Z" />
          </svg>
          <p className="mt-4 text-[22px] font-semibold text-gray-800">{t("pages.wishlist.emptyTitle")}</p>
          <p className="mt-2 max-w-md text-sm text-gray-500">{t("pages.wishlist.emptyText")}</p>
          <Link
            to={`/${lang}/catalog`}
            className="mt-6 rounded-lg bg-[#0071E4] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#005bb5]"
          >
            {t("pages.wishlist.goCatalog")}
          </Link>
        </div>
      )}
    </div>
  );
}