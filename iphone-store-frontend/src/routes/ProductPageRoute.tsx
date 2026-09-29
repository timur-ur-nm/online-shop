import { useParams } from "react-router-dom";
import ProductPage from "../pages/Product/ProductPage";

export default function ProductPageRoute() {
  const { slug } = useParams();
  return <ProductPage key={slug ?? "none"} />;
}