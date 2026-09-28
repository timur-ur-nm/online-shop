import { useTranslation } from "react-i18next";

export default function Wishlist() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("pages.wishlist.title")}</h1>
    </div>
  );
}