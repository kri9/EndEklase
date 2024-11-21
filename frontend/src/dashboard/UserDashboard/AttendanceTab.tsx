import React, { useState, useEffect } from "react";
import { getAttendanceByUser } from "src/api";
import { useSelector } from "react-redux";
import { RootState } from "src/redux/store";

const AttendanceTab: React.FC = () => {
  const [attendance, setAttendance] = useState<any[]>([]);
  const token = useSelector((state: RootState) => state.auth.token);
  const userId = useSelector((state: RootState) => state.auth.user?.id);

  useEffect(() => {
    const loadAttendance = async () => {
      if (token && userId) {
        try {
          const fetchedAttendance = await getAttendanceByUser(token, userId);
          console.log("Fetched Attendance:", fetchedAttendance);
          setAttendance(fetchedAttendance || []);
        } catch (error) {
          console.error("Failed to load attendance:", error);
        }
      }
    };
    loadAttendance();
  }, [token, userId]);

  return (
    <div className="container mt-5">
      <h2 className="text-3xl mb-4">Посещение</h2>
      {attendance.length > 0 ? (
        <table className="table table-bordered table-hover">
          <thead className="thead-dark">
            <tr>
              <th>ID</th>
              <th>Дата</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((att) => (
              <tr key={att.id}>
                <td>{att.id}</td>
                <td>{att.lesson.date}</td>
                <td>{att.attended ? "Посетил" : "Отсутствовал"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Нет доступных данных о посещаемости.</p>
      )}
    </div>
  );
};

export default AttendanceTab;