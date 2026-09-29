import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { categoryMeta } from "../../data/db";
import { categoryImage } from "../../api/client";
import { useProducts } from "../../context/products";

export default function ProductsBar() {
  const { t } = useTranslation();
  const { lang } = useParams();
  const { categoryTree } = useProducts();

  return (
    <div className="hidden border-t border-gray-100 bg-white md:block">
      <div className="container mx-auto px-4">
        <nav className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-2">
          {categoryTree.map((c) => {
            const meta = categoryMeta[c.slug];
            const label = meta ? t(`products.${meta.groupKey}`) : c.name;
            const icon = c.image ?? categoryImage(c.slug) ?? meta?.icon;
            return (
              <Link
                key={c.slug}
                to={`/${lang}/catalog?category=${c.slug}`}
                className="relative flex items-center gap-2 px-3 pb-2 text-[16px] font-medium text-gray-700 transition-colors after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-[#0071E4] after:transition-transform after:duration-300 after:content-[''] hover:text-[#0071E4] hover:after:scale-x-100 lg:text-[18px]"
              >
                {icon && <img src={icon} alt={label} className="h-6 w-6 object-contain" />}
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}