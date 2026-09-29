import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/auth";

export default function Login() {
  const { t } = useTranslation();
  const { lang } = useParams();
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={`/${lang}/account`} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(username, password);
      navigate(`/${lang}/account`, { replace: true });
    } catch {
      setError(t("auth.credentialsError"));
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass =
    "w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-[#0071E4]";
  const submitClass =
    "w-full rounded-lg bg-[#0071E4] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#005bb5] disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <div className="container mx-auto flex justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900">{t("auth.loginTitle")}</h1>
        <p className="mt-2 text-sm text-gray-500">{t("auth.loginSubtitle")}</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
            {t("auth.username")}
            <input
              type="text"
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
            {t("auth.password")}
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={fieldClass}
            />
          </label>

          {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={submitting} className={submitClass}>
            {submitting ? t("common.loading") : t("auth.login")}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-600">
          {t("auth.noAccount")}{" "}
          <Link to={`/${lang}/register`} className="font-semibold text-[#0071E4] hover:text-[#005bb5]">
            {t("auth.register")}
          </Link>
        </p>
      </div>
    </div>
  );
}