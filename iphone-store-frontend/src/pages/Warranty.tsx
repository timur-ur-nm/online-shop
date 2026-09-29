import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

const PARAGRAPH_COUNT = 5;
const ACCORDION_COUNT = 3;

export default function Warranty() {
  const { t } = useTranslation();
  const { lang } = useParams();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900">{t("pages.warranty.title")}</h1>

      <h2 className="mt-4 text-lg font-semibold text-gray-900">{t("pages.warranty.lead")}</h2>

      <div className="mt-3 flex flex-col gap-3">
        {Array.from({ length: PARAGRAPH_COUNT }, (_, i) => (
          <p key={i} className="text-sm leading-relaxed text-gray-600">
            {t(`pages.warranty.paragraphs.${i}`)}
          </p>
        ))}
      </div>

      <Link
        to={`/${lang}/catalog`}
        className="mt-6 inline-flex items-center justify-center rounded-lg bg-[#0071E4] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#005bb5]"
      >
        {t("pages.warranty.goShopping")}
      </Link>

      <h2 className="mt-10 text-xl font-semibold text-gray-900">
        {t("pages.warranty.accordionTitle")}
      </h2>
      <div className="mt-4 flex flex-col divide-y divide-gray-100 rounded-lg border border-gray-100">
        {Array.from({ length: ACCORDION_COUNT }, (_, i) => {
          const open = openIndex === i;
          return (
            <div key={i}>
              <button
                type="button"
                onClick={() => setOpenIndex(open ? null : i)}
                aria-expanded={open}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="text-sm font-semibold text-gray-900">
                  {t(`pages.warranty.accordion.${i}.title`)}
                </span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {open && (
                <p className="px-5 pb-4 text-sm leading-relaxed text-gray-600">
                  {t(`pages.warranty.accordion.${i}.text`)}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}