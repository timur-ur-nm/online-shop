import { Link, Navigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { getProductById } from "../../data/db";
import { useCart } from "../../context/cart";
import BuyOneClickModal from "../../components/cart/BuyOneClickModal";

export default function ProductPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { addItem } = useCart();
  const [inCart, setInCart] = useState(false);
  const [liked, setLiked] = useState(false);
  const [buyModalOpen, setBuyModalOpen] = useState(false);

  const product = getProductById(id ?? "");

  if (!product) return <Navigate to=".." replace />;

  const handleAddToCart = () => {
    addItem(product);
    setInCart(true);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <nav className="mb-5 flex items-center gap-2 text-sm text-gray-500">
        <Link to=".." className="transition-colors hover:text-[#0071E4]">
          {t("common.home")}
        </Link>
        <span>/</span>
        <Link to="../catalog" className="transition-colors hover:text-[#0071E4]">
          {t("pages.catalog.title")}
        </Link>
        <span>/</span>
        <span className="truncate text-gray-800">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="flex items-center justify-center rounded-2xl border border-gray-100 bg-gray-50 p-8">
          <img src={product.image} alt={product.name} className="max-h-[400px] w-auto object-contain" />
        </div>

        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>

          <div className="mt-3 flex items-center gap-3">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-[#0071E4]">
                  <path d="m12 2 2.9 6.2 6.6.8-4.9 4.6 1.3 6.6L12 17l-5.9 3.2 1.3-6.6L2.5 9l6.6-.8L12 2Z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-gray-500">
              {product.ratingCount} {t("pages.productCard.ratings")}
            </span>
          </div>

          {product.inStock ? (
            <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-green-600">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <circle cx="12" cy="12" r="9" className="opacity-25" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {t("pages.productCard.inStock")}
            </p>
          ) : (
            <p className="mt-3 text-sm font-medium text-red-500">{t("pages.productCard.outOfStock")}</p>
          )}

          <div className="mt-5 flex items-end gap-3">
            <span className="text-[32px] font-bold text-gray-900">{product.price} ₽</span>
            {product.oldPrice !== undefined && product.oldPrice > product.price && (
              <span className="pb-1 text-xl text-gray-400 line-through">{product.oldPrice} ₽</span>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex items-center justify-center gap-2 rounded-lg bg-[#0071E4] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#005bb5]"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path d="M3 4h2l2.5 12h11L21 8H6" />
                <circle cx="9" cy="20" r="1.5" />
                <circle cx="17" cy="20" r="1.5" />
              </svg>
              {t(inCart ? "pages.productCard.inCart" : "pages.productCard.addToCart")}
            </button>
            <button
              type="button"
              onClick={() => setBuyModalOpen(true)}
              className="rounded-lg border border-[#0071E4] px-6 py-3 text-sm font-semibold text-[#0071E4] transition-colors hover:bg-[#0071E4] hover:text-white"
            >
              {t("pages.productCard.buyOneClick")}
            </button>
            <button
              type="button"
              aria-label={t("header.wishlist")}
              onClick={() => setLiked((v) => !v)}
              className={`flex h-12 w-12 items-center justify-center justify-self-center rounded-lg border transition-colors ${
                liked ? "border-[#0071E4] bg-[#0071E4] text-white" : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              <svg viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M12 21s-8-5.3-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.7-8 11-8 11Z" />
              </svg>
            </button>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900">{t("pages.product.characteristics")}</h2>
            <dl className="mt-3 divide-y divide-gray-100 border-t border-b border-gray-100">
              <div className="flex justify-between py-2.5 text-sm">
                <dt className="text-gray-500">{t("pages.product.specs.model")}</dt>
                <dd className="font-medium text-gray-800">{product.name}</dd>
              </div>
              <div className="flex justify-between py-2.5 text-sm">
                <dt className="text-gray-500">{t("pages.product.specs.price")}</dt>
                <dd className="font-medium text-gray-800">{product.price} ₽</dd>
              </div>
              <div className="flex justify-between py-2.5 text-sm">
                <dt className="text-gray-500">{t("pages.product.specs.availability")}</dt>
                <dd className="font-medium text-green-600">
                  {t(product.inStock ? "pages.productCard.inStock" : "pages.productCard.outOfStock")}
                </dd>
              </div>
              <div className="flex justify-between py-2.5 text-sm">
                <dt className="text-gray-500">{t("pages.product.specs.warranty")}</dt>
                <dd className="font-medium text-gray-800">{t("pages.product.warranty")}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold text-gray-900">{t("pages.product.description")}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-600">
          {t("pages.product.descText")}
        </p>
      </div>

      <BuyOneClickModal
        product={product}
        isOpen={buyModalOpen}
        onClose={() => setBuyModalOpen(false)}
      />
    </div>
  );
}