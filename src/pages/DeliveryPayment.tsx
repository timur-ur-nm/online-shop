import { useTranslation } from "react-i18next";

export default function DeliveryPayment() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("pages.deliveryPayment.title")}</h1>
    </div>
  );
}