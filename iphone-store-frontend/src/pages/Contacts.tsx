import { useTranslation } from "react-i18next";

export default function Contacts() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("pages.contacts.title")}</h1>
    </div>
  );
}