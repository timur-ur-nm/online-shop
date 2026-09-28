import CitySelect from "../common/CitySelect";
import LanguageSwitcher from "../common/LanguageSwitcher";
import { socials } from "../../data/db";

export default function TopBar() {
  return (
    <div className="hidden bg-[#F9F9F9] md:block">
      <div className="container mx-auto flex items-center justify-between px-4 py-2">
        <CitySelect />
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4">
            {socials.map(({ name, href, icon }) => (
              <a key={name} href={href} target="_blank" rel="noreferrer" aria-label={name}>
                <img src={icon} alt={name} className="h-4 w-4" />
              </a>
            ))}
          </div>
          <span className="h-4 w-px bg-gray-300" />
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  );
}