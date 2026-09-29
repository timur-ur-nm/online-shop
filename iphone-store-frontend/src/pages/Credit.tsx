import { useTranslation } from "react-i18next";

const ITEM_COUNT = 4;
const STEP_COUNT = 3;

export default function Credit() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900">{t("pages.credit.title")}</h1>
      <p className="mt-2 text-sm text-gray-500">{t("pages.credit.intro")}</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: ITEM_COUNT }, (_, i) => (
          <article key={i} className="flex flex-col gap-2 rounded-lg border border-gray-100 p-5">
            <h2 className="text-base font-semibold text-gray-900">
              {t(`pages.credit.items.${i}.title`)}
            </h2>
            <p className="text-sm text-gray-600">{t(`pages.credit.items.${i}.text`)}</p>
          </article>
        ))}
      </div>

      <h2 className="mt-10 text-xl font-semibold text-gray-900">{t("pages.credit.stepsTitle")}</h2>
      <ol className="mt-4 space-y-3">
        {Array.from({ length: STEP_COUNT }, (_, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0071E4] text-xs font-semibold text-white">
              {i + 1}
            </span>
            {t(`pages.credit.steps.${i}`)}
          </li>
        ))}
      </ol>
    </div>
  );
}