import { createHashRouter, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Catalog from "../pages/Catalog";
import Wishlist from "../pages/Wishlist";
import Compare from "../pages/Compare";
import Sales from "../pages/Sales";
import Warranty from "../pages/Warranty";
import ReturnPolicy from "../pages/ReturnPolicy";
import Credit from "../pages/Credit";
import DeliveryPayment from "../pages/DeliveryPayment";
import Reviews from "../pages/Reviews";
import Contacts from "../pages/Contacts";
import Privacy from "../pages/Privacy";
import NotFound404 from "../pages/NotFound";
import LangLayout from "../layout/LangLayout";
import ProductPageRoute from "./ProductPageRoute";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import Account from "../pages/Account";

export const router = createHashRouter([
  {
    path: "/:lang",
    element: <LangLayout />,
    errorElement: <NotFound404 />,
    children: [
      { index: true, element: <Home /> },
      { path: "catalog", element: <Catalog /> },
      { path: "product/:slug", element: <ProductPageRoute /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "account", element: <Account /> },
      { path: "wishlist", element: <Wishlist /> },
      { path: "compare", element: <Compare /> },
      { path: "sales", element: <Sales /> },
      { path: "warranty", element: <Warranty /> },
      { path: "return-policy", element: <ReturnPolicy /> },
      { path: "credit", element: <Credit /> },
      { path: "delivery-payment", element: <DeliveryPayment /> },
      { path: "reviews", element: <Reviews /> },
      { path: "contacts", element: <Contacts /> },
      { path: "privacy-policy", element: <Privacy /> },
      { path: "*", element: <NotFound404 /> },
    ],
  },
  {
    path: "/",
    element: <Navigate to="/ru" replace />,
  },
]);