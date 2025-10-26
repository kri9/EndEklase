import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/AuthPages.css';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaPaperPlane } from 'react-icons/fa';
import { requestPasswordReset } from '../api';

const ForgotPassword: React.FC = () => {
  const [language, setLanguage] = useState<'ru' | 'lv'>('ru');
  const [email, setEmail] = useState('');
  const [validated, setValidated] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [busy, setBusy] = useState(false);
  const [serverMsg, setServerMsg] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  const t = (ru: string, lv: string) => (language === 'ru' ? ru : lv);

  const validate = () => {
    let ok = true;
    if (!email.trim()) {
      setEmailError(t('Email не может быть пустым', 'E-pasts nevar būt tukšs'));
      ok = false;
    } else {
      setEmailError('');
    }
    setValidated(true);
    return ok;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setBusy(true);
      setServerMsg(null);
      await requestPasswordReset(email.trim());

      setServerMsg({
        type: 'success',
        text: t(
          'Если такой email существует, мы отправили на него ссылку для восстановления.',
          'Ja šāds e-pasts pastāv, mēs nosūtījām uz to paroles atjaunošanas saiti.'
        ),
      });
    } catch (err: any) {
      setServerMsg({
        type: 'danger',
        text: t(
          'Не удалось отправить письмо. Попробуйте позже или свяжитесь с поддержкой.',
          'Neizdevās nosūtīt e-pastu. Mēģiniet vēlreiz vai sazinieties ar atbalstu.'
        ),
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        <div className="language-switcher">
          <select value={language} onChange={(e) => setLanguage(e.target.value as 'ru' | 'lv')} className="form-select">
            <option value="ru">Русский</option>
            <option value="lv">Latviešu</option>
          </select>
        </div>

        <form className={`needs-validation ${validated ? 'was-validated' : ''}`} noValidate onSubmit={handleSubmit}>
          <h2 className="text-center mb-4">{t('Восстановление пароля', 'Paroles atjaunošana')}</h2>

          <div className="mb-3 input-group">
            <span className="input-group-text"><FaEnvelope /></span>
            <input
              type="email"
              className={`form-control ${emailError ? 'is-invalid' : ''}`}
              placeholder={t('Введите ваш email', 'Ievadiet savu e-pastu')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="invalid-feedback">{emailError}</div>
          </div>

          <button type="submit" disabled={busy} className="btn btn-primary btn-block w-100 shadow-sm d-flex justify-content-center align-items-center gap-2">
            <FaPaperPlane />
            {busy ? t('Отправка…', 'Nosūtīšana…') : t('Отправить ссылку', 'Nosūtīt saiti')}
          </button>

          <div className="text-center mt-3">
            <Link to="/login" className="text-decoration-none">
              {t('Вернуться к входу', 'Atpakaļ uz pieslēgšanos')}
            </Link>
          </div>

          {serverMsg && (
            <div className={`alert mt-3 alert-${serverMsg.type}`} role="alert">
              {serverMsg.text}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
