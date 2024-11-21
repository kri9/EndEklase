// UserDashboard/UserDashboard.tsx
import React, { useState } from "react";
import AttendanceTab from "./AttendanceTab";
import InvoiceTab from "./InvoicesTab";
import SettingsTab from "./SettingsTab";
import { FaUserCheck, FaFileInvoice, FaCog } from "react-icons/fa";
import "./css/UserDashboard.css";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearAuthToken } from "src/redux/authSlice";

const UserDashboard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState("Посещение");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(clearAuthToken());
    navigate("/login");
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case "Посещение":
        return <AttendanceTab />;
      case "Инвойсы":
        return <InvoiceTab />;
      case "Настройки":
        return <SettingsTab />;
      default:
        return null;
    }
  };

  return (
    <div className="user-dashboard-wrapper">
      <div className="sidebar">
        <h2>eClass</h2>
        <div className="balance">
          <span>Сумма к оплате</span>
          <h3>$12,488.00</h3>
        </div>
        <nav>
          <div
            className={`sidebar-item ${selectedTab === "Посещение" ? "active" : ""}`}
            onClick={() => setSelectedTab("Посещение")}
          >
            <FaUserCheck className="sidebar-icon" />
            <span>Посещение</span>
          </div>
          <div
            className={`sidebar-item ${selectedTab === "Инвойсы" ? "active" : ""}`}
            onClick={() => setSelectedTab("Инвойсы")}
          >
            <FaFileInvoice className="sidebar-icon" />
            <span>Инвойсы</span>
          </div>
          <div
            className={`sidebar-item ${selectedTab === "Настройки" ? "active" : ""}`}
            onClick={() => setSelectedTab("Настройки")}
          >
            <FaCog className="sidebar-icon" />
            <span>Настройки</span>
          </div>
        </nav>
        <button className="logout-button" onClick={handleLogout}>
          Выйти
        </button>
      </div>

      <div className="content">
        <header className="dashboard-header">
          <h1>Добро пожаловать, Родитель!</h1>
          <input type="search" placeholder="Поиск..." />
        </header>
        <div className="tab-content">{renderTabContent()}</div>
      </div>
    </div>
  );
};

export default UserDashboard;