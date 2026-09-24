import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import telegram from "../assets/icons/telegram.png";
import vk from "../assets/icons/vk.png";
import whatsapp from "../assets/icons/whatsapp.png";

const infoLinks = [
  { to: "warranty", label: "nav.warranty" },
  { to: "return-policy", label: "nav.returnPolicy" },
  { to: "credit", label: "nav.credit" },
  { to: "delivery-payment", label: "nav.deliveryPayment" },
  { to: "reviews", label: "nav.reviews" },
  { to: "contacts", label: "nav.contacts" },
  { to: "privacy-policy", label: "nav.privacy" },
];

const productLinks = [
  { to: "catalog?category=iphone", label: "pages.products.iphone" },
  { to: "catalog?category=ipad", label: "pages.products.ipad" },
  { to: "catalog?category=macbook", label: "pages.products.macbook" },
  { to: "catalog?category=watch", label: "pages.products.watch" },
  { to: "catalog?category=accessories", label: "pages.products.accessories" },
];

const socials = [
  { name: "Telegram", href: "https://t.me", icon: telegram },
  { name: "VK", href: "https://vk.com", icon: vk },
  { name: "WhatsApp", href: "https://wa.me", icon: whatsapp },
];

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#F9F9F9]">
      <div className="container mx-auto grid grid-cols-4 gap-8 px-4 py-10">
        <div>
          <img src={logo} alt="logo" className="mb-4 h-10" />
          <p className="text-sm font-semibold text-gray-900">{t("footer.copyright")}</p>
          <p className="mt-1 text-sm text-gray-600">{t("footer.tagline")}</p>
          <p className="mt-4 text-xs leading-relaxed text-gray-500">{t("footer.disclaimer")}</p>
        </div>

        <div>
          <ul className="space-y-3">
            {infoLinks.map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="text-sm text-gray-600 transition-colors hover:text-[#0071E4]"
                >
                  {t(label)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <ul className="space-y-3">
            {productLinks.map(({ to, label }) => (
              <li key={label}>
                <Link
                  to={to}
                  className="text-sm text-gray-600 transition-colors hover:text-[#0071E4]"
                >
                  {t(label)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <a
            href="tel:+78127048697"
            className="text-lg font-semibold text-gray-900 transition-colors hover:text-[#0071E4]"
          >
            {t("footer.phone")}
          </a>
          <p className="mt-1 text-sm text-gray-600">{t("footer.consultation")}</p>
          <p className="text-sm text-gray-500">{t("footer.hours")}</p>

          <button
            type="button"
            className="mt-4 text-sm font-semibold text-[#0071E4] transition-colors hover:text-[#005bb5]"
          >
            {t("footer.callback")}
          </button>

          <div className="mt-5 flex items-center gap-4">
            {socials.map(({ name, href, icon }) => (
              <a key={name} href={href} target="_blank" rel="noreferrer" aria-label={name}>
                <img src={icon} alt={name} className="h-5 w-5 transition-opacity hover:opacity-70" />
              </a>
            ))}
          </div>

          <p className="mt-5 text-sm text-gray-600">{t("footer.address")}</p>
        </div>
      </div>
    </footer>
  );
}