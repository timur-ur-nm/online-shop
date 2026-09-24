import CitySelect from "../common/CitySelect";
import vkIcon from "../../assets/icons/vk.png";
import telegramIcon from "../../assets/icons/telegram.png";
import watsappIcon from "../../assets/icons/whatsapp.png";

const socials = [
  { name: "VK", href: "https://vk.com", icon: vkIcon },
  { name: "Telegram", href: "https://t.me", icon: telegramIcon },
  { name: "WhatsApp", href: "https://wa.me", icon: watsappIcon },
];

export default function TopBar() {
  return (
    <div className="bg-[#F9F9F9]">
      <div className="container mx-auto flex items-center justify-between px-4 py-2">
        <CitySelect />
        <div className="flex items-center gap-4">
          {socials.map(({ name, href, icon }) => (
            <a key={name} href={href} target="_blank" rel="noreferrer" aria-label={name}>
              <img src={icon} alt={name} className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}