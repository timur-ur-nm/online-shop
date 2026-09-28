import { useLocation, useNavigate, useParams } from "react-router-dom";
import i18n, { SUPPORTED_LANGUAGES, type Language } from "../../i18n";

export default function LanguageSwitcher() {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang } = useParams();

  const handleChange = (nextLang: Language) => {
    if (nextLang === lang) return;
    i18n.changeLanguage(nextLang);
    const segments = location.pathname.split("/");
    segments[1] = nextLang;
    navigate(segments.join("/") || `/${nextLang}`);
  };

  return (
    <div className="flex w-fit items-center gap-1 rounded-lg bg-gray-100 p-1">
      {SUPPORTED_LANGUAGES.map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => handleChange(value)}
          disabled={value === lang}
          aria-current={value === lang ? "true" : undefined}
          className={`rounded-md px-4 py-1.5 text-sm font-semibold transition-colors ${
            value === lang
              ? "bg-[#0071E4] text-white shadow-sm"
              : "text-gray-600 hover:text-[#0071E4]"
          } disabled:cursor-default`}
        >
          {value.toUpperCase()}
        </button>
      ))}
    </div>
  );
}