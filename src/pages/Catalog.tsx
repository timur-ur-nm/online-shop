import { useTranslation } from "react-i18next";

export default function Catalog() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("pages.catalog.title")}</h1>
    </div>
  );
}