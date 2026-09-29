import { useTranslation } from "react-i18next";

const CARD_COUNT = 4;

export default function Sales() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900">{t("pages.sales.title")}</h1>
      <p className="mt-2 text-sm text-gray-500">{t("pages.sales.subtitle")}</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: CARD_COUNT }, (_, i) => (
          <article key={i} className="flex flex-col gap-2 rounded-lg border border-gray-100 p-5">
            <h2 className="text-base font-semibold text-gray-900">
              {t(`pages.sales.cards.${i}.title`)}
            </h2>
            <p className="text-sm text-gray-600">{t(`pages.sales.cards.${i}.text`)}</p>
          </article>
        ))}
      </div>

      <p className="mt-6 text-xs text-gray-400">{t("pages.sales.note")}</p>
    </div>
  );
}