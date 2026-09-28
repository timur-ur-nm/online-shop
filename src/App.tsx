import { RouterProvider } from "react-router-dom";
import { router } from "../src/routes/RoutesConfig";
import CartProvider from "./context/CartProvider";
import RecentlyViewedProvider from "./context/RecentlyViewedProvider";

export default function App() {
  return (
    <CartProvider>
      <RecentlyViewedProvider>
        <RouterProvider router={router} />
      </RecentlyViewedProvider>
    </CartProvider>
  );
}