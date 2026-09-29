import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import newsletterImage from "../../assets/img (1).png";
import { subscribeEmail } from "../../api/feedback";

type Status = "idle" | "loading" | "success" | "error";

export default function Newsletter() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
      await subscribeEmail(email.trim());
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
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
            {status === "success" ? (
              <p className="mt-4 rounded-xl bg-white/15 px-4 py-3 text-sm font-medium text-white">
                {t("pages.newsletter.success")}
              </p>
            ) : (
              <form
                onSubmit={(e) => void handleSubmit(e)}
                className="mt-4 flex flex-col gap-2 md:mt-5 md:flex-row md:items-center md:gap-3"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === "error") setStatus("idle");
                  }}
                  placeholder={t("pages.newsletter.placeholder")}
                  className="w-full rounded-xl border-0 bg-white px-4 py-3 text-sm outline-none md:text-base"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="shrink-0 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#0071E4] transition-colors hover:bg-blue-50 disabled:opacity-60 md:text-base"
                >
                  {status === "loading" ? t("common.loading") : t("pages.newsletter.subscribe")}
                </button>
              </form>
            )}
            {status === "error" && (
              <p className="mt-3 text-xs font-medium text-white/90">{t("pages.newsletter.error")}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}