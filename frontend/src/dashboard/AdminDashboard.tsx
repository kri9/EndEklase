import React, { useState, useEffect } from "react";
import "./css/AdminDashboard.css";
import {
  addChild,
  getKindergartens,
  getGroupsByKindergarten,
  getChildrenByGroup,
  addLesson,
  getLessonsByGroup,
  updateAttendance
} from "../api";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux/store";
import { clearAuthToken } from "../redux/authSlice";
import { useNavigate } from "react-router-dom";

interface Lesson {
  id?: number;
  topic: string;
  date: string;
  notes?: string;
}

const AdminDashboard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState("Списки групп");
  const [selectedKindergarten, setSelectedKindergarten] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [children, setChildren] = useState<any[]>([]);
  const [kindergartens, setKindergartens] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [newChild, setNewChild] = useState({
    firstname: "",
    lastname: "",
    kindergartenId: "",
    groupId: "",
  });
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [newLesson, setNewLesson] = useState<Lesson>({
    topic: "",
    date: "",
    notes: "",
  });
  const [attendance, setAttendance] = useState<{ [key: string]: boolean }>({});

  const token = useSelector((state: RootState) => state.auth.token);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch kindergartens from backend
    const loadKindergartens = async () => {
      if (token) {
        const fetchedKindergartens = await getKindergartens(token);
        console.log("Fetched Kindergartens:", fetchedKindergartens);
        setKindergartens(fetchedKindergartens || []);
      }
    };
    loadKindergartens();
  }, [token]);

  useEffect(() => {
    // Fetch groups based on selected kindergarten
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
        console.log("Saving attendance changes...");
        // Проходимся по всем изменениям и отправляем их на сервер
        for (const key in attendance) {
          const [childId, lessonId] = key.split('_');
          const attended = attendance[key];
          console.log(`Updating attendance for child ${childId}, lesson ${lessonId} to ${attended}`);
  
          const response = await updateAttendance(token, childId, lessonId, attended);
          console.log(`Response from server for child ${childId}, lesson ${lessonId}:`, response);
        }
        alert("Посещаемость успешно сохранена");
      } catch (error) {
        console.error('Failed to update attendance', error);
        alert("Ошибка при сохранении посещаемости");
      }
    }
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
      console.log("Fetched Children:", fetchedChildren);
      setChildren(fetchedChildren || []);

      await loadLessonsFromBackend(event.target.value as string);
    }
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setNewChild({ ...newChild, [event.target.name]: event.target.value });
  };

  const handleAddChild = async () => {
    if (
      token &&
      newChild.firstname &&
      newChild.lastname &&
      selectedKindergarten &&
      selectedGroup
    ) {
      const response = await addChild(
        token,
        newChild.firstname,
        newChild.lastname,
        selectedKindergarten,
        selectedGroup
      );

      if (response && response.success) {
        alert("Ребенок успешно добавлен");
        setNewChild({
          firstname: "",
          lastname: "",
          kindergartenId: "",
          groupId: "",
        });

        // Обновляем список детей после успешного добавления
        await handleGroupChange({
          target: { value: selectedGroup },
        } as React.ChangeEvent<HTMLSelectElement>);
      } else {
        alert("Ошибка при добавлении ребенка");
      }
    }
  };

  const handleAddLesson = async () => {
    if (newLesson.topic && newLesson.date) {
      if (token && selectedGroup) {
        const response = await addLesson(token, {
          ...newLesson,
          groupId: selectedGroup,
        });
        if (response && response.success) {
          alert("Урок успешно добавлен");
          setNewLesson({ topic: "", date: "", notes: "" });

          await loadLessonsFromBackend(selectedGroup);
        } else {
          alert("Ошибка при добавлении урока");
        }
      }
    }
  };

  const loadLessonsFromBackend = async (groupId: string) => {
    if (token && groupId) {
      const fetchedLessons = await getLessonsByGroup(token, groupId);
      console.log("Fetched Lessons:", fetchedLessons);

      if (Array.isArray(fetchedLessons)) {
        setLessons(fetchedLessons);
      } else {
        console.error("Unexpected response format:", fetchedLessons);
      }
    }
  };

  const handleLogout = () => {
    dispatch(clearAuthToken());
    navigate("/login");
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case "Посещение":
        return (
          <div>
            <h2>Посещение</h2>
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
              case "Списки групп":
        return (
          <div>
            <h2>Списки групп</h2>
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

            <div className="children-list">
              <h3>Дети в группе:</h3>
              {children.length > 0 ? (
                <table className="table table-bordered mt-3">
                  <thead>
                    <tr>
                      <th>Имя</th>
                      <th>Фамилия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {children.map((child) => (
                      <tr key={child.id}>
                        <td>{child.firstname}</td>
                        <td>{child.lastname}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>Выберите садик и группу, чтобы увидеть список детей.</p>
              )}
            </div>

            <div className="add-child-form mt-5">
              <h3>Добавить ребенка</h3>
              <div className="form-group">
                <label htmlFor="firstname">Имя:</label>
                <input
                  type="text"
                  id="firstname"
                  name="firstname"
                  className="form-control"
                  value={newChild.firstname}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group mt-3">
                <label htmlFor="lastname">Фамилия:</label>
                <input
                  type="text"
                  id="lastname"
                  name="lastname"
                  className="form-control"
                  value={newChild.lastname}
                  onChange={handleInputChange}
                />
              </div>
              <button className="btn btn-primary mt-3" onClick={handleAddChild}>
                Добавить ребенка
              </button>
            </div>
          </div>
        );
      case "Добавление уроков":
        return (
          <div>
            <h2>Добавление уроков</h2>
            <div className="filters mb-4">
              <div className="form-group">
                <label htmlFor="kindergartenSelectForLesson">
                  Выберите садик:
                </label>
                <select
                  id="kindergartenSelectForLesson"
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
                <label htmlFor="groupSelectForLesson">Выберите группу:</label>
                <select
                  id="groupSelectForLesson"
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
            <div className="add-lesson-form mt-4">
              <div className="form-group">
                <label htmlFor="lessonTopic">Тема урока:</label>
                <input
                  type="text"
                  id="lessonTopic"
                  name="topic"
                  className="form-control"
                  value={newLesson.topic}
                  onChange={(e) =>
                    setNewLesson({ ...newLesson, topic: e.target.value })
                  }
                />
              </div>
              <div className="form-group mt-3">
                <label htmlFor="lessonDate">Дата урока:</label>
                <input
                  type="date"
                  id="lessonDate"
                  name="date"
                  className="form-control"
                  value={newLesson.date}
                  onChange={(e) =>
                    setNewLesson({ ...newLesson, date: e.target.value })
                  }
                />
              </div>
              <div className="form-group mt-3">
                <label htmlFor="lessonNotes">Заметки:</label>
                <textarea
                  id="lessonNotes"
                  name="notes"
                  className="form-control"
                  value={newLesson.notes}
                  onChange={(e) =>
                    setNewLesson({ ...newLesson, notes: e.target.value })
                  }
                />
              </div>
              <button
                className="btn btn-primary mt-3"
                onClick={handleAddLesson}
                disabled={!selectedGroup}
              >
                Добавить урок
              </button>
            </div>

            <div className="weekly-schedule mt-5">
              <h3>Расписание на неделю</h3>
              <div className="schedule">
                {lessons.length > 0 ? (
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Дата</th>
                        <th>Тема</th>
                        <th>Заметки</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lessons.map((lesson) => (
                        <tr key={lesson.id}>
                          <td>{lesson.date}</td>
                          <td>{lesson.topic}</td>
                          <td>{lesson.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>Нет уроков на эту неделю.</p>
                )}
              </div>
            </div>
          </div>
        );
      case "Отчеты по группам":
        return <p>Отчеты по группам.</p>;
      case "Выставление счетов":
        return <p>Выставление счетов.</p>;
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
