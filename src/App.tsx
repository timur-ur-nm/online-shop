import { RouterProvider } from "react-router-dom";
import { router } from "../src/routes/RoutesConfig";
import AuthProvider from "./context/AuthProvider";
import ProductsProvider from "./context/ProductsProvider";
import CartProvider from "./context/CartProvider";
import RecentlyViewedProvider from "./context/RecentlyViewedProvider";

export default function App() {
  return (
    <AuthProvider>
      <ProductsProvider>
        <CartProvider>
          <RecentlyViewedProvider>
            <RouterProvider router={router} />
          </RecentlyViewedProvider>
        </CartProvider>
      </ProductsProvider>
    </AuthProvider>
  );
}