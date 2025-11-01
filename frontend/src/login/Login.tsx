import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/Login.css';
import { fetchFromBackend, fetchFromBackendWithAuth } from '../api';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAuthToken } from '../redux/authSlice';
import { FaEnvelope, FaLock } from 'react-icons/fa';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validated, setValidated] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [language, setLanguage] = useState('ru');
  // const [backendData, setBackendData] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const validateForm = () => {
    let valid = true;
    if (email.length === 0) {
      setEmailError(language === 'ru' ? 'Email не может быть пустым' : 'E-pasts nevar būt tukšs');
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
      const loginData = {
        username: email,
        password,
      };
      const response = await fetchFromBackend('login', 'POST', loginData);
      if (response && response.token) {
        // setBackendData(response.message || 'Успешный вход');
        dispatch(setAuthToken(response.token));
        const isAdminResponse = await fetchFromBackendWithAuth('isadmin', 'GET', response.token);
        navigate(isAdminResponse === true ? '/admin-dashboard' : '/dashboard');
      } 
        // setBackendData('Ошибка при попытке входа');
      
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
            {language === 'ru' ? 'Вход в систему' : 'Pieslēgties'}
          </h2>
          <div className="mb-3 input-group">
            <span className="input-group-text"><FaEnvelope /></span>
            <input
              type="text"
              className={`form-control ${emailError ? 'is-invalid' : ''}`}
              placeholder={language === 'ru' ? 'Email' : 'E-pasts'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="invalid-feedback">{emailError}</div>
          </div>
          <div className="mb-3 input-group">
            <span className="input-group-text"><FaLock /></span>
            <input
              type="password"
              className={`form-control ${passwordError ? 'is-invalid' : ''}`}
              placeholder={language === 'ru' ? 'Пароль' : 'Parole'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="invalid-feedback">{passwordError}</div>
          </div>
          <button type="submit" className="btn btn-primary btn-block w-100 shadow-sm">
            {language === 'ru' ? 'Войти' : 'Pieslēgties'}
          </button>

          <div className="text-center mt-3">
            <Link to="/forgot-password" className="text-decoration-none">
              {language === 'ru' ? 'Забыли пароль?' : 'Aizmirsāt paroli?'}
            </Link>
          </div>

        </form>
        {/* <div className="backend-response mt-4">
          <p>{language === 'ru' ? 'Ответ с бэкенда:' : 'Atbilde no servera:'} {backendData}</p>
        </div> */}
      </div>
    </div>
  );
};

export default Login;
