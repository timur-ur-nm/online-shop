import { useTranslation } from "react-i18next";

export default function CitySelect() {
  const { t, i18n } = useTranslation();

  return (
    <div className="flex items-center gap-2">
      <span className="flex items-center gap-1 text-xs text-gray-600">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
          <path d="M12 21s-7-5.6-7-11a7 7 0 1 1 14 0c0 5.4-7 11-7 11Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
        {t("header.city")}:
      </span>
      <select
        defaultValue={i18n.language === "ru" ? "moscow" : "moscow"}
        aria-label={t("header.city")}
        className="cursor-pointer bg-transparent text-xs font-medium text-[#0071E4] outline-none"
      >
        {Object.entries(t("header.cities", { returnObjects: true })).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}