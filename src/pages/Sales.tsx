import { useTranslation } from "react-i18next";

export default function Sales() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("pages.sales.title")}</h1>
    </div>
  );
}