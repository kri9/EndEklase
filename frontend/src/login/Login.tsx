import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/Login.css';
import { fetchFromBackend } from '../api';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validated, setValidated] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [language, setLanguage] = useState('ru');
  const [backendData, setBackendData] = useState('');

  useEffect(() => {
    const loadBackendData = async () => {
      const data = await fetchFromBackend('test2');
      if (data) {
        setBackendData(data.message || 'Нет данных');
      }
    };

    loadBackendData();
  }, []);

  const validateForm = () => {
    let valid = true;
    if (!email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
      setEmailError(language === 'ru' ? 'Неправильный формат email' : 'Nepareizs e-pasta formāts');
      valid = false;
    } else {
      setEmailError('');
    }

    if (password.length < 6) {
      setPasswordError(language === 'ru' ? 'Пароль должен содержать не менее 6 символов' : 'Parolei jābūt vismaz 6 rakstzīmēm');
      valid = false;
    } else {
      setPasswordError('');
    }

    setValidated(true);
    return valid;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (validateForm()) {
      console.log('Форма валидна, отправляем запрос на сервер');
      
      const loginData = {
        email,
        password,
      };

      const response = await fetchFromBackend('login', 'POST', loginData);

      if (response) {
        console.log('Ответ от бэкенда:', response);
        setBackendData(response.message || 'Успешный вход');
      } else {
        setBackendData('Ошибка при попытке входа');
      }
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <div className="language-switcher">
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className="form-select">
            <option value="ru">Русский</option>
            <option value="lv">Latviešu</option>
          </select>
        </div>
        <form className={`needs-validation ${validated ? 'was-validated' : ''}`} noValidate onSubmit={handleSubmit}>
          <h2 className="text-center mb-4">
            {language === 'ru' ? 'Вход в систему' : 'Pieslegties'}
          </h2>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              {language === 'ru' ? 'Email' : 'E-pasts'}
            </label>
            <input
              type="email"
              className={`form-control ${emailError ? 'is-invalid' : ''}`}
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="invalid-feedback">{emailError}</div>
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              {language === 'ru' ? 'Пароль' : 'Parole'}
            </label>
            <input
              type="password"
              className={`form-control ${passwordError ? 'is-invalid' : ''}`}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="invalid-feedback">{passwordError}</div>
          </div>
          <button type="submit" className="btn btn-primary btn-block w-100 shadow-sm">
            {language === 'ru' ? 'Войти' : 'Pieslēgties'}
          </button>
        </form>
        {/* Отображение данных с бэкенда */}
        <div className="backend-response mt-4">
          <p>{language === 'ru' ? 'Ответ с бэкенда:' : 'Atbilde no servera:'} {backendData}</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
