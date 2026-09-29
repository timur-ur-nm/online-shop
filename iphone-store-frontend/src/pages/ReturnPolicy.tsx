import { useTranslation } from "react-i18next";

const SECTION_COUNT = 2;

export default function ReturnPolicy() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900">{t("pages.returnPolicy.title")}</h1>
      <p className="mt-2 text-sm font-medium text-gray-700">{t("pages.returnPolicy.lead")}</p>

      <div className="mt-6 flex flex-col gap-8">
        {Array.from({ length: SECTION_COUNT }, (_, i) => {
          const paragraphs = t(`pages.returnPolicy.sections.${i}.paragraphs`, {
            returnObjects: true,
          }) as string[];
          return (
            <section key={i}>
              <h2 className="text-lg font-semibold text-gray-900">
                {t(`pages.returnPolicy.sections.${i}.title`)}
              </h2>
              <div className="mt-3 flex flex-col gap-3">
                {paragraphs.map((text, j) => (
                  <p key={j} className="text-sm leading-relaxed text-gray-600">
                    {text}
                  </p>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}