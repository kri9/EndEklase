import React, { useMemo, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/AuthPages.css';
import { useSearchParams, Link } from 'react-router-dom';
import { FaLock, FaEye, FaEyeSlash, FaSave } from 'react-icons/fa';
import { resetPassword } from '../api';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);

  const [language, setLanguage] = useState<'ru' | 'lv'>('ru');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [show, setShow] = useState(false);
  const [validated, setValidated] = useState(false);
  const [passError, setPassError] = useState('');
  const [pass2Error, setPass2Error] = useState('');
  const [busy, setBusy] = useState(false);
  const [serverMsg, setServerMsg] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  const t = (ru: string, lv: string) => (language === 'ru' ? ru : lv);

  const validate = () => {
    let ok = true;
    if (password.length < 6) {
      setPassError(t('Пароль должен содержать не менее 6 символов', 'Parolei jābūt vismaz 6 rakstzīmēm'));
      ok = false;
    } else {
      setPassError('');
    }
    if (password2 !== password) {
      setPass2Error(t('Пароли не совпадают', 'Paroles nesakrīt'));
      ok = false;
    } else {
      setPass2Error('');
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
      await resetPassword(token, password);
      setServerMsg({
        type: 'success',
        text: t('Пароль успешно изменён! Теперь вы можете войти.', 'Parole veiksmīgi nomainīta! Tagad varat pieslēgties.'),
      });
      setPassword('');
      setPassword2('');
    } catch (err: any) {
      setServerMsg({
        type: 'danger',
        text: t('Не удалось изменить пароль. Ссылка могла истечь.', 'Neizdevās nomainīt paroli. Saite var būt beigusies.'),
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
          <h2 className="text-center mb-4">{t('Введите новый пароль', 'Ievadiet jauno paroli')}</h2>

          <div className="mb-3 input-group">
            <span className="input-group-text"><FaLock /></span>
            <input
              type={show ? 'text' : 'password'}
              className={`form-control ${passError ? 'is-invalid' : ''}`}
              placeholder={t('Новый пароль', 'Jaunā parole')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <button
              type="button"
              className="btn btn-outline-secondary toggle-visibility-btn"
              onClick={() => setShow(s => !s)}
              aria-label={show ? t('Скрыть пароль', 'Slēpt paroli') : t('Показать пароль', 'Rādīt paroli')}
            >
              {show ? <FaEyeSlash /> : <FaEye />}
            </button>
            <div className="invalid-feedback">{passError}</div>
          </div>

          <div className="mb-3 input-group">
            <span className="input-group-text"><FaLock /></span>
            <input
              type={show ? 'text' : 'password'}
              className={`form-control ${pass2Error ? 'is-invalid' : ''}`}
              placeholder={t('Повторите пароль', 'Atkārtojiet paroli')}
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              required
              minLength={6}
            />
            <div className="invalid-feedback">{pass2Error}</div>
          </div>

          <button type="submit" disabled={busy} className="btn btn-primary btn-block w-100 shadow-sm d-flex justify-content-center align-items-center gap-2">
            <FaSave />
            {busy ? t('Сохранение…', 'Saglabāšana…') : t('Сохранить', 'Saglabāt')}
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

export default ResetPassword;
