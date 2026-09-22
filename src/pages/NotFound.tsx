import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div>{t("pages.notFound.title")}</div>
  );
}
