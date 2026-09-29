import { useTranslation } from "react-i18next";

const SECTION_COUNT = 5;

export default function Privacy() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900">{t("pages.privacy.title")}</h1>
      <p className="mt-2 text-sm text-gray-500">{t("pages.privacy.intro")}</p>

      <div className="mt-6 flex flex-col gap-4">
        {Array.from({ length: SECTION_COUNT }, (_, i) => (
          <section key={i} className="flex flex-col gap-2 rounded-lg border border-gray-100 p-5">
            <h2 className="text-base font-semibold text-gray-900">
              {t(`pages.privacy.sections.${i}.title`)}
            </h2>
            <p className="text-sm text-gray-600">{t(`pages.privacy.sections.${i}.text`)}</p>
          </section>
        ))}
      </div>
    </div>
  );
}