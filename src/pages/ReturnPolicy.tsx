import { useTranslation } from "react-i18next";

export default function ReturnPolicy() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("pages.returnPolicy.title")}</h1>
    </div>
  );
}