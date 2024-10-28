// AdminDashboard.tsx
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import AttendanceTab from "./AttendanceTab";
import GroupListTab from "./GroupListTab";
import AddLessonTab from "./AddLessonTab";
import ReportsTab from "./ReportsTab";
import InvoicesTab from "./InvoicesTab";
import { clearAuthToken } from "src/redux/authSlice";
import "./css/AdminDashboard.css";

const AdminDashboard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState("Списки групп");
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
      case "Списки групп":
        return <GroupListTab />;
      case "Добавление уроков":
        return <AddLessonTab />;
      case "Отчеты по группам":
        return <ReportsTab />;
      case "Выставление счетов":
        return <InvoicesTab />;
      default:
        return null;
    }
  };

  return (
    <div className="admin-dashboard-wrapper d-flex flex-column w-100 vh-100">
      <div className="d-flex justify-content-between align-items-center">
        <h1>Панель администратора</h1>
        <button className="btn btn-danger" onClick={handleLogout}>
          Выйти
        </button>
      </div>
      <div className="tabs d-flex">
        {[
          "Посещение",
          "Списки групп",
          "Добавление уроков",
          "Отчеты по группам",
          "Выставление счетов",
        ].map((tab) => (
          <div
            key={tab}
            className={`tab ${selectedTab === tab ? "active" : ""}`}
            onClick={() => setSelectedTab(tab)}
          >
            {tab}
          </div>
        ))}
      </div>
      <div className="tab-content flex-grow-1">{renderTabContent()}</div>
    </div>
  );
};

export default AdminDashboard;
