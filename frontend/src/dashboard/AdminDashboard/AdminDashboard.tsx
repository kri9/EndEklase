// AdminDashboard.tsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import { RootState } from "src/redux/store";
import { SessionExtendPopup } from "./common/SessionExtendPopup";
import { parseJwt } from "src/UTILS/jwtUtils";
import { refreshJwtToken } from "src/api";

const AdminDashboard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState("Grupu saraksti");
  const [showSessionPopup, setShowSessionPopup] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state: RootState) => state.auth.token);


  const handleLogout = () => {
    dispatch(clearAuthToken());
    navigate("/login");
  };

  useEffect(() => {
    if (!token) {
      setShowSessionPopup(false);
      setRemainingSeconds(null);
      return;
    }

    const payload = parseJwt(token);
    if (!payload || !payload.exp) {
      return;
    }

    const expMs = payload.exp * 1000;
    const nowMs = Date.now();

    const warnBeforeMs = 5 * 60 * 1000;
    const timeToWarning = expMs - nowMs - warnBeforeMs;

    if (timeToWarning <= 0) {
      setShowSessionPopup(true);
      const remaining = Math.max(0, Math.floor((expMs - nowMs) / 1000));
      setRemainingSeconds(remaining);
    } else {
      const warningTimeout = window.setTimeout(() => {
        setShowSessionPopup(true);
      }, timeToWarning);

      const interval = window.setInterval(() => {
        const now = Date.now();
        const remaining = Math.floor((expMs - now) / 1000);
        if (remaining <= 0) {
          setRemainingSeconds(0);
          window.clearInterval(interval);
          return;
        }
        setRemainingSeconds(remaining);
      }, 1000);

      return () => {
        window.clearTimeout(warningTimeout);
        window.clearInterval(interval);
      };
    }
  }, [token]);

  const handleExtendSession = async () => {
    try {
      await refreshJwtToken();
      setShowSessionPopup(false);
    } catch (e) {
      console.error("Не удалось обновить токен", e);
      handleLogout();
    }
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

      <SessionExtendPopup
        visible={showSessionPopup}
        remainingSeconds={remainingSeconds}
        onExtend={handleExtendSession}
        onLogout={handleLogout}
      />
    </div>
  );

};

export default AdminDashboard;
