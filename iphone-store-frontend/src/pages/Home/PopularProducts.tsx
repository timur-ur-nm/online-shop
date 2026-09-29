import { useTranslation } from "react-i18next";
import ProductCard from "./ProductCard";
import { useProducts } from "../../context/products";

export default function PopularProducts() {
  const { t } = useTranslation();
  const { products, loading } = useProducts();

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-10">
        <p className="text-sm text-gray-500">{t("common.loading")}</p>
      </section>
    );
  }

  const list = [...products].sort((a, b) => (b.ratingCount ?? 0) - (a.ratingCount ?? 0)).slice(0, 4);

  return (
    <section className="container mx-auto px-4 py-10">
      <h2 className="text-2xl font-semibold">{t("pages.homePopular.title")}</h2>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}