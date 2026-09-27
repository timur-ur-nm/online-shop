import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Link, NavLink, useParams } from "react-router-dom";
import logo from "../../assets/logo.png";
import LanguageSwitcher from "../common/LanguageSwitcher";
import { navItems, catalogCategories } from "../../data/db";

export default function InfoBar() {
  const { t } = useTranslation();
  const { lang } = useParams();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navClass = () =>
    "block py-2.5 text-[16px] text-gray-700 transition-colors hover:text-[#0071E4]";

  return (
    <div className="border-t border-gray-100 bg-white">
      <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Menu"
            onClick={() => setIsMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 transition-colors hover:bg-gray-100 lg:hidden"
          >
            {isMenuOpen ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-6 w-6"
              >
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-6 w-6"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
          <Link to={`/${lang}`} onClick={() => setIsMenuOpen(false)} className="shrink-0">
            <img src={logo} alt="logo" className="h-9 md:h-10" />
          </Link>
        </div>

        <nav className="hidden min-w-0 items-center gap-6 lg:flex">
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
          className="flex shrink-0 items-center gap-2 text-sm font-semibold text-black"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.3 0 .7-.2 1l-2.3 2.2Z" />
          </svg>
          <span className="hidden sm:inline">{t("header.phone")}</span>
        </a>
      </div>

      {isMenuOpen && (
        <div className="border-t border-gray-100 lg:hidden">
          <div className="container mx-auto flex flex-col px-4 pb-4">
            <p className="pt-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
              {t("header.catalogTitle")}
            </p>
            <div className="mb-1 grid grid-cols-1">
              {catalogCategories.map(({ to, label }) => (
                <NavLink
                  key={label}
                  to={to}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `${navClass()} py-2 ${isActive ? "text-[#0071E4]" : ""}`
                  }
                >
                  {t(label)}
                </NavLink>
              ))}
            </div>
            <div className="my-2 h-px bg-gray-100" />
            {navItems.map(({ to, label }) => (
              <NavLink
                key={label}
                to={to}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `${navClass()} ${isActive ? "text-[#0071E4]" : ""}`
                }
              >
                {t(label)}
              </NavLink>
            ))}
            <div className="my-2 h-px bg-gray-100" />
            <LanguageSwitcher />
          </div>
        </div>
      )}
    </div>
  );
}