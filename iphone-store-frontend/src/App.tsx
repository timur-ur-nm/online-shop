import { RouterProvider } from "react-router-dom";
import { router } from "../src/routes/RoutesConfig";
import AuthProvider from "./context/AuthProvider";
import ProductsProvider from "./context/ProductsProvider";
import CartProvider from "./context/CartProvider";
import RecentlyViewedProvider from "./context/RecentlyViewedProvider";
import WishlistProvider from "./context/WishlistProvider";
import CompareProvider from "./context/CompareProvider";

export default function App() {
  return (
    <AuthProvider>
      <ProductsProvider>
        <WishlistProvider>
          <CompareProvider>
            <CartProvider>
              <RecentlyViewedProvider>
                <RouterProvider router={router} />
              </RecentlyViewedProvider>
            </CartProvider>
          </CompareProvider>
        </WishlistProvider>
      </ProductsProvider>
    </AuthProvider>
  );
}