import { useTranslation } from "react-i18next";
import iphoneImage from "../../assets/design_startframe__cffzwjeyro2q_large (1) 2.png";

export default function PromoBanner() {
  const { t } = useTranslation();

  return (
    <section className="bg-black">
      <div className="container mx-auto flex justify-center items-center">
        <img
          src={iphoneImage}
          alt={t("pages.homeBanner.title")}

        />
        <div className="w-full sm:w-[70%] sm:pl-10">
          <h2 className="text-6xl font-bold text-white">
            {t("pages.homeBanner.title")}
          </h2>
          <p className="mt-2 text-2xl text-white/70">
            {t("pages.homeBanner.subtitle")}
          </p>
          <button
            type="button"
            className="mt-6 rounded-lg bg-[#0071E4] px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-[#005bb5]"
          >
            {t("pages.homeBanner.details")}
          </button>
        </div>
      </div>
    </section>
  );
}