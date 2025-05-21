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
  const [selectedTab, setSelectedTab] = useState("Apmeklējums");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(clearAuthToken());
    navigate("/login");
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case "Apmeklējums":
        return <AttendanceTab />;
      case "Rēķini":
        return <InvoiceTab />;
      case "Iestatījumi":
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
          <span>Maksājuma summa</span>
          <h3>$12,488.00</h3>
        </div>
        <nav>
          <div
            className={`sidebar-item ${selectedTab === "Apmeklējums" ? "active" : ""}`}
            onClick={() => setSelectedTab("Apmeklējums")}
          >
            <FaUserCheck className="sidebar-icon" />
            <span>Apmeklējums</span>
          </div>
          <div
            className={`sidebar-item ${selectedTab === "Rēķini" ? "active" : ""}`}
            onClick={() => setSelectedTab("Rēķini")}
          >
            <FaFileInvoice className="sidebar-icon" />
            <span>Rēķini</span>
          </div>
          <div
            className={`sidebar-item ${selectedTab === "Iestatījumi" ? "active" : ""}`}
            onClick={() => setSelectedTab("Iestatījumi")}
          >
            <FaCog className="sidebar-icon" />
            <span>Iestatījumi</span>
          </div>
        </nav>
        <button className="logout-button" onClick={handleLogout}>
          Iziet
        </button>
      </div>

      <div className="content">
        <header className="dashboard-header">
          <h1>Laipni lūdzam, Vecāk!</h1>
          <input type="search" placeholder="Meklēt..." />
        </header>
        <div className="tab-content">{renderTabContent()}</div>
      </div>
    </div>
  );
};

export default UserDashboard;