import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { categories } from "../../data/db";

export default function ProductsBar() {
  const { t } = useTranslation();
  const { lang } = useParams();

  return (
    <div className="hidden border-t border-gray-100 bg-white md:block">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between gap-4 py-2">
          {categories.map(({ key, label, icon }) => (
            <Link
              key={key}
              to={`/${lang}/catalog?category=${key}`}
              className="relative flex items-center gap-2 px-3 pb-2 text-[16px] font-medium text-gray-700 transition-colors after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-[#0071E4] after:transition-transform after:duration-300 after:content-[''] hover:text-[#0071E4] hover:after:scale-x-100 lg:text-[18px]"
            >
              <img src={icon} alt={t(label)} className="h-6 w-6 object-contain" />
              {t(label)}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}