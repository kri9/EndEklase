import React, { useState } from "react";
import Autosuggest from "react-autosuggest";

interface InvoiceFormProps {
  usersInfo: { id: number; fullName: string }[];
  lessons: any[];
  onSave: (invoice: any) => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ usersInfo, lessons, onSave }) => {
  const [newInvoice, setNewInvoice] = useState({
    fullName: "",
    userId: 0,
    dateIssued: "",
    dueDate: "",
    amount: "",
    status: null as any,
    lessons: [] as any[],
  });
  const [userSuggestions, setUserSuggestions] = useState<{ text: string }[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<number | "">("");

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
    onChange: (
      event: any,
      { newValue }: { newValue: string; method: any }
    ) => {
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
      newInvoice.lessons = newInvoice.lessons.map(l => l.id);

      onSave(newInvoice);
      setNewInvoice({
        fullName: "",
        userId: 0,
        dateIssued: "",
        dueDate: "",
        amount: "",
        status: null,
        lessons: [],
      });
    } else {
      alert("Пользователь не найден");
    }
  };

  return (
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
          {lessons && lessons.map((lesson) => (
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
            {newInvoice.lessons && newInvoice.lessons.map((lesson) => (
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
  );
};

export default InvoiceForm;
