import React, { useState } from "react";
import { FaUserCircle, FaPhoneAlt, FaGlobe } from "react-icons/fa";
import "./css/SettingsTab.css";

const SettingsTab: React.FC = () => {
  const [language, setLanguage] = useState<string>("Русский");
  const [phoneNumber, setPhoneNumber] = useState<string>("+3712*******");

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(event.target.value);
  };

  const handlePhoneNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (/^\+3712\d{0,7}$/.test(value) || value === "+3712*******") {
      setPhoneNumber(value);
    }
  };

  return (
    <div className="settings-tab">
      <h2>Настройки</h2>

      {/* Карточка профиля */}
      <div className="profile-card">
        <FaUserCircle className="profile-icon" />
        <div className="profile-info">
          <h3>Профиль пользователя</h3>
          <p>Email: example@email.com</p>
          <p>Имя: Родитель Иванов</p>
        </div>
      </div>

      {/* Выбор языка */}
      <div className="settings-option">
        <label htmlFor="language-select">
          <FaGlobe className="icon" />
          Язык приложения:
        </label>
        <select
          id="language-select"
          value={language}
          onChange={handleLanguageChange}
        >
          <option value="Латышский">Латышский</option>
          <option value="Русский">Русский</option>
          <option value="Английский">Английский</option>
        </select>
      </div>

      {/* Смена номера телефона */}
      <div className="settings-option">
        <label htmlFor="phone-number">
          <FaPhoneAlt className="icon" />
          Номер телефона:
        </label>
        <input
          type="tel"
          id="phone-number"
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          maxLength={12}
          placeholder="+3712*******"
        />
      </div>
    </div>
  );
};

export default SettingsTab;
