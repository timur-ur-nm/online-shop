import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import type { Product } from "../../data/db";
import { useCart } from "../../context/cart";
import { useRecentlyViewed } from "../../context/recentlyViewed";
import { useWishlist } from "../../context/wishlist";
import { useCompare } from "../../context/compare";
import BuyOneClickModal from "../../components/cart/BuyOneClickModal";
import WantCheaperModal from "../../components/feedback/WantCheaperModal";

export type { Product };

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { t } = useTranslation();
  const { lang } = useParams();
  const { items, addItem, removeItem, updateQuantity } = useCart();
  const { track } = useRecentlyViewed();
  const { has: hasInWishlist, toggle: toggleWishlist } = useWishlist();
  const { has: hasInCompare, toggle: toggleCompare, isFull: compareFull } = useCompare();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [copied, setCopied] = useState(false);
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [cheaperModalOpen, setCheaperModalOpen] = useState(false);

  const liked = hasInWishlist(product.id);
  const inCompare = hasInCompare(product.id);

  useEffect(() => {
    track(product);
  }, [product, track]);

  const activeStars = hovered || rating;
  const hasDiscount = product.oldPrice !== undefined && product.oldPrice > product.price;
  const cartItem = items.find((item) => item.product.id === product.id);
  const cartQuantity = cartItem?.quantity ?? 0;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <article className="flex flex-col rounded-lg border border-gray-100 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => {
              const star = i + 1;
              return (
                <button
                  key={star}
                  type="button"
                  aria-label={`Rate ${star} out of 5`}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setRating(star)}
                  className="p-0.5"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill={star <= activeStars ? "#F59E0B" : "none"}
                    stroke={star <= activeStars ? "#F59E0B" : "#D1D5DB"}
                    strokeWidth="1.5"
                    className="h-4 w-4"
                  >
                    <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                </button>
              );
            })}
          </div>
          <span className="text-sm text-gray-500">
            {product.ratingCount ?? 0} {t("pages.productCard.ratings")}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={t("header.wishlist")}
            onClick={() => toggleWishlist(product.id)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-500"
          >
            <svg
              viewBox="0 0 24 24"
              fill={liked ? "#EF4444" : "none"}
              stroke={liked ? "#EF4444" : "currentColor"}
              strokeWidth="1.5"
              className="h-5 w-5"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </button>
          <button
            type="button"
            aria-label={t("header.compare")}
            title={inCompare ? undefined : (compareFull ? t("pages.compare.limitReached") : t("header.compare"))}
            onClick={() => toggleCompare(product.id)}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
              inCompare
                ? "bg-[#0071E4] text-white"
                : "text-gray-400 hover:bg-gray-100 hover:text-[#0071E4]"
            } ${compareFull && !inCompare ? "opacity-40" : ""}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
              <path d="M4 6h16M6 12h12M9 18h6" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Copy link"
            onClick={copyLink}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#0071E4]"
          >
            {copied ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0071E4"
                strokeWidth="2"
                className="h-5 w-5"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-5 w-5"
              >
                <path d="M13.5 10.5 21 3m-6 0h6v6M8.5 13.5 3 21m6 0H3v-6" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <Link
        to={`/${lang}/product/${product.slug ?? product.id}`}
        className="mt-3 line-clamp-2 min-h-10 text-base font-semibold text-gray-900 transition-colors hover:text-[#0071E4]"
      >
        {product.name}
      </Link>

      {product.image && (
        <Link
          to={`/${lang}/product/${product.slug ?? product.id}`}
          aria-label={product.name}
        >
          <img
            src={product.image}
            alt={product.name}
            className="my-3 h-44 w-full object-contain"
          />
        </Link>
      )}

      <div className="flex items-center gap-1.5">
        <span
          className={`h-2 w-2 shrink-0 rounded-full ${product.inStock ? "bg-green-500" : "bg-red-500"}`}
        />
        <span className="text-sm text-gray-600">
          {product.inStock ? t("pages.productCard.inStock") : t("pages.productCard.outOfStock")}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap items-baseline gap-2">
        {hasDiscount && (
          <span className="text-sm text-gray-400 line-through">{product.oldPrice} ₽</span>
        )}
        <span className="text-[32px] font-bold leading-none text-gray-900">
          {product.price} ₽
        </span>
      </div>

      {cartQuantity > 0 ? (
        <div className="mt-4 flex w-full items-center justify-between rounded-lg border border-[#0071E4]">
          <button
            type="button"
            aria-label={t("pages.productCard.decrease")}
            onClick={() =>
              cartQuantity === 1
                ? removeItem(product.id)
                : updateQuantity(product.id, cartQuantity - 1)
            }
            className="flex h-11 w-12 items-center justify-center text-2xl font-semibold text-[#0071E4] transition-colors hover:bg-blue-50"
          >
            −
          </button>
          <span className="text-base font-semibold text-gray-900">{cartQuantity}</span>
          <button
            type="button"
            aria-label={t("pages.productCard.increase")}
            onClick={() => updateQuantity(product.id, cartQuantity + 1)}
            className="flex h-11 w-12 items-center justify-center text-2xl font-semibold text-[#0071E4] transition-colors hover:bg-blue-50"
          >
            +
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => addItem(product)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#0071E4] py-3 text-base font-semibold text-white transition-colors hover:bg-[#005bb5]"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-5 w-5"
          >
            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13 5.4 5M7 13l-2.3 4.6a1 1 0 0 0 .9 1.4h12.3a1 1 0 0 0 .9-1l.8-5" />
            <circle cx="10" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
          </svg>
          {t("pages.productCard.addToCart")}
        </button>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
        <button
          type="button"
          onClick={() => setCheaperModalOpen(true)}
          className="text-gray-600 transition-colors hover:text-[#0071E4]"
        >
          {t("pages.productCard.wantCheaper")}
        </button>
        <button
          type="button"
          aria-pressed={inCompare}
          disabled={compareFull && !inCompare}
          onClick={() => toggleCompare(product.id)}
          className={`flex items-center gap-1 font-medium transition-colors ${
            inCompare
              ? "text-[#0071E4]"
              : "text-gray-600 hover:text-[#0071E4]"
          } ${compareFull && !inCompare ? "opacity-40" : ""}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
            <path d="M4 6h16M6 12h12M9 18h6" />
          </svg>
          {t(inCompare ? "pages.compare.inCompare" : "pages.compare.addToCompare")}
        </button>
        <button
          type="button"
          onClick={() => setBuyModalOpen(true)}
          className="text-gray-600 transition-colors hover:text-[#0071E4]"
        >
          {t("pages.productCard.buyOneClick")}
        </button>
      </div>

      <BuyOneClickModal
        product={product}
        isOpen={buyModalOpen}
        onClose={() => setBuyModalOpen(false)}
      />
      <WantCheaperModal
        product={product}
        isOpen={cheaperModalOpen}
        onClose={() => setCheaperModalOpen(false)}
      />
    </article>
  );
}