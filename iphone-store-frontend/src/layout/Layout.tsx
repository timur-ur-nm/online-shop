import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import CartModal from "../components/cart/CartModal";
import CheckoutModal from "../components/cart/CheckoutModal";
import { useCart } from "../context/cart";

export default function Layout() {
  const location = useLocation();
  const { checkoutOpen, closeCheckout } = useCart();

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
      <CheckoutModal isOpen={checkoutOpen} onClose={closeCheckout} />
    </div>
  );
}
