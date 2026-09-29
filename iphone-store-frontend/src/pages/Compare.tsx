import { useTranslation } from "react-i18next";

export default function Compare() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("pages.compare.title")}</h1>
    </div>
  );
}