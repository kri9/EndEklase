import React, { useState, useEffect } from "react";
import Autosuggest from "react-autosuggest";
import { useSelector } from "react-redux";
import { getInvoices, getRequest, postRequest } from "src/api";
import { RootState } from "src/redux/store";

const InvoicesTab: React.FC = () => {
  const [newInvoice, setNewInvoice] = useState({
    fullName: "",
    userId: 0,
    dateIssued: "",
    dueDate: "",
    amount: "",
    status: "",
    lessons: [] as any[],
  });
  const [usersInfo, setUsersInfo] = useState<
    { id: number; fullName: string }[]
  >([]);
  const [userSuggestions, setUserSuggestions] = useState<{ text: string }[]>(
    []
  );
  const [invoices, setInvoices] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<number | "">("");
  const [filters, setFilters] = useState({
    fullName: "",
    dateIssuedFrom: "",
    dateIssuedTo: "",
    dueDateFrom: "",
    dueDateTo: "",
    status: "",
  });
  const [editingInvoiceId, setEditingInvoiceId] = useState<number | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | "">("");
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    getRequest<{ id: number; fullName: string }[]>("admin/user-emails").then(
      setUsersInfo
    );
    loadInvoices();
    loadLessons();
    loadGroups();
  }, []);

  const loadInvoices = async () => {
    if (token) {
      const fetchedInvoices = await getInvoices(token);
      setInvoices(fetchedInvoices || []);
    }
  };

  const loadLessons = async () => {
    if (token) {
      const fetchedLessons = await getRequest<any[]>("admin/lessons");
      setLessons(fetchedLessons || []);
    }
  };

  const loadGroups = async () => {
    if (token) {
      const fetchedGroups = await getRequest<any[]>("admin/groups");
      setGroups(fetchedGroups || []);
    }
  };

  const updateSuggestions = ({ value }: { value: string }) => {
    setUserSuggestions(
      usersInfo
        .map((ui) => ui.fullName)
        .filter(
          (e) =>
            e.toLowerCase().includes(value.toLowerCase()) &&
            e !== newInvoice.fullName
        )
        .map((e) => ({ text: e }))
    );
  };

  const inputProps = {
    placeholder: "Введите имя пользователя",
    onChange: (event: any, { newValue }: { newValue: string; method: any }) => {
      setNewInvoice({ ...newInvoice, ["fullName"]: newValue });
    },
    value: newInvoice.fullName,
    id: "fullName",
    name: "fullName",
    className: "form-control",
  };

  const addLesson = () => {
    if (selectedLessonId) {
      const lesson = lessons.find((l) => l.id === selectedLessonId);
      if (lesson && !newInvoice.lessons.some((l) => l.id === lesson.id)) {
        setNewInvoice({
          ...newInvoice,
          lessons: [...newInvoice.lessons, lesson],
        });
      }
    }
  };

  const removeLesson = (lessonId: number) => {
    setNewInvoice({
      ...newInvoice,
      lessons: newInvoice.lessons.filter((lesson) => lesson.id !== lessonId),
    });
  };

  const saveInvoice = () => {
    const user = usersInfo.find((u) => u.fullName === newInvoice.fullName);
    if (user) {
      newInvoice.userId = user.id;
      postRequest("admin/invoice", newInvoice).then(() => {
        setNewInvoice({
          fullName: "",
          userId: 0,
          dateIssued: "",
          dueDate: "",
          amount: "",
          status: "",
          lessons: [],
        });
        alert("Счёт успешно сохранён");
        loadInvoices();
      });
    } else {
      alert("Пользователь не найден");
    }
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filteredInvoices = invoices.filter((invoice) => {
    return (
      (!filters.fullName ||
        invoice.userFullName
          .toLowerCase()
          .includes(filters.fullName.toLowerCase())) &&
      (!filters.dateIssuedFrom ||
        new Date(invoice.dateIssued) >= new Date(filters.dateIssuedFrom)) &&
      (!filters.dateIssuedTo ||
        new Date(invoice.dateIssued) <= new Date(filters.dateIssuedTo)) &&
      (!filters.dueDateFrom ||
        new Date(invoice.dueDate) >= new Date(filters.dueDateFrom)) &&
      (!filters.dueDateTo ||
        new Date(invoice.dueDate) <= new Date(filters.dueDateTo)) &&
      (!filters.status || invoice.status === filters.status)
    );
  });

  const generateInvoices = () => {
    // Логика генерации счетов за период
    alert("Счета успешно сгенерированы");
  };

  const startEditing = (invoice: any) => {
    setEditingInvoiceId(invoice.id);
    setEditingInvoice({ ...invoice });
  };

  const cancelEditing = () => {
    setEditingInvoiceId(null);
    setEditingInvoice(null);
  };

  const saveEditing = () => {
    // Логика сохранения изменений
    alert("Изменения сохранены");
    setEditingInvoiceId(null);
    setEditingInvoice(null);
    loadInvoices();
  };

  const handleEditingChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setEditingInvoice({ ...editingInvoice, [e.target.name]: e.target.value });
  };

  function handleSearch(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div>
      <h2>Выставление счетов</h2>
      <div className="d-flex">
        <div className="invoice-form mt-4">
          <h3>Добавить новый счет (Вручную)</h3>
          <div className="form-group">
            <label htmlFor="userId">Имя Пользователя:</label>
            <Autosuggest
              suggestions={userSuggestions}
              onSuggestionsFetchRequested={updateSuggestions}
              onSuggestionsClearRequested={() => setUserSuggestions([])}
              getSuggestionValue={(s) => s.text}
              renderSuggestion={(s) => <div>{s.text}</div>}
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
              onChange={(e) =>
                setNewInvoice({ ...newInvoice, dateIssued: e.target.value })
              }
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
              onChange={(e) =>
                setNewInvoice({ ...newInvoice, dueDate: e.target.value })
              }
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
              onChange={(e) =>
                setNewInvoice({ ...newInvoice, amount: e.target.value })
              }
            />
          </div>
          <div className="form-group mt-3">
            <label htmlFor="status">Статус:</label>
            <select
              id="status"
              name="status"
              className="form-control"
              value={newInvoice.status}
              onChange={(e) =>
                setNewInvoice({ ...newInvoice, status: e.target.value })
              }
            >
              <option value="">-- Выберите статус --</option>
              <option value="NOT_PAID">Неоплачен</option>
              <option value="PAID">Оплачен</option>
              <option value="EXPIRED">Просрочен</option>
            </select>
          </div>
          <div className="form-group mt-3">
            <label htmlFor="lesson">Урок:</label>
            <select
              id="lesson"
              name="lesson"
              className="form-control"
              value={selectedLessonId}
              onChange={(e) => setSelectedLessonId(Number(e.target.value))}
            >
              <option value="">-- Выберите урок --</option>
              {lessons &&
                lessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>
                    {lesson.topic} ({lesson.date})
                  </option>
                ))}
            </select>
            <button onClick={addLesson} className="btn btn-secondary mt-2">
              Добавить урок
            </button>
          </div>
          <div className="form-group mt-3">
            <h4>Выбранные уроки:</h4>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>ID Урока</th>
                  <th>Тема</th>
                  <th>Дата</th>
                  <th>Действие</th>
                </tr>
              </thead>
              <tbody>
                {newInvoice.lessons &&
                  newInvoice.lessons.map((lesson) => (
                    <tr key={lesson.id}>
                      <td>{lesson.id}</td>
                      <td>{lesson.topic}</td>
                      <td>{lesson.date}</td>
                      <td>
                        <button
                          onClick={() => removeLesson(lesson.id)}
                          className="btn btn-danger"
                        >
                          Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <button onClick={saveInvoice} className="btn btn-primary mt-3">
            Выставить счет
          </button>
        </div>

        <div className="generate-invoices-form mt-4 ml-4">
          <h3>Сгенерировать счета за период</h3>
          <div className="form-group">
            <label htmlFor="generateFrom">Дата начала:</label>
            <input
              type="date"
              id="generateFrom"
              name="generateFrom"
              className="form-control"
            />
          </div>
          <div className="form-group mt-3">
            <label htmlFor="generateTo">Дата окончания:</label>
            <input
              type="date"
              id="generateTo"
              name="generateTo"
              className="form-control"
            />
          </div>
          <div className="form-group mt-3">
            <label htmlFor="group">Садик:</label>
            <select
              id="group"
              name="group"
              className="form-control"
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(Number(e.target.value))}
            >
              <option value="">-- Выберите садик --</option>
              {groups &&
                groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
            </select>
          </div>
          <div className="form-group mt-3">
            <label htmlFor="group">Группа:</label>
            <select
              id="group"
              name="group"
              className="form-control"
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(Number(e.target.value))}
            >
              <option value="">-- Выберите группу --</option>
              {groups &&
                groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
            </select>
          </div>
          <button
            onClick={generateInvoices}
            className="btn btn-secondary mt-3 me-3"
          >
            Сгенерировать счета
          </button>
          <button onClick={generateInvoices} className="btn btn-secondary mt-3">
            Отправить счета
          </button>
        </div>
      </div>

      <div className="invoice-list mt-5">
        <h3>Список счетов</h3>
        <div className="filter-form">
          <div className="form-group">
            <label htmlFor="filterFullName">Имя пользователя:</label>
            <input
              type="text"
              id="filterFullName"
              name="fullName"
              className="form-control"
              value={filters.fullName}
              onChange={handleFilterChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="filterDateIssuedFrom">Дата выставления (от):</label>
            <input
              type="date"
              id="filterDateIssuedFrom"
              name="dateIssuedFrom"
              className="form-control"
              value={filters.dateIssuedFrom}
              onChange={handleFilterChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="filterDateIssuedTo">Дата выставления (до):</label>
            <input
              type="date"
              id="filterDateIssuedTo"
              name="dateIssuedTo"
              className="form-control"
              value={filters.dateIssuedTo}
              onChange={handleFilterChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="filterDueDateFrom">Дата оплаты (от):</label>
            <input
              type="date"
              id="filterDueDateFrom"
              name="dueDateFrom"
              className="form-control"
              value={filters.dueDateFrom}
              onChange={handleFilterChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="filterDueDateTo">Дата оплаты (до):</label>
            <input
              type="date"
              id="filterDueDateTo"
              name="dueDateTo"
              className="form-control"
              value={filters.dueDateTo}
              onChange={handleFilterChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="filterStatus">Статус:</label>
            <select
              id="filterStatus"
              name="status"
              className="form-control"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">-- Выберите статус --</option>
              <option value="NOT_PAID">Неоплачен</option>
              <option value="PAID">Оплачен</option>
              <option value="EXPIRED">Просрочен</option>
            </select>
          </div>
          <button onClick={handleSearch} className="btn btn-primary mt-3">
            Поиск
          </button>
        </div>
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
                <th>Уроки</th>
                <th>Действие</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices &&
                filteredInvoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td>{invoice.id}</td>
                    <td>
                      {editingInvoiceId === invoice.id ? (
                        <input
                          type="text"
                          name="userFullName"
                          value={editingInvoice.userFullName}
                          onChange={handleEditingChange}
                          className="form-control"
                        />
                      ) : (
                        invoice.userFullName
                      )}
                    </td>
                    <td>
                      {editingInvoiceId === invoice.id ? (
                        <input
                          type="date"
                          name="dateIssued"
                          value={editingInvoice.dateIssued}
                          onChange={handleEditingChange}
                          className="form-control"
                        />
                      ) : (
                        invoice.dateIssued
                      )}
                    </td>
                    <td>
                      {editingInvoiceId === invoice.id ? (
                        <input
                          type="date"
                          name="dueDate"
                          value={editingInvoice.dueDate}
                          onChange={handleEditingChange}
                          className="form-control"
                        />
                      ) : (
                        invoice.dueDate
                      )}
                    </td>
                    <td>
                      {editingInvoiceId === invoice.id ? (
                        <input
                          type="number"
                          name="amount"
                          value={editingInvoice.amount}
                          onChange={handleEditingChange}
                          className="form-control"
                        />
                      ) : (
                        invoice.amount
                      )}
                    </td>
                    <td>
                      {editingInvoiceId === invoice.id ? (
                        <select
                          name="status"
                          value={editingInvoice.status}
                          onChange={handleEditingChange}
                          className="form-control"
                        >
                          <option value="NOT_PAID">Неоплачен</option>
                          <option value="PAID">Оплачен</option>
                          <option value="EXPIRED">Просрочен</option>
                        </select>
                      ) : (
                        invoice.status
                      )}
                    </td>
                    <td>
                      {invoice.lessons &&
                        invoice.lessons.map((lesson: any) => (
                          <div key={lesson.id}>
                            {lesson.topic} ({lesson.date})
                          </div>
                        ))}
                    </td>
                    <td>
                      {editingInvoiceId === invoice.id ? (
                        <div className="d-flex justify-content-around">
                          <button
                            onClick={saveEditing}
                            className="btn btn-primary"
                          >
                            Сохранить
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="btn btn-secondary"
                          >
                            Отменить
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing(invoice)}
                          className="btn btn-primary"
                        >
                          Редактировать
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InvoicesTab;
