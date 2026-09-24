

import { useTranslation } from "react-i18next";
import HeroSection from "./Home/HeroSection";

export default function Home() {
  const { t } = useTranslation();

  return (
    <div>
      <HeroSection />
      <h1>{t("pages.home.title")}</h1>
      <p>{t("pages.home.subtitle")}</p>
    </div>
  );
}
