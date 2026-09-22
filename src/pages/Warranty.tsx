import { useTranslation } from "react-i18next";

export default function Warranty() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("pages.warranty.title")}</h1>
    </div>
  );
}