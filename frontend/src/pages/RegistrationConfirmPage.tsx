import React, { useEffect, useMemo, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "src/resetpass/css/AuthPages.css";
import { useSearchParams, Link } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { registrationConfirm } from "src/api";

const RegistrationConfirmPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [language, setLanguage] = useState<"ru" | "lv">("ru");
  const [busy, setBusy] = useState(true);
  const [result, setResult] = useState<"ok" | "fail" | null>(null);

  const t = (ru: string, lv: string) => (language === "ru" ? ru : lv);

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setResult("fail");
        setBusy(false);
        return;
      }
      try {
        setBusy(true);
        await registrationConfirm(token);
        setResult("ok");
      } catch {
        setResult("fail");
      } finally {
        setBusy(false);
      }
    };
    run();
  }, [token]);

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        <div className="language-switcher">
          <select value={language} onChange={(e) => setLanguage(e.target.value as any)} className="form-select">
            <option value="ru">Русский</option>
            <option value="lv">Latviešu</option>
          </select>
        </div>

        <div className="text-center">
          <h2 className="mb-3">{t("Подтверждение e-mail", "E-pasta apstiprināšana")}</h2>

          {busy && <div className="alert alert-secondary">{t("Проверяем ссылку…", "Pārbaudām saiti…")}</div>}

          {!busy && result === "ok" && (
            <div className="alert alert-success d-flex align-items-center justify-content-center gap-2">
              <FaCheckCircle />
              {t(
                "E-mail подтверждён! Ваша заявка отправлена администратору на подтверждение.",
                "E-pasts apstiprināts! Jūsu pieteikums nosūtīts administratoram apstiprināšanai."
              )}
            </div>
          )}

          {!busy && result === "fail" && (
            <div className="alert alert-danger d-flex align-items-center justify-content-center gap-2">
              <FaTimesCircle />
              {t(
                "Ссылка недействительна или истекла. Попробуйте отправить заявку заново.",
                "Saite nav derīga vai ir beigusies. Mēģiniet iesniegt pieteikumu vēlreiz."
              )}
            </div>
          )}

          <div className="mt-3">
            <Link to="/login" className="text-decoration-none">
              {t("Перейти к входу", "Doties uz pieslēgšanos")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationConfirmPage;
