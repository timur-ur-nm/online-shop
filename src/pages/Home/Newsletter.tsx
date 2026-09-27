import { useState } from "react";
import { useTranslation } from "react-i18next";
import newsletterImage from "../../assets/img (1).png";

export default function Newsletter() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmail("");
  };

  return (
    <section className="container mx-auto px-4 py-10">
      <div className="flex flex-col items-center gap-8 sm:flex-row">
        <img
          src={newsletterImage}
          alt={t("pages.newsletter.discount")}
          className="w-full object-contain sm:w-[45%]"
        />
        <div className="w-full sm:w-[55%]">
          <h2 className="text-5xl font-bold text-gray-900">{t("pages.newsletter.title")}</h2>
          <p className="mt-2 text-lg text-gray-600">{t("pages.newsletter.subtitle")}</p>
          <div className="mt-6 max-w-lg rounded-2xl bg-gradient-to-r from-[#0071E4] to-[#00a3ff] p-8">
            <p className="text-3xl font-semibold text-white">{t("pages.newsletter.discount")}</p>
            <form onSubmit={handleSubmit} className="mt-5 flex items-center gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("pages.newsletter.placeholder")}
                className="w-full rounded-xl border-0 bg-white px-4 py-3 text-base outline-none"
              />
              <button
                type="submit"
                className="shrink-0 rounded-xl bg-white px-6 py-3 text-base font-semibold text-[#0071E4] transition-colors hover:bg-blue-50"
              >
                {t("pages.newsletter.subscribe")}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}