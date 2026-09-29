import { useTranslation } from "react-i18next";

export default function Reviews() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("pages.reviews.title")}</h1>
    </div>
  );
}