import React, { useState } from 'react';
import './css/AttendanceTab.css';

interface AttendanceRecord {
    date: string;
    subject: string;
    attended: boolean;
  }
  
  const attendanceData: AttendanceRecord[] = [
    { date: '2024-10-01', subject: 'English', attended: true },
    { date: '2024-10-02', subject: 'Math', attended: false },
    { date: '2024-10-03', subject: 'Science', attended: true },
    { date: '2024-10-04', subject: 'English', attended: true },
    { date: '2024-10-05', subject: 'Math', attended: false },
    { date: '2024-10-06', subject: 'English', attended: true },
  ];
  
  const AttendanceTab: React.FC = () => {
    const [selectedMonth, setSelectedMonth] = useState<string>('2024-10');
  
    const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedMonth(event.target.value);
    };
  
    return (
      <div className="attendance-tab">
        <header className="header">
          <h2>Отслеживайте посещаемость вашего ребенка.</h2>
        </header>
  
        <div className="month-select">
          <label htmlFor="month-select">Выберите месяц:</label>
          <select id="month-select" value={selectedMonth} onChange={handleMonthChange}>
            <option value="2024-10">Октябрь 2024</option>
            <option value="2024-09">Сентябрь 2024</option>
            <option value="2024-08">Август 2024</option>
          </select>
        </div>
  
        <div className="attendance-cards">
          {attendanceData.map((record, index) => (
            <div key={index} className={`attendance-card ${record.attended ? 'attended' : 'absent'}`}>
              <div className="card-date">{record.date}</div>
              <div className="card-subject">{record.subject}</div>
              <div className="card-status">
                {record.attended ? 'Присутствовал' : 'Отсутствовал'}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  export default AttendanceTab;