import { useTranslation } from "react-i18next";
import { categories } from "../../data/db";

export default function ProductsBar() {
  const { t } = useTranslation();

  return (
    <div className="hidden border-t border-gray-100 bg-white md:block">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between gap-4 py-2">
          {categories.map(({ key, label, icon }) => (
            <div key={key} className="group relative shrink-0">
              <button
                type="button"
                className="relative flex items-center gap-2 px-3 pb-2 text-[16px] font-medium text-gray-700 transition-colors after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-[#0071E4] after:transition-transform after:duration-300 after:content-[''] group-hover:text-[#0071E4] group-hover:after:scale-x-100 lg:text-[18px]"
              >
                <img src={icon} alt={t(label)} className="h-6 w-6 object-contain" />
                {t(label)}
              </button>

              <div className="pointer-events-none absolute left-1/2 top-full z-50 w-80 max-h-[320px] -translate-x-1/2 overflow-y-auto rounded-b border border-gray-100 bg-white p-3 opacity-0 shadow-lg scrollbar-thin transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
                {(
                  t(`products.items.${key}`, {
                    returnObjects: true,
                  }) as string[]
                ).map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="block rounded px-3 py-2.5 text-[16px] text-gray-700 transition-colors hover:bg-gray-50 hover:text-[#0071E4]"
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}