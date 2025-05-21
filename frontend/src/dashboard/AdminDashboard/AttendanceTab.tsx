import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  getKindergartens,
  getGroupsByKindergarten,
  getChildrenByGroup,
  getLessonsByGroup,
  getAttendanceByGroup,
  getAttendanceByGroupAndMonth,
  updateAttendance,
} from "src/api";
import { useSelector } from "react-redux";
import { RootState } from "src/redux/store";
import 'bootstrap/dist/css/bootstrap.min.css';
import { addMonths, format } from 'date-fns';

const AttendanceTab: React.FC = () => {
  const [selectedKindergarten, setSelectedKindergarten] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(null);
  const [kindergartens, setKindergartens] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [children, setChildren] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<{ [key: string]: boolean }>({});

  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    const loadKindergartens = async () => {
      if (token) {
        try {
          const fetchedKindergartens = await getKindergartens(token);
          setKindergartens(fetchedKindergartens || []);
        } catch (error) {
          console.error("Failed to load kindergartens:", error);
        }
      }
    };
    loadKindergartens();
  }, [token]);

  useEffect(() => {
    const loadGroups = async () => {
      if (token && selectedKindergarten) {
        try {
          const fetchedGroups = await getGroupsByKindergarten(token, selectedKindergarten);
          setGroups(fetchedGroups || []);
        } catch (error) {
          console.error("Failed to load groups:", error);
        }
      } else {
        setGroups([]);
      }
    };
    loadGroups();
  }, [token, selectedKindergarten]);

  const handleKindergartenChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedKindergarten(event.target.value);
    setSelectedGroup(null);
    setChildren([]);
    setLessons([]);
    setAttendance({});
  };

  const handleGroupChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGroup(event.target.value);
    if (token && event.target.value) {
      try {
        const fetchedChildren = await getChildrenByGroup(token, event.target.value);
        setChildren(fetchedChildren || []);

        await loadLessonsAndAttendance(event.target.value, selectedMonth);
      } catch (error) {
        console.error("Failed to load group data:", error);
      }
    }
  };

  const handleMonthChange = async (date: Date | null) => {
    setSelectedMonth(date);
    if (selectedGroup) {
      await loadLessonsAndAttendance(selectedGroup, date);
    }
  };

  const loadLessonsAndAttendance = async (groupId: string, month: Date | null) => {
    if (token && groupId) {
      try {
        const fetchedLessons = await getLessonsByGroup(token, groupId);
        setLessons(fetchedLessons);

        let fetchedAttendance;
        if (month) {
          const formattedMonth = format(month, 'yyyy-MM');
          fetchedAttendance = await getAttendanceByGroupAndMonth(token, groupId, formattedMonth);
        } else {
          fetchedAttendance = await getAttendanceByGroup(token, groupId);
        }

        if (fetchedAttendance) {
          const newAttendance: { [key: string]: boolean } = {};
          fetchedAttendance.forEach((attendanceItem: any) => {
            const key = `${attendanceItem.childId}_${attendanceItem.lessonId}`;
            newAttendance[key] = attendanceItem.attended;
          });
          setAttendance(newAttendance);
        }
      } catch (error) {
        console.error("Failed to load lessons or attendance:", error);
      }
    }
  };

  const handleAttendanceChange = (childId: string, lessonId: string) => {
    const key = `${childId}_${lessonId}`;
    const newStatus = !attendance[key];

    setAttendance((prev) => ({
      ...prev,
      [key]: newStatus,
    }));
  };

  const saveAttendanceChanges = async () => {
    if (token) {
      try {
        for (const key in attendance) {
          const [childId, lessonId] = key.split("_");
          const attended = attendance[key];
          await updateAttendance(token, childId, lessonId, attended);
        }
        alert("Apmeklējums veiksmīgi saglabāts");
      } catch (error) {
        console.error("Failed to update attendance", error);
        alert("Kļūda, saglabājot apmeklējumu");
      }
    }
  };

  const filteredLessons = lessons.filter((lesson) => {
    if (!selectedMonth) return true;
    const lessonDate = new Date(lesson.date);
    return lessonDate.getFullYear() === selectedMonth.getFullYear() && lessonDate.getMonth() === selectedMonth.getMonth();
  });

  return (
    <div className="container mt-5">
      <h2 className="text-3xl mb-4">Apmeklējums</h2>
      <div className="filters mb-4">
        <div className="form-group">
          <label htmlFor="kindergartenSelect">Izvēlieties bērnudārzu:</label>
          <select
            id="kindergartenSelect"
            className="form-control"
            value={selectedKindergarten}
            onChange={handleKindergartenChange}
          >
            <option value="">-- Izvēlieties bērnudārzu --</option>
            {kindergartens.map((kg) => (
              <option key={kg.id} value={kg.id}>
                {kg.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group mt-3">
          <label htmlFor="groupSelect">Izvēlieties grupu:</label>
          <select
            id="groupSelect"
            className="form-control"
            value={selectedGroup || ""}
            onChange={handleGroupChange}
            disabled={!selectedKindergarten}
          >
            <option value="">-- Izvēlieties grupu --</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group mt-3">
          <label htmlFor="monthSelect">Izvēlieties mēnesi:</label>
          <DatePicker
            selected={selectedMonth}
            onChange={handleMonthChange}
            dateFormat="yyyy-MM"
            showMonthYearPicker
            className="form-control"
            placeholderText="-- Visi mēneši --"
          />
        </div>
      </div>

      {filteredLessons.length > 0 && children.length > 0 ? (
        <div className="attendance-table mt-5" style={{ overflowX: 'auto' }}>
          <table className="table table-bordered table-hover">
            <thead className="thead-dark">
              <tr>
                <th>Bērns</th>
                {filteredLessons.map((lesson) => (
                  <th key={lesson.id}>
                    {lesson.topic} <br /> ({lesson.date})
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {children.map((child) => (
                <tr key={child.id}>
                  <td>
                    {child.firstname} {child.lastname}
                  </td>
                  {filteredLessons.map((lesson) => (
                    <td key={lesson.id} className="text-center">
                      <input
                        type="checkbox"
                        checked={attendance[`${child.id}_${lesson.id}`] || false}
                        onChange={() => handleAttendanceChange(child.id, lesson.id?.toString() || "")}
                        style={{ accentColor: "green" }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <button className="btn btn-primary mt-3" onClick={saveAttendanceChanges}>
            Saglabāt apmeklējumu
          </button>
        </div>
      ) : (
        <p>Izvēlieties bērnudārzu un grupu, lai redzētu apmeklējuma datus.</p>
      )}
    </div>
  );
};

export default AttendanceTab;