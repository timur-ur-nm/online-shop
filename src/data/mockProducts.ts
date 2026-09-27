import type { Product } from "../pages/Home/ProductCard";
import iphoneImage from "../assets/iphone.png";

const iphoneTimer = [
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
];

export const mockProducts: Product[] = iphoneTimer.map((item) => ({
  ...item,
  ratingCount: (item.id.charCodeAt(0) * 7 + parseInt(item.id, 10) * 13) % 300,
  inStock: parseInt(item.id, 10) % 3 !== 0,
  image: iphoneImage,
}));