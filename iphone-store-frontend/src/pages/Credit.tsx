import { useTranslation } from "react-i18next";

export default function Credit() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("pages.credit.title")}</h1>
    </div>
  );
}