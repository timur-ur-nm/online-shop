import { useState } from "react";
import { useTranslation } from "react-i18next";

export interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  ratingCount?: number;
  inStock?: boolean;
  image?: string;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inCart, setInCart] = useState(false);

  const activeStars = hovered || rating;
  const hasDiscount = product.oldPrice !== undefined && product.oldPrice > product.price;

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
            aria-label="Like"
            onClick={() => setLiked((prev) => !prev)}
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

      <h3 className="mt-3 line-clamp-2 min-h-10 text-2xl font-medium text-gray-900">
        {product.name}
      </h3>

      {product.image && (
        <img
          src={product.image}
          alt={product.name}
          className="my-3 w-full object-contain"
        />
      )}

      <div className="flex items-center gap-1.5">
        <span
          className={`h-2 w-2 rounded-full ${product.inStock ? "bg-green-500" : "bg-red-500"}`}
        />
        <span className="text-xl text-gray-600">
          {product.inStock ? t("pages.productCard.inStock") : t("pages.productCard.outOfStock")}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-baseline gap-2">
        {hasDiscount && (
          <span className="text-xl text-gray-400 line-through">{product.oldPrice} ₽</span>
        )}
        <span className={`font-bold text-gray-900 ${hasDiscount ? "text-3xl" : "text-2xl"}`}>
          {product.price} ₽
        </span>
      </div>

      <button
        type="button"
        onClick={() => setInCart((prev) => !prev)}
        className={`mt-4 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-xl font-semibold text-white transition-colors ${
          inCart ? "bg-green-500 hover:bg-green-600" : "bg-[#0071E4] hover:bg-[#005bb5]"
        }`}
      >
        {inCart ? (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
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
            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13 5.4 5M7 13l-2.3 4.6a1 1 0 0 0 .9 1.4h12.3a1 1 0 0 0 .9-1l.8-5" />
            <circle cx="10" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
          </svg>
        )}
        {t(inCart ? "pages.productCard.inCart" : "pages.productCard.addToCart")}
      </button>

      <div className="mt-3 flex items-center justify-between gap-2 text-sm">
        <button
          type="button"
          className="text-gray-600 transition-colors hover:text-[#0071E4]"
        >
          {t("pages.productCard.wantCheaper")}
        </button>
        <button
          type="button"
          className="text-gray-600 transition-colors hover:text-[#0071E4]"
        >
          {t("pages.productCard.buyOneClick")}
        </button>
      </div>
    </article>
  );
}