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
      <div className="flex flex-col items-center gap-6 md:flex-row md:gap-8">
        <img
          src={newsletterImage}
          alt={t("pages.newsletter.discount")}
          className="max-h-56 w-auto object-contain md:max-h-none md:w-[45%]"
        />
        <div className="w-full md:w-[55%]">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl md:text-5xl">
            {t("pages.newsletter.title")}
          </h2>
          <p className="mt-2 text-base text-gray-600 sm:text-lg">
            {t("pages.newsletter.subtitle")}
          </p>
          <div className="mt-5 w-full max-w-lg rounded-2xl bg-gradient-to-r from-[#0071E4] to-[#00a3ff] p-5 md:mt-6 md:p-8">
            <p className="text-2xl font-semibold text-white md:text-3xl">
              {t("pages.newsletter.discount")}
            </p>
            <form
              onSubmit={handleSubmit}
              className="mt-4 flex flex-col gap-2 md:mt-5 md:flex-row md:items-center md:gap-3"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("pages.newsletter.placeholder")}
                className="w-full rounded-xl border-0 bg-white px-4 py-3 text-sm outline-none md:text-base"
              />
              <button
                type="submit"
                className="shrink-0 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#0071E4] transition-colors hover:bg-blue-50 md:text-base"
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