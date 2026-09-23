import { useTranslation } from "react-i18next";
import iphoneIcon from "../../assets/iphonex_119956 5.png";
import macbookIcon from "../../assets/macbook_laptop_mac_apple_computer_icon_134097 3.png";
import ipadIcon from "../../assets/ipadh_119979 3.png";
import appleWatchIcon from "../../assets/applewatch_119991 3.png";
import airpodsIcon from "../../assets/airpods_110489 3.png";

const products = [
  { key: "iphone", icon: iphoneIcon },
  { key: "macbook", icon: macbookIcon },
  { key: "ipad", icon: ipadIcon },
  { key: "appleWatch", icon: appleWatchIcon },
  { key: "airpods", icon: airpodsIcon },
  { key: "accessories", icon: iphoneIcon },
] as const;

export default function ProductsBar() {
  const { t } = useTranslation();

  return (
    <div className="border-t border-gray-100 bg-white">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between py-2">
          {products.map(({ key, icon }) => (
            <div key={key} className="group relative">
              <button
                type="button"
                className="relative flex items-center gap-2 px-4 pb-2 text-[18px] font-medium text-gray-700 transition-colors after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-[#0071E4] after:transition-transform after:duration-300 after:content-[''] group-hover:text-[#0071E4] group-hover:after:scale-x-100"
              >
                {typeof icon === "string" ? (
                  <img
                    src={icon}
                    alt={t(`products.${key}`)}
                    className="h-6 w-6 object-contain"
                  />
                ) : (
                  <span className="text-[#0071E4]">{icon}</span>
                )}
                {t(`products.${key}`)}
              </button>

              <div className="pointer-events-none absolute left-1/2 top-full z-50 w-72 -translate-x-1/2 rounded-b border border-gray-100 bg-white p-3 opacity-0 shadow-lg transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
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
