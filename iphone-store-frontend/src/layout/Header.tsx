import { useState } from "react";
import TopBar from "../components/header/TopBar";
import InfoBar from "../components/header/InfoBar";
import SearchBar from "../components/header/SearchBar";
import ProductsBar from "../components/header/ProductsBar";
import BottomNavBar from "../components/header/BottomNavBar";

export default function Header() {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <div>
      <TopBar />
      <InfoBar
        mobileSearchOpen={mobileSearchOpen}
        onToggleSearch={() => setMobileSearchOpen((open) => !open)}
      />
      <SearchBar />
      <ProductsBar />
      <BottomNavBar />
    </div>
  );
}