import React, { useState, useEffect } from "react";
import "./css/AdminDashboard.css";
import {
  addChild,
  getKindergartens,
  getGroupsByKindergarten,
  getChildrenByGroup,
  addLesson,
  getLessonsByGroup,
  updateAttendance,
  getAttendanceByGroup,
  fetchFromBackendWithAuth,
  getRequest,
  postRequest
} from "../api";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux/store";
import { clearAuthToken } from "../redux/authSlice";
import { useNavigate } from "react-router-dom";
import Autosuggest from 'react-autosuggest';

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
  const [newInvoice, setNewInvoice] = useState({
    fullName: "",
    userId: 0,
    dateIssued: "",
    dueDate: "",
    amount: "",
    status: "",
  });
  const [attendance, setAttendance] = useState<{ [key: string]: boolean }>({});
  const [usersInfo, setUsersInfo] = useState<{ id: number, fullName: string }[]>([]);
  const [userSuggestions, setUserSuggestions] = useState<{ text: string }[]>([]);

  const token = useSelector((state: RootState) => state.auth.token);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const updateSuggestions = () => setUserSuggestions(usersInfo
    .map(ui => ui.fullName)
    .filter(e => e.toLowerCase().includes(newInvoice.fullName.toLowerCase()) && e != newInvoice.fullName)
    .map(e => ({ text: e })))

  useEffect(() => {
    getRequest<{ id: number, fullName: string }[]>('admin/user-emails').then(setUsersInfo);
  }, []);
  useEffect(() => updateSuggestions(), [usersInfo, newInvoice.fullName])

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
  const inputProps = {
    placeholder: "Enter text",
    onChange: (v: any, { newValue, method }: { newValue: string, method: any }) => {
      setNewInvoice({ ...newInvoice, ['fullName']: newValue });
    },
    value: newInvoice.fullName,
    id: "fullName",
    name: "fullName",
  }

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

  const saveInvoice = () => {
    const userId = usersInfo.filter(u => u.fullName == newInvoice.fullName)[0].id;
    newInvoice.userId = userId;
    postRequest('admin/invoice', newInvoice)
    setNewInvoice({ fullName: "", userId: 0, dateIssued: "", dueDate: "", amount: "", status: "" })
    alert('Счёт успешно сохранён');
  }

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

      // Загрузка данных о посещаемости
      const fetchedAttendance = await getAttendanceByGroup(token, event.target.value);
      console.log("Fetched Attendance:", fetchedAttendance);

      // Установите состояние посещаемости
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

  const handleInvoiceInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setNewInvoice({ ...newInvoice, [event.target.name]: event.target.value });
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
        return (
          <div className="invoice-management mt-5">
            <h2>Выставление счетов</h2>

            <div className="invoice-form mt-4">
              <h3>Добавить новый счет</h3>
              <div className="form-group">
                <label htmlFor="userId">Имя Пользователя:</label>
                <Autosuggest
                  suggestions={userSuggestions}
                  onSuggestionsFetchRequested={updateSuggestions}
                  onSuggestionsClearRequested={() => setUserSuggestions([])}
                  getSuggestionValue={s => s.text}
                  renderSuggestion={s => (<div>{s.text}</div>)}
                  inputProps={inputProps}
                />
              </div>
              <div className="form-group mt-3">
                <label htmlFor="dateIssued">Дата выставления:</label>
                <input
                  type="date"
                  id="dateIssued"
                  name="dateIssued"
                  className="form-control"
                  value={newInvoice.dateIssued}
                  onChange={handleInvoiceInputChange}
                />
              </div>
              <div className="form-group mt-3">
                <label htmlFor="dueDate">Дата оплаты:</label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  className="form-control"
                  value={newInvoice.dueDate}
                  onChange={handleInvoiceInputChange}
                />
              </div>
              <div className="form-group mt-3">
                <label htmlFor="amount">Сумма:</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  className="form-control"
                  value={newInvoice.amount}
                  onChange={handleInvoiceInputChange}
                />
              </div>
              <div className="form-group mt-3">
                <label htmlFor="status">Статус:</label>
                <select
                  id="status"
                  name="status"
                  className="form-control"
                  value={newInvoice.status}
                  onChange={handleInvoiceInputChange}
                >
                  <option value="">-- Выберите статус --</option>
                  <option value="NOT_PAID">Неоплачен</option>
                  <option value="PAID">Оплачен</option>
                  <option value="EXPIRED">Просрочен</option>
                </select>
              </div>
              <button onClick={saveInvoice} className="btn btn-primary mt-3">
                Выставить счет
              </button>
            </div>

            <div className="invoice-list mt-5">
              <h3>Список счетов</h3>
              <div className="form-group mt-3">
                <label htmlFor="searchByName">Поиск по имени или фамилии:</label>
                <input
                  type="text"
                  id="searchByName"
                  name="searchByName"
                  className="form-control"
                  placeholder="Введите имя или фамилию"
                />
              </div>
              <div className="form-group mt-3">
                <label htmlFor="searchByDate">Поиск по дате выставления:</label>
                <input
                  type="date"
                  id="searchByDate"
                  name="searchByDate"
                  className="form-control"
                />
              </div>
              <button className="btn btn-primary mt-3">Искать</button>

              <div className="invoice-table mt-4">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>ID Счета</th>
                      <th>Имя пользователя</th>
                      <th>Дата выставления</th>
                      <th>Дата оплаты</th>
                      <th>Сумма</th>
                      <th>Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* fetch data  from backend ;) Drewman*/}
                    <tr>
                      <td>1</td>
                      <td>Иван Иванов</td>
                      <td>2024-10-10</td>
                      <td>2024-10-20</td>
                      <td>500</td>
                      <td>Неоплачен</td>
                    </tr>
                    <tr>
                      <td>2</td>
                      <td>Петр Петров</td>
                      <td>2024-10-11</td>
                      <td>2024-10-25</td>
                      <td>300</td>
                      <td>Оплачен</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
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
