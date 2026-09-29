import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import type { Product } from "../../data/db";
import { sendFeedback } from "../../api/feedback";

interface WantCheaperModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export default function WantCheaperModal({ product, isOpen, onClose }: WantCheaperModalProps) {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!phone.trim()) return;
    setError(false);
    try {
      await sendFeedback({
        kind: "cheaper",
        phone: phone.trim(),
        product: Number(product.id),
      });
      setSubmitted(true);
    } catch {
      setError(true);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setPhone("");
    setError(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 animate-fade-in bg-black/50" onClick={handleClose} />
      <div className="relative flex w-full max-w-md animate-fade-in-up flex-col overflow-hidden bg-white shadow-2xl sm:rounded-2xl">
        <header className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
          <h2 className="text-lg font-semibold">{t("pages.wantCheaper.title")}</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </header>

        <div className="flex flex-col px-5 py-4">
          <div className="flex items-center gap-4">
            {product.image && (
              <img src={product.image} alt={product.name} className="h-20 w-20 shrink-0 object-contain" />
            )}
            <div className="min-w-0">
              <p className="text-base font-semibold text-gray-900">{product.name}</p>
              <p className="mt-1 text-xl font-bold text-gray-900">{product.price} ₽</p>
            </div>
          </div>

          {submitted ? (
            <div className="mt-6 flex flex-col items-center gap-2 py-6 text-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="#0071E4" strokeWidth="2" className="h-12 w-12">
                <circle cx="12" cy="12" r="10" />
                <path d="m8.5 12 2.5 2.5 5-5" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900">{t("pages.wantCheaper.successTitle")}</h3>
              <p className="max-w-xs text-sm text-gray-500">{t("pages.wantCheaper.successText")}</p>
              <button
                type="button"
                onClick={handleClose}
                className="mt-2 rounded-lg bg-[#0071E4] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#005bb5]"
              >
                {t("common.ok")}
              </button>
            </div>
          ) : (
            <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 flex flex-col gap-2">
              <label htmlFor="cheaper-phone" className="text-sm font-medium text-gray-700">
                {t("pages.wantCheaper.phoneLabel")}
              </label>
              <input
                id="cheaper-phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t("pages.wantCheaper.phonePlaceholder")}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-[#0071E4]"
              />
              <p className="text-xs text-gray-500">{t("pages.wantCheaper.subtitle")}</p>
              {error && (
                <p className="text-xs font-medium text-red-500">{t("pages.wantCheaper.error")}</p>
              )}
              <button
                type="submit"
                className="mt-2 rounded-lg bg-[#0071E4] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#005bb5]"
              >
                {t("pages.wantCheaper.submit")}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}