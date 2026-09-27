import { useTranslation } from "react-i18next";
import ProductCard from "./ProductCard";
import { mockProducts } from "../../data/mockProducts";

export default function PopularProducts() {
  const { t } = useTranslation();

  return (
    <section className="container mx-auto px-4 py-10">
      <h2 className="text-2xl font-semibold">{t("pages.homePopular.title")}</h2>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {mockProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}