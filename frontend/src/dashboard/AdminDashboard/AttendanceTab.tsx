import React, { useState, useEffect } from "react";
import {
  getKindergartens,
  getGroupsByKindergarten,
  getChildrenByGroup,
  getLessonsByGroup,
  getAttendanceByGroup,
  updateAttendance,
} from "src/api";
import { useSelector } from "react-redux";
import { RootState } from "src/redux/store";

const AttendanceTab: React.FC = () => {
  const [selectedKindergarten, setSelectedKindergarten] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [kindergartens, setKindergartens] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [children, setChildren] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<{ [key: string]: boolean }>({});

  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    const loadKindergartens = async () => {
      if (token) {
        const fetchedKindergartens = await getKindergartens(token);
        setKindergartens(fetchedKindergartens || []);
      }
    };
    loadKindergartens();
  }, [token]);

  useEffect(() => {
    const loadGroups = async () => {
      if (token && selectedKindergarten) {
        const fetchedGroups = await getGroupsByKindergarten(
          token,
          selectedKindergarten
        );
        setGroups(fetchedGroups || []);
      } else {
        setGroups([]);
      }
    };
    loadGroups();
  }, [token, selectedKindergarten]);

  const handleKindergartenChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedKindergarten(event.target.value);
    setSelectedGroup("");
    setChildren([]);
    setLessons([]);
  };

  const handleGroupChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedGroup(event.target.value);
    if (token && event.target.value) {
      const fetchedChildren = await getChildrenByGroup(
        token,
        event.target.value
      );
      setChildren(fetchedChildren || []);

      await loadLessonsFromBackend(event.target.value as string);

      const fetchedAttendance = await getAttendanceByGroup(
        token,
        event.target.value
      );

      if (fetchedAttendance) {
        const newAttendance: { [key: string]: boolean } = {};
        fetchedAttendance.forEach((attendanceItem: any) => {
          const key = `${attendanceItem.childId}_${attendanceItem.lessonId}`;
          newAttendance[key] = attendanceItem.attended;
        });
        setAttendance(newAttendance);
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
        alert("Посещаемость успешно сохранена");
      } catch (error) {
        console.error("Failed to update attendance", error);
        alert("Ошибка при сохранении посещаемости");
      }
    }
  };

  const loadLessonsFromBackend = async (groupId: string) => {
    if (token && groupId) {
      const fetchedLessons = await getLessonsByGroup(token, groupId);
      if (Array.isArray(fetchedLessons)) {
        setLessons(fetchedLessons);
      }
    }
  };

  return (
    <div>
      <h2 className="text-3xl">Посещение</h2>
      <div className="filters mb-4">
        <div className="form-group">
          <label htmlFor="kindergartenSelect">Выберите садик:</label>
          <select
            id="kindergartenSelect"
            className="form-control"
            value={selectedKindergarten}
            onChange={handleKindergartenChange}
          >
            <option value="">-- Выберите садик --</option>
            {kindergartens.map((kg) => (
              <option key={kg.id} value={kg.id}>
                {kg.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group mt-3">
          <label htmlFor="groupSelect">Выберите группу:</label>
          <select
            id="groupSelect"
            className="form-control"
            value={selectedGroup}
            onChange={handleGroupChange}
            disabled={!selectedKindergarten}
          >
            <option value="">-- Выберите группу --</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {lessons.length > 0 && children.length > 0 ? (
        <div className="attendance-table mt-5">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Ребенок</th>
                {lessons.map((lesson) => (
                  <th key={lesson.id}>
                    {lesson.topic} ({lesson.date})
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
                  {lessons.map((lesson) => (
                    <td key={lesson.id} className="text-center">
                      <input
                        type="checkbox"
                        checked={
                          attendance[`${child.id}_${lesson.id}`] || false
                        }
                        onChange={() =>
                          handleAttendanceChange(
                            child.id,
                            lesson.id?.toString() || ""
                          )
                        }
                        style={{ accentColor: "green" }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <button
            className="btn btn-primary mt-3"
            onClick={saveAttendanceChanges}
          >
            Сохранить посещаемость
          </button>
        </div>
      ) : (
        <p>Выберите садик и группу, чтобы увидеть данные по посещению.</p>
      )}
    </div>
  );
};

export default AttendanceTab;

