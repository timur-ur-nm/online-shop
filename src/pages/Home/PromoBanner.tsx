import { useTranslation } from "react-i18next";
import iphoneImage from "../../assets/design_startframe__cffzwjeyro2q_large (1) 2.png";

export default function PromoBanner() {
  const { t } = useTranslation();

  return (
    <section className="bg-black">
      <div className="container mx-auto flex flex-col items-center gap-8 px-4 py-10 md:flex-row md:gap-10 md:py-6">
        <img
          src={iphoneImage}
          alt={t("pages.homeBanner.title")}
          className="w-64 max-w-[60%] object-contain md:w-[30%] md:max-w-none"
        />
        <div className="w-full text-center md:w-[70%] md:text-left">
          <h2 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
            {t("pages.homeBanner.title")}
          </h2>
          <p className="mt-3 text-lg text-white/70 sm:text-2xl">
            {t("pages.homeBanner.subtitle")}
          </p>
          <button
            type="button"
            className="mt-6 rounded-lg bg-[#0071E4] px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-[#005bb5] sm:px-8 sm:text-lg"
          >
            {t("pages.homeBanner.details")}
          </button>
        </div>
      </div>
    </section>
  );
}