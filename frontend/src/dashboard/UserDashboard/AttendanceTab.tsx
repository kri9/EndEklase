import React, { useState, useEffect } from 'react';
import { getAttendanceByUser } from 'src/api';
import { useSelector } from 'react-redux';
import { RootState } from 'src/redux/store';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import './css/AttendanceTab.css';

const AttendanceTab: React.FC = () => {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(new Date());
  const [loading, setLoading] = useState<boolean>(true);
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    const loadAttendance = async () => {
      if (token) {
        try {
          setLoading(true);
          const fetchedAttendance = await getAttendanceByUser(token);
          console.log('Fetched Attendance:', fetchedAttendance);
          setAttendance(fetchedAttendance || []);
        } catch (error) {
          console.error('Failed to load attendance:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    loadAttendance();
  }, [token]);

  const handleMonthChange = (date: Date | null) => {
    setSelectedMonth(date);
  };

  const filteredAttendance = selectedMonth
    ? attendance.filter((att) => {
        const lessonDate = att.lesson ? new Date(att.lesson.date) : null;
        if (!lessonDate) return false;

        const lessonMonth = format(lessonDate, 'yyyy-MM');
        const selectedMonthFormatted = format(selectedMonth, 'yyyy-MM');

        return lessonMonth === selectedMonthFormatted;
      })
    : attendance;

  return (
    <div className="attendance-tab">
      <header className="header">
        <h2>Отслеживайте посещаемость вашего ребенка.</h2>
      </header>

      <div className="month-select">
        <label htmlFor="month-select">Выберите месяц:</label>
        <div>
          <DatePicker
            selected={selectedMonth}
            onChange={handleMonthChange}
            dateFormat="MMMM yyyy"
            showMonthYearPicker
            showFullMonthYearPicker
            showTwoColumnMonthYearPicker
          />
          <button onClick={() => setSelectedMonth(null)}>Все месяцы</button>
        </div>
      </div>

      <div className="attendance-cards">
        {loading ? (
          <p>Загрузка данных...</p>
        ) : filteredAttendance.length > 0 ? (
          filteredAttendance.map((att) => (
            <div key={att.id} className={`attendance-card ${att.attended ? 'attended' : 'absent'}`}>
              <div className="card-date">{att.lesson ? att.lesson.date : 'Дата неизвестна'}</div>
              <div className="card-subject">{att.lesson ? att.lesson.topic : 'Тема неизвестна'}</div>
              <div className="card-status">
                {att.attended ? 'Присутствовал' : 'Отсутствовал'}
              </div>
            </div>
          ))
        ) : (
          <p>Нет доступных данных о посещаемости.</p>
        )}
      </div>
    </div>
  );
};

export default AttendanceTab;
