import iphoneIcon from "../assets/products/iphone.png";
import macbookIcon from "../assets/products/macbook.png";
import ipadIcon from "../assets/products/ipad.png";
import appleWatchIcon from "../assets/products/apple-watch.png";
import airpodsIcon from "../assets/products/airpods.png";
import heroPhoneImage from "../assets/orig (66) 1.png";
import heroBackground from "../assets/promo (2).png";
import vkIcon from "../assets/icons/vk.png";
import telegramIcon from "../assets/icons/telegram.png";
import whatsappIcon from "../assets/icons/whatsapp.png";

export interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  ratingCount?: number;
  inStock?: boolean;
  category?: string;
  image?: string;
  slug?: string;
  article?: string;
  rating?: number;
  stock?: number;
  color?: string;
  storage?: number;
  condition?: string;
  description?: string;
}

export interface NavItem {
  to: string;
  label: string;
}

export interface CategoryLink {
  to: string;
  label: string;
}

export interface CategoryMeta {
  groupKey: string;
  icon: string;
}

export const categoryMeta: Record<string, CategoryMeta> = {
  iphone: { groupKey: "iphone", icon: iphoneIcon },
  macbook: { groupKey: "macbook", icon: macbookIcon },
  ipad: { groupKey: "ipad", icon: ipadIcon },
  "apple-watch": { groupKey: "appleWatch", icon: appleWatchIcon },
  airpods: { groupKey: "airpods", icon: airpodsIcon },
};

export const navItems: NavItem[] = [
  { to: "catalog", label: "nav.catalog" },
  { to: "sales", label: "nav.sales" },
  { to: "warranty", label: "nav.warranty" },
  { to: "return-policy", label: "nav.returnPolicy" },
  { to: "credit", label: "nav.credit" },
  { to: "delivery-payment", label: "nav.deliveryPayment" },
  { to: "reviews", label: "nav.reviews" },
  { to: "contacts", label: "nav.contacts" },
];

export const footerInfoLinks: NavItem[] = [
  { to: "warranty", label: "nav.warranty" },
  { to: "return-policy", label: "nav.returnPolicy" },
  { to: "credit", label: "nav.credit" },
  { to: "delivery-payment", label: "nav.deliveryPayment" },
  { to: "reviews", label: "nav.reviews" },
  { to: "contacts", label: "nav.contacts" },
  { to: "privacy-policy", label: "nav.privacy" },
];

export const footerProductLinks: CategoryLink[] = [
  { to: "catalog?category=iphone", label: "pages.products.iphone" },
  { to: "catalog?category=ipad", label: "pages.products.ipad" },
  { to: "catalog?category=macbook", label: "pages.products.macbook" },
  { to: "catalog?category=apple-watch", label: "pages.products.watch" },
];

export interface HeroSlide {
  phoneImage: string;
  background: string;
}

export const heroSlides: HeroSlide[] = [
  { phoneImage: heroPhoneImage, background: heroBackground },
  { phoneImage: heroPhoneImage, background: heroBackground },
  { phoneImage: heroPhoneImage, background: heroBackground },
];

export interface SocialLink {
  name: string;
  href: string;
  icon: string;
}

export const socials: SocialLink[] = [
  { name: "VK", href: "https://vk.com", icon: vkIcon },
  { name: "Telegram", href: "https://t.me", icon: telegramIcon },
  { name: "WhatsApp", href: "https://wa.me", icon: whatsappIcon },
];

export interface Benefit {
  key: string;
  icon: string;
}

export const benefits: Benefit[] = [
  { key: "warranty", icon: "warranty" },
  { key: "delivery", icon: "delivery" },
  { key: "original", icon: "original" },
  { key: "installment", icon: "installment" },
];