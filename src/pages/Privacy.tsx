import { useTranslation } from "react-i18next";

export default function Privacy() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("pages.privacy.title")}</h1>
    </div>
  );
}