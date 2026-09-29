import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import CartModal from "../components/cart/CartModal";

export default function Layout() {
  const location = useLocation();

  return (
    <div>
      <Header />
      <main className="pb-20 md:pb-0">
        <div key={location.pathname} className="animate-fade-in">
          <Outlet />
        </div>
      </main>
      <Footer />
      <CartModal />
    </div>
  );
}
