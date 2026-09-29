import { useTranslation } from "react-i18next";
import deliveryImage from "../assets/delivery.png";

const DELIVERY_COUNT = 3;
const PAYMENT_COUNT = 3;

export default function DeliveryPayment() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900">{t("pages.deliveryPayment.title")}</h1>
      <p className="mt-2 text-sm text-gray-500">{t("pages.deliveryPayment.intro")}</p>

      <img
        src={deliveryImage}
        alt={t("pages.deliveryPayment.title")}
        className="mt-6 w-full rounded-lg object-contain"
        loading="lazy"
      />

      <h2 className="mt-10 text-xl font-semibold text-gray-900">
        {t("pages.deliveryPayment.deliveryTitle")}
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: DELIVERY_COUNT }, (_, i) => (
          <article key={i} className="flex flex-col gap-2 rounded-lg border border-gray-100 p-5">
            <h3 className="text-base font-semibold text-gray-900">
              {t(`pages.deliveryPayment.deliveryItems.${i}.title`)}
            </h3>
            <p className="text-sm text-gray-600">
              {t(`pages.deliveryPayment.deliveryItems.${i}.text`)}
            </p>
          </article>
        ))}
      </div>

      <h2 className="mt-10 text-xl font-semibold text-gray-900">
        {t("pages.deliveryPayment.paymentTitle")}
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: PAYMENT_COUNT }, (_, i) => (
          <article key={i} className="flex flex-col gap-2 rounded-lg border border-gray-100 p-5">
            <h3 className="text-base font-semibold text-gray-900">
              {t(`pages.deliveryPayment.paymentItems.${i}.title`)}
            </h3>
            <p className="text-sm text-gray-600">
              {t(`pages.deliveryPayment.paymentItems.${i}.text`)}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}