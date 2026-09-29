import { useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";
import i18n, { FALLBACK_LANGUAGE, isSupportedLanguage } from "../i18n";
import Layout from "./Layout";

export default function LangLayout() {
  const { lang } = useParams();

  useEffect(() => {
    if (isSupportedLanguage(lang) && i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang]);

  if (!isSupportedLanguage(lang)) {
    return <Navigate to={`/${FALLBACK_LANGUAGE}`} replace />;
  }

  return <Layout />;
}