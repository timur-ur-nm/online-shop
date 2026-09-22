import { createHashRouter, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Catalog from "../pages/Catalog";
import Sales from "../pages/Sales";
import Warranty from "../pages/Warranty";
import ReturnPolicy from "../pages/ReturnPolicy";
import Credit from "../pages/Credit";
import DeliveryPayment from "../pages/DeliveryPayment";
import Reviews from "../pages/Reviews";
import Contacts from "../pages/Contacts";
import NotFound404 from "../pages/NotFound";
import LangLayout from "../layout/LangLayout";

export const router = createHashRouter([
  {
    path: "/:lang",
    element: <LangLayout />,
    errorElement: <NotFound404 />,
    children: [
      { index: true, element: <Home /> },
      { path: "catalog", element: <Catalog /> },
      { path: "sales", element: <Sales /> },
      { path: "warranty", element: <Warranty /> },
      { path: "return-policy", element: <ReturnPolicy /> },
      { path: "credit", element: <Credit /> },
      { path: "delivery-payment", element: <DeliveryPayment /> },
      { path: "reviews", element: <Reviews /> },
      { path: "contacts", element: <Contacts /> },
      { path: "*", element: <NotFound404 /> },
    ],
  },
  {
    path: "/",
    element: <Navigate to="/ru" replace />,
  },
]);