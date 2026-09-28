import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import notFoundImage from "../assets/404.png";

export default function NotFound() {
  const { t } = useTranslation();
  const { lang } = useParams();

  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-4xl font-semibold text-gray-900">{t("pages.notFound.title")}</h1>
      <p className="mt-2 text-gray-500">{t("pages.notFound.message")}</p>
      <Link
        to={`/${lang}`}
        className="mt-6 rounded-lg bg-[#0071E4] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#005bb5]"
      >
        {t("common.home")}
      </Link>
      <img src={notFoundImage} alt="404" className="mt-10 w-full max-w-md object-contain" />
    </div>
  );
}