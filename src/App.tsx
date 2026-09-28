import { RouterProvider } from "react-router-dom";
import { router } from "../src/routes/RoutesConfig";
import CartProvider from "./context/CartProvider";

export default function App() {
  return (
    <CartProvider>
      <RouterProvider router={router} />
    </CartProvider>
  );
}