import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { useCompare } from "../context/compare";
import { useProducts } from "../context/products";

export default function Compare() {
  const { t } = useTranslation();
  const { lang } = useParams();
  const { ids, remove, clear } = useCompare();
  const { products, loading } = useProducts();

  const compared = ids
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">{t("pages.compare.title")}</h1>
        {compared.length > 0 && (
          <button
            type="button"
            onClick={clear}
            className="text-sm font-medium text-gray-500 transition-colors hover:text-red-500"
          >
            {t("pages.compare.clear")}
          </button>
        )}
      </div>

      {loading ? (
        <p className="py-16 text-center text-sm text-gray-500">{t("common.loading")}</p>
      ) : compared.length > 0 ? (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <tbody>
              {(() => {
                const inStock = compared.map((p) => (p.inStock ? t("pages.productCard.inStock") : t("pages.productCard.outOfStock")));
                return (
                  <>
                    <tr>
                      <td className="w-40 border border-gray-100 bg-gray-50 px-4 py-3 font-semibold text-gray-700">
                        {t("pages.compare.product")}
                      </td>
                      {compared.map((p) => (
                        <td key={p.id} className="min-w-52 border border-gray-100 px-4 py-3 align-top">
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              to={`/${lang}/product/${p.slug ?? p.id}`}
                              className="line-clamp-2 font-semibold text-gray-900 transition-colors hover:text-[#0071E4]"
                            >
                              {p.name}
                            </Link>
                            <button
                              type="button"
                              aria-label={t("pages.compare.remove")}
                              onClick={() => remove(p.id)}
                              className="shrink-0 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-500"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                                <path d="M6 6l12 12M18 6 6 18" />
                              </svg>
                            </button>
                          </div>
                          {p.image && (
                            <Link to={`/${lang}/product/${p.slug ?? p.id}`} aria-label={p.name}>
                              <img src={p.image} alt={p.name} className="my-3 h-32 w-full object-contain" />
                            </Link>
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="w-40 border border-gray-100 bg-gray-50 px-4 py-3 font-semibold text-gray-700">
                        {t("pages.compare.price")}
                      </td>
                      {compared.map((p) => (
                        <td key={p.id} className="border border-gray-100 px-4 py-3 align-top">
                          <div className="flex flex-wrap items-baseline gap-2">
                            <span className="text-lg font-bold text-gray-900">{p.price} ₽</span>
                            {p.oldPrice !== undefined && p.oldPrice > p.price && (
                              <span className="text-sm text-gray-400 line-through">{p.oldPrice} ₽</span>
                            )}
                          </div>
                          <Link
                            to={`/${lang}/product/${p.slug ?? p.id}`}
                            className="mt-3 inline-flex rounded-lg bg-[#0071E4] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#005bb5]"
                          >
                            {t("pages.productCard.buyOneClick")}
                          </Link>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="w-40 border border-gray-100 bg-gray-50 px-4 py-3 font-semibold text-gray-700">
                        {t("pages.compare.availability")}
                      </td>
                      {compared.map((p, i) => (
                        <td key={p.id} className="border border-gray-100 px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 font-medium ${
                              p.inStock ? "text-green-600" : "text-red-500"
                            }`}
                          >
                            <span className={`h-2 w-2 rounded-full ${p.inStock ? "bg-green-500" : "bg-red-500"}`} />
                            {inStock[i]}
                          </span>
                        </td>
                      ))}
                    </tr>
                    {compared.some((p) => p.condition) && (
                      <tr>
                        <td className="w-40 border border-gray-100 bg-gray-50 px-4 py-3 font-semibold text-gray-700">
                          {t("pages.compare.condition")}
                        </td>
                        {compared.map((p) => (
                          <td key={p.id} className="border border-gray-100 px-4 py-3 text-gray-800">
                            {p.condition || "—"}
                          </td>
                        ))}
                      </tr>
                    )}
                    {compared.some((p) => p.storage !== undefined && p.storage !== null) && (
                      <tr>
                        <td className="w-40 border border-gray-100 bg-gray-50 px-4 py-3 font-semibold text-gray-700">
                          {t("pages.compare.storage")}
                        </td>
                        {compared.map((p) => (
                          <td key={p.id} className="border border-gray-100 px-4 py-3 text-gray-800">
                            {p.storage !== undefined && p.storage !== null ? `${p.storage} GB` : "—"}
                          </td>
                        ))}
                      </tr>
                    )}
                  </>
                );
              })()}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center py-16 text-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-14 w-14 text-gray-300">
            <path d="M4 6h16M6 12h12M9 18h6" />
          </svg>
          <p className="mt-4 text-[22px] font-semibold text-gray-800">{t("pages.compare.emptyTitle")}</p>
          <p className="mt-2 max-w-md text-sm text-gray-500">{t("pages.compare.emptyText")}</p>
          <Link
            to={`/${lang}/catalog`}
            className="mt-6 rounded-lg bg-[#0071E4] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#005bb5]"
          >
            {t("pages.compare.goCatalog")}
          </Link>
        </div>
      )}
    </div>
  );
}