import TopBar from "../components/header/TopBar";
import InfoBar from "../components/header/InfoBar";
import SearchBar from "../components/header/SearchBar";
import ProductsBar from "../components/header/ProductsBar";

export default function Header() {
  return (
    <div>
      <TopBar />
      <InfoBar />
      <SearchBar />
      <ProductsBar />
    </div>
  );
}