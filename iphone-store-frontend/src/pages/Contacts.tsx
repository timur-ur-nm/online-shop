import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { socials } from "../data/db";
import { sendFeedback } from "../api/feedback";

type Status = "idle" | "loading" | "success" | "error";

export default function Contacts() {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const rows = [
    { label: t("pages.contacts.phoneLabel"), value: t("footer.phone") },
    { label: t("pages.contacts.addressLabel"), value: t("footer.address") },
    { label: t("pages.contacts.hoursLabel"), value: t("footer.hours") },
    { label: t("pages.contacts.emailLabel"), value: t("pages.contacts.email") },
  ];
  const hasMessage = message.trim().length > 1;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!hasMessage) return;
    setStatus("loading");
    try {
      await sendFeedback({
        kind: "feedback",
        name: name.trim() || undefined,
        phone: phone.trim() || undefined,
        message: message.trim(),
      });
      setStatus("success");
      setName("");
      setPhone("");
      setMessage("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900">{t("pages.contacts.title")}</h1>
      <p className="mt-2 text-sm text-gray-500">{t("pages.contacts.intro")}</p>

      <div className="mt-6 rounded-lg border border-gray-100">
        {rows.map((row, i) => (
          <div
            key={row.label}
            className={`flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${
              i > 0 ? "border-t border-gray-100" : ""
            }`}
          >
            <span className="text-sm text-gray-500">{row.label}</span>
            <span className="text-sm font-semibold text-gray-900">{row.value}</span>
          </div>
        ))}
      </div>

      <div className="mt-8 max-w-xl">
        <h2 className="text-xl font-semibold text-gray-900">{t("pages.contacts.formTitle")}</h2>
        <p className="mt-1 text-sm text-gray-500">{t("pages.contacts.formText")}</p>

        {status === "success" ? (
          <div className="mt-5 flex items-center gap-3 rounded-lg border border-green-100 bg-green-50 px-4 py-3">
            <svg viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" className="h-5 w-5 shrink-0">
              <circle cx="12" cy="12" r="10" />
              <path d="m8.5 12 2.5 2.5 5-5" />
            </svg>
            <p className="text-sm font-medium text-green-800">{t("pages.contacts.formSuccess")}</p>
          </div>
        ) : (
          <form onSubmit={(e) => void handleSubmit(e)} className="mt-5 flex flex-col gap-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="contact-name" className="text-sm font-medium text-gray-700">
                  {t("pages.contacts.name")}
                </label>
                <input
                  id="contact-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("pages.contacts.namePlaceholder")}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-[#0071E4]"
                />
              </div>
              <div>
                <label htmlFor="contact-phone" className="text-sm font-medium text-gray-700">
                  {t("pages.contacts.phone")}
                </label>
                <input
                  id="contact-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t("pages.contacts.phonePlaceholder")}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-[#0071E4]"
                />
              </div>
            </div>
            <div>
              <label htmlFor="contact-message" className="text-sm font-medium text-gray-700">
                {t("pages.contacts.message")}
              </label>
              <textarea
                id="contact-message"
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("pages.contacts.messagePlaceholder")}
                className="mt-1 w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-[#0071E4]"
              />
            </div>

            {status === "error" && (
              <p className="text-sm font-medium text-red-500">{t("pages.contacts.formError")}</p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="self-start rounded-lg bg-[#0071E4] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#005bb5] disabled:opacity-60"
            >
              {status === "loading" ? t("common.loading") : t("pages.contacts.send")}
            </button>
          </form>
        )}
      </div>

      <div className="mt-8 flex items-center gap-3">
        {socials.map(({ name, href, icon }) => (
          <a
            key={name}
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={name}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 transition-colors hover:border-gray-300"
          >
            <img src={icon} alt={name} className="h-5 w-5" />
          </a>
        ))}
      </div>
    </div>
  );
}