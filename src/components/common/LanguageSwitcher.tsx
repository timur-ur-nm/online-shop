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
    <div>
      {SUPPORTED_LANGUAGES.map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => handleChange(value)}
          disabled={value === lang}
        >
          {value.toUpperCase()}
        </button>
      ))}
    </div>
  );
}