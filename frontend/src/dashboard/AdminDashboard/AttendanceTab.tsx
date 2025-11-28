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
import "bootstrap/dist/css/bootstrap.min.css";
import { format } from "date-fns";

const AttendanceTab: React.FC = () => {
  const [selectedKindergarten, setSelectedKindergarten] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(new Date());
  const [kindergartens, setKindergartens] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [children, setChildren] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<{ [key: string]: boolean }>({});

  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    const loadKindergartens = async () => {
      try {
        const fetchedKindergartens = await getKindergartens();
        setKindergartens(fetchedKindergartens || []);
      } catch (error) {
        console.error("Failed to load kindergartens:", error);
      }
    };
    loadKindergartens();
  }, [token]);

  useEffect(() => {
    const loadGroups = async () => {
      if (token && selectedKindergarten) {
        try {
          const fetchedGroups =
            await getGroupsByKindergarten(selectedKindergarten);
          setGroups(fetchedGroups || []);
          handleGroupChange(fetchedGroups?.[0]?.id);
        } catch (error) {
          console.error("Failed to load groups:", error);
        }
      } else {
        setGroups([]);
      }
    };
    loadGroups();
  }, [token, selectedKindergarten]);

  const handleKindergartenChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setSelectedKindergarten(event.target.value);
    //setSelectedGroup(null);
    setChildren([]);
    setLessons([]);
    setAttendance({});
  };

  const handleGroupChange = async (group: string) => {
    if (!group) {
      return;
    }
    setSelectedGroup(group);
    try {
      const fetchedChildren = await getChildrenByGroup(group);
      setChildren(fetchedChildren || []);
      await loadLessonsAndAttendance(group, selectedMonth);
    } catch (error) {
      console.error("Failed to load group data:", error);
    }
  };

  const setRowAttendance = (childId: string | number, attended: boolean) => {
    const childKey = String(childId);

    setAttendance((prev) => {
      const updated: { [key: string]: boolean } = { ...prev };

      filteredLessons.forEach((lesson) => {
        const lessonKey = String(lesson.id);
        const key = `${childKey}_${lessonKey}`;
        updated[key] = attended;
      });

      return updated;
    });
  };


  const handleGroupChangeEvent = async (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    handleGroupChange(event.target.value);
  };

  const handleMonthChange = async (date: Date | null) => {
    setSelectedMonth(date);
    if (selectedGroup) {
      await loadLessonsAndAttendance(selectedGroup, date);
    }
  };

  const loadLessonsAndAttendance = async (
    groupId: string,
    month: Date | null,
  ) => {
    if (token && groupId) {
      try {
        const fetchedLessons = await getLessonsByGroup(groupId);
        setLessons(fetchedLessons);

        let fetchedAttendance;
        if (month) {
          const formattedMonth = format(month, "yyyy-MM");
          fetchedAttendance = await getAttendanceByGroupAndMonth(
            groupId,
            formattedMonth,
          );
        } else {
          fetchedAttendance = await getAttendanceByGroup(groupId);
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
          await updateAttendance(childId, lessonId, attended);
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
    return (
      lessonDate.getFullYear() === selectedMonth.getFullYear() &&
      lessonDate.getMonth() === selectedMonth.getMonth()
    );
  });

  return (
    <div className="container mt-5">
      <h2 className="text-3xl mb-4">Apmeklējums</h2>
      <div className="filters mb-4">
        <div className="mt-3 form-group">
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
        <div className="mt-3 form-group">
          <label htmlFor="groupSelect">Izvēlieties grupu:</label>
          <select
            id="groupSelect"
            className="form-control"
            value={selectedGroup || ""}
            onChange={handleGroupChangeEvent}
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
        <div className="mt-3 form-group">
          <label htmlFor="monthSelect">Izvēlieties mēnesi:</label>
          <br />
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
        <div className="attendance-table mt-5" style={{ overflowX: "auto" }}>
            <table className="table table-bordered table-hover">
            <thead className="thead-dark">
              <tr>
              <th style={{ width: "120px" }}>Поставить / снять</th>
              <th>Bērns</th>
              {filteredLessons.map((lesson) => (
                <th key={lesson.id}>
                {lesson.topic} <br />({lesson.date})
                </th>
              ))}
              </tr>
            </thead>
            <tbody>
              {children.map((child) => {
              const allCheckedForChild = filteredLessons.length
                ? filteredLessons.every(
                  (lesson) =>
                  attendance[`${child.id}_${lesson.id}`] === true,
                )
                : false;

              const handleToggleChildRow = () => {
                setRowAttendance(child.id, !allCheckedForChild);
              };

              return (
                <tr key={child.id}>
                <td className="text-center align-middle">
                  <button
                    type="button"
                    className={
                      "btn btn-sm " +
                      (allCheckedForChild
                        ? "btn-success"
                        : filteredLessons.some(
                            (lesson) => attendance[`${child.id}_${lesson.id}`]
                          )
                        ? "btn-warning"
                        : "btn-secondary")
                    }
                    onClick={handleToggleChildRow}
                  >
                    {allCheckedForChild ? "Снять всё" : "Выбрать все"}
                  </button>
                </td>
                <td className="align-middle">
                  {child.firstname} {child.lastname}
                </td>
                {filteredLessons.map((lesson) => (
                  <td key={lesson.id} className="text-center align-middle">
                  <input
                    type="checkbox"
                    checked={
                    attendance[`${child.id}_${lesson.id}`] || false
                    }
                    onChange={() =>
                    handleAttendanceChange(
                      String(child.id),
                      lesson.id?.toString() || "",
                    )
                    }
                    style={{ accentColor: "green" }}
                  />
                  </td>
                ))}
                </tr>
              );
              })}
            </tbody>
            </table>
          <button
            className="btn btn-primary mt-3"
            onClick={saveAttendanceChanges}
          >
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
