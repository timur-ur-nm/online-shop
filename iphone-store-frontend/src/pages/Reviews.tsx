import { useTranslation } from "react-i18next";

const CARD_COUNT = 5;

export default function Reviews() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900">{t("pages.reviews.title")}</h1>
      <p className="mt-2 text-sm text-gray-500">{t("pages.reviews.intro")}</p>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: CARD_COUNT }, (_, i) => (
          <article key={i} className="flex flex-col gap-2 rounded-lg border border-gray-100 p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0071E4] text-sm font-semibold text-white">
                {t(`pages.reviews.cards.${i}.name`).charAt(0)}
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {t(`pages.reviews.cards.${i}.name`)}
              </span>
              <span className="ml-auto text-amber-400">★★★★★</span>
            </div>
            <p className="text-sm text-gray-600">{t(`pages.reviews.cards.${i}.text`)}</p>
          </article>
        ))}
      </div>
    </div>
  );
}