import React, { useState } from "react";
import { FaUserCircle, FaPhoneAlt, FaGlobe } from "react-icons/fa";
import "./css/SettingsTab.css";

const SettingsTab: React.FC = () => {
  const [language, setLanguage] = useState<string>("Krievu");
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
      <h2>Iestatījumi</h2>

      {/* Profila karte */}
      <div className="profile-card">
        <FaUserCircle className="profile-icon" />
        <div className="profile-info">
          <h3>Lietotāja profils</h3>
          <p>E-pasts: example@email.com</p>
          <p>Vārds: Vecāks Ivanovs</p>
        </div>
      </div>

      {/* Lietotnes valodas izvēle */}
      <div className="settings-option">
        <label htmlFor="language-select">
          <FaGlobe className="icon" />
          Lietotnes valoda:
        </label>
        <select
          id="language-select"
          value={language}
          onChange={handleLanguageChange}
        >
          <option value="Latviešu">Latviešu</option>
          <option value="Krievu">Krievu</option>
          <option value="Angļu">Angļu</option>
        </select>
      </div>

      {/* Telefona numura maiņa */}
      <div className="settings-option">
        <label htmlFor="phone-number">
          <FaPhoneAlt className="icon" />
          Tālruņa numurs:
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
