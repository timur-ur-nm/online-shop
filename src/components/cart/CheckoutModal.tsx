import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { createOrder, type ApiOrder } from "../../api/orders";
import { useAuth } from "../../context/auth";
import { useCart } from "../../context/cart";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PaymentMethod = "card" | "cash" | "yandex" | "sbp";

const PAYMENT_METHODS: PaymentMethod[] = ["card", "cash", "yandex", "sbp"];

const inputClass =
  "w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-[#0071E4]";
const submitClass =
  "mt-2 w-full rounded-lg bg-[#0071E4] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#005bb5] disabled:cursor-not-allowed disabled:opacity-60";

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { t } = useTranslation();
  const { lang } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { clear } = useCart();

  const [fullName, setFullName] = useState<string>(() =>
    user ? [user.first_name, user.last_name].filter(Boolean).join(" ").trim() : ""
  );
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(() => user?.email ?? "");
  const [address, setAddress] = useState("");
  const [comment, setComment] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("card");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState<ApiOrder | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const order = await createOrder({
        full_name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        comment: comment.trim() || undefined,
        payment_method: payment,
      });
      await clear();
      setCompleted(order);
    } catch {
      setError(t("pages.checkout.error"));
    } finally {
      setSubmitting(false);
    }
  };

  const goToAccount = () => {
    onClose();
    navigate(`/${lang}/account`);
  };

  const field = (label: string, input: React.ReactNode) => (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
      {label}
      {input}
    </label>
  );

  if (completed) {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="dialog" aria-modal="true">
        <div className="absolute inset-0 animate-fade-in bg-black/50" onClick={goToAccount} />
        <div className="relative flex w-full max-w-md animate-fade-in-up flex-col items-center gap-4 overflow-hidden bg-white px-8 py-10 text-center shadow-2xl sm:rounded-2xl">
          <svg viewBox="0 0 24 24" fill="none" stroke="#0071E4" strokeWidth="2" className="h-14 w-14">
            <circle cx="12" cy="12" r="10" />
            <path d="m8.5 12 2.5 2.5 5-5" />
          </svg>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{t("pages.checkout.successTitle")}</h2>
            <p className="mt-2 text-sm text-gray-500">{t("pages.checkout.successText", { number: completed.number })}</p>
          </div>
          <button type="button" onClick={goToAccount} className={submitClass}>
            {t("pages.checkout.successToAccount")}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100"
          >
            {t("pages.checkout.successContinue")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 animate-fade-in bg-black/50" onClick={onClose} />
      <div className="relative flex max-h-[90dvh] w-full max-w-md animate-fade-in-up flex-col overflow-hidden bg-white shadow-2xl sm:rounded-2xl">
        <header className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
          <h2 className="text-lg font-semibold">{t("pages.checkout.title")}</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </header>

        <form onSubmit={handleSubmit} className="scrollbar-thin flex flex-col gap-3 overflow-y-auto px-5 py-4">
          {field(
            t("pages.checkout.fullName"),
            <input
              type="text"
              required
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t("pages.checkout.fullNamePlaceholder")}
              className={inputClass}
            />
          )}
          {field(
            t("pages.checkout.phone"),
            <input
              type="tel"
              required
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t("pages.checkout.phonePlaceholder")}
              className={inputClass}
            />
          )}
          {field(
            t("pages.checkout.email"),
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("pages.checkout.emailPlaceholder")}
              className={inputClass}
            />
          )}
          {field(
            t("pages.checkout.address"),
            <input
              type="text"
              required
              autoComplete="street-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={t("pages.checkout.addressPlaceholder")}
              className={inputClass}
            />
          )}
          {field(
            t("pages.checkout.comment"),
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t("pages.checkout.commentPlaceholder")}
              className={inputClass}
            />
          )}

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-gray-700">{t("pages.checkout.payment")}</p>
            {PAYMENT_METHODS.map((method) => (
              <label key={method} className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name="payment"
                  checked={payment === method}
                  onChange={() => setPayment(method)}
                  className="h-4 w-4 accent-[#0071E4]"
                />
                {t(`pages.checkout.pay${method[0].toUpperCase()}${method.slice(1)}`)}
              </label>
            ))}
          </div>

          {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={submitting} className={submitClass}>
            {submitting ? t("common.loading") : t("pages.checkout.submit")}
          </button>
        </form>
      </div>
    </div>
  );
}