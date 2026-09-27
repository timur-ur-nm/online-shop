import { useTranslation } from "react-i18next";

export default function Benefits() {
  const { t } = useTranslation();

  const benefits = [
    {
      key: "warranty",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="#0071E4" strokeWidth="1.5" className="h-9 w-9">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      ),
    },
    {
      key: "delivery",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="#0071E4" strokeWidth="1.5" className="h-9 w-9">
          <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7z" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      ),
    },
    {
      key: "original",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="#0071E4" strokeWidth="1.5" className="h-9 w-9">
          <circle cx="12" cy="12" r="9" />
          <path d="m8.5 12 2.5 2.5 5-5" />
        </svg>
      ),
    },
    {
      key: "installment",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="#0071E4" strokeWidth="1.5" className="h-9 w-9">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <path d="M2 10h20" />
        </svg>
      ),
    },
  ];

  return (
    <section className="container mx-auto px-4 py-10">
      <h2 className="text-2xl font-semibold">{t("pages.homeBenefits.title")}</h2>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map((benefit) => (
          <article
            key={benefit.key}
            className="flex flex-col gap-3 rounded-lg border border-gray-100 p-5"
          >
            {benefit.icon}
            <h3 className="text-base font-semibold text-gray-900">
              {t(`pages.homeBenefits.${benefit.key}.title`)}
            </h3>
            <p className="text-sm text-gray-600">
              {t(`pages.homeBenefits.${benefit.key}.text`)}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}