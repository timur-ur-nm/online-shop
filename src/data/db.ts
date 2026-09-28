import iphoneImage from "../assets/iphone.png";
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
  image?: string;
}

export const db = {
  products: [
    { id: "1", name: "iPhone 15 Pro 128GB", price: 99990, oldPrice: 109990 },
    { id: "2", name: "iPhone 15 128GB", price: 79990 },
    { id: "3", name: "iPhone 14 Pro Max 256GB", price: 109990, oldPrice: 119990 },
    { id: "4", name: "iPhone 14 128GB", price: 69990, oldPrice: 74990 },
    { id: "5", name: "iPhone 13 128GB", price: 54990 },
    { id: "6", name: "iPhone SE 2022", price: 44990, oldPrice: 47990 },
    { id: "7", name: "iPhone 16 Pro 256GB", price: 119990 },
    { id: "8", name: "iPhone 16 128GB", price: 84990, oldPrice: 89990 },
    { id: "9", name: "iPhone 12 64GB", price: 47990 },
    { id: "10", name: "iPhone 11 64GB", price: 39990, oldPrice: 42990 },
    { id: "11", name: "iPhone XR 64GB", price: 34990 },
    { id: "12", name: "iPhone 15 Pro Max 256GB", price: 124990, oldPrice: 129990 },
  ].map((item) => ({
    ...item,
    ratingCount: (item.id.charCodeAt(0) * 7 + parseInt(item.id, 10) * 13) % 300,
    inStock: parseInt(item.id, 10) % 3 !== 0,
    image: iphoneImage,
  })) satisfies Product[],
} as const;

export function getProducts(): Product[] {
  return [...db.products];
}

export function getProductById(id: string): Product | undefined {
  return db.products.find((product) => product.id === id);
}

export interface NavItem {
  to: string;
  label: string;
}

export interface CategoryLink {
  to: string;
  label: string;
}

export interface Category {
  key: string;
  label: string;
  icon: string;
}

export const categories: Category[] = [
  { key: "iphone", label: "products.iphone", icon: iphoneIcon },
  { key: "macbook", label: "products.macbook", icon: macbookIcon },
  { key: "ipad", label: "products.ipad", icon: ipadIcon },
  { key: "appleWatch", label: "products.appleWatch", icon: appleWatchIcon },
  { key: "airpods", label: "products.airpods", icon: airpodsIcon },
  { key: "accessories", label: "products.accessories", icon: iphoneImage },
];

export const catalogCategories: CategoryLink[] = [
  { to: "catalog?category=smartphones", label: "categories.smartphones" },
  { to: "catalog?category=tablets", label: "categories.tablets" },
  { to: "catalog?category=computers", label: "categories.computers" },
  { to: "catalog?category=watches", label: "categories.watches" },
  { to: "catalog?category=accessories", label: "categories.accessories" },
];

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
  { to: "catalog?category=watch", label: "pages.products.watch" },
  { to: "catalog?category=accessories", label: "pages.products.accessories" },
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