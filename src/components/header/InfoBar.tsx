import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import logo from "../../assets/logo.png";

const navItems = [
  { to: "catalog", label: "nav.catalog" },
  { to: "sales", label: "nav.sales" },
  { to: "warranty", label: "nav.warranty" },
  { to: "return-policy", label: "nav.returnPolicy" },
  { to: "credit", label: "nav.credit" },
  { to: "delivery-payment", label: "nav.deliveryPayment" },
  { to: "reviews", label: "nav.reviews" },
  { to: "contacts", label: "nav.contacts" },
];

export default function InfoBar() {
  const { t } = useTranslation();

  return (
    <div className="border-t border-gray-100 bg-white">
      <div className="container mx-auto flex items-center justify-between gap-8 px-4 py-3">
        <img src={logo} alt="logo" className="h-10" />
        <nav className="flex items-center gap-6">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={label}
              to={to}
              className={({ isActive }) =>
                `relative text-[18px] font-medium transition-colors after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-[#0071E4] after:transition-transform after:duration-300 after:content-[''] hover:after:scale-x-100 ${
                  isActive
                    ? "text-[#0071E4] after:scale-x-100"
                    : "text-gray-500 hover:text-[#0071E4]"
                }`
              }
            >
              {t(label)}
            </NavLink>
          ))}
        </nav>
        <a
          href="tel:+79000000000"
          className="flex items-center gap-2 text-sm font-semibold text-black"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.3 0 .7-.2 1l-2.3 2.2Z" />
          </svg>
          {t("header.phone")}
        </a>
      </div>
    </div>
  );
}