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
import UserTab from "./UserTab";
import { LessonsTab } from "./LessonsTab";

const AdminDashboard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState("Grupu saraksti");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(clearAuthToken());
    navigate("/login");
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case "Lietotāji":
        return <UserTab />;
      case "Apmeklējums":
        return <AttendanceTab />;
      case "Grupu saraksti":
        return <GroupListTab />;
      case "Kalendārs":
        return <LessonsTab />;
      case "Pievienot nodarbības":
        return <AddLessonTab />;
      case "Grupu pārskati":
        return <ReportsTab />;
      case "Rēķinu izrakstīšana":
        return <InvoicesTab />;
      default:
        return null;
    }
  };

  return (
    <div className="admin-dashboard-wrapper d-flex flex-column w-100 vh-100">
      <div className="d-flex justify-content-between align-items-center">
        <h1>Administratora panelis</h1>
        <button className="btn btn-danger" onClick={handleLogout}>
          Iziet
        </button>
      </div>
      <div className="tabs d-flex">
        {[
          "Lietotāji",
          "Apmeklējums",
          "Grupu saraksti",
          "Pievienot nodarbības",
          "Kalendārs",
          "Grupu pārskati",
          "Rēķinu izrakstīšana",
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
