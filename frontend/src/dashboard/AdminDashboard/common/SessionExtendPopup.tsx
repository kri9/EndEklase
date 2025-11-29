import React from "react";
import "src/dashboard/AdminDashboard/css/SessionExtendPopup.css";

interface SessionExtendPopupProps {
  visible: boolean;
  remainingSeconds: number | null;
  onExtend: () => void;
  onLogout: () => void;
}

export const SessionExtendPopup: React.FC<SessionExtendPopupProps> = ({
  visible,
  remainingSeconds,
  onExtend,
  onLogout,
}) => {
  if (!visible) return null;

  const minutes =
    remainingSeconds !== null
      ? Math.max(0, Math.floor(remainingSeconds / 60))
      : null;

  return (
    <div className="session-popup-backdrop">
      <div className="session-popup">
        <h3>Сеанс скоро завершится</h3>
        {minutes !== null && (
          <p>
            Ваша sеанс истекает примерно через{" "}
            <strong>{minutes}</strong> мин.
          </p>
        )}
        <p>Продлить сессию или выйти?</p>
        <div className="session-popup-buttons">
          <button className="btn btn-primary" onClick={onExtend}>
            Продлить сессию
          </button>
          <button className="btn btn-primary" onClick={onLogout}>
            Выйти
          </button>
        </div>
      </div>
    </div>
  );
};
