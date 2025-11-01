import React, { useState } from "react";
import UserSelect from "./common/UserSelect";
import { AttendanceDTO, FullInvoiceDTO } from "src/common/interfaces";
import { getRequest } from "src/api";

interface InvoiceFormProps {
  usersInfo: { id: number; fullName: string }[];
  lessons: any[];
  onSave: (invoice: any) => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ usersInfo, onSave }) => {
  const [newInvoice, setNewInvoice] = useState<any>({
    id: 0, // добавляем поле id
    fullName: "",
    userId: 0,
    dateIssued: "",
    dueDate: "",
    paymentReceiveDate: "",
    amount: undefined,
    status: null as any,
    attendances: [] as any[],
  });
  const [selectedAttendanceId, setSelectedAttendanceId] = useState<number | "">(
    "",
  );
  const [userAttendances, setUserAttendances] = useState<AttendanceDTO[]>([]);

  const addLesson = () => {
    if (selectedAttendanceId) {
      const attendance = userAttendances.find(
        (l) => l.id === selectedAttendanceId,
      );
      if (
        attendance &&
        !newInvoice.attendances.some((l: { id: number }) => l.id === attendance.id)
      ) {
        setNewInvoice({
          ...newInvoice,
          attendances: [...newInvoice.attendances, attendance],
        });
      }
    }
  };

  const removeLesson = (attId: number) => {
    setNewInvoice({
      ...newInvoice,
      attendances: newInvoice.attendances.filter(
        (attendance: any) => attendance.id !== attId,
      ),
    });
  };

  const saveInvoice = () => {
    try {
      const user = usersInfo.find((u) => u.fullName === newInvoice.fullName);
      if (!user) {
        alert("Lietotājs nav atrasts");
        return;
      }

      const invoiceToSave: FullInvoiceDTO = {
        id: 0,
        userId: user.id,
        userFullName: user.fullName,
        dateIssued: new Date(newInvoice.dateIssued),
        dueDate: new Date(newInvoice.dueDate),
        amount: Number(newInvoice.amount) * 100 || undefined,
        status: newInvoice.status ?? "NOT_PAID",
        attendances: newInvoice.attendances.map((l: any) => l.id),
      };

      onSave(invoiceToSave);
    } catch (error) {
      console.error("Kļūda saglabājot rēķinu:", error);
      alert("Radās kļūda saglabājot. Pārbaudiet datus.");
    }
  };

  return (
    <div className="invoice-form mt-4">
      <h3>Pievienot jaunu rēķinu (Manuāli)</h3>
      <div className="form-group">
        <label htmlFor="userId">Lietotāja vārds:</label>
        <UserSelect
          onChange={(nv, id) => {
            setNewInvoice({ ...newInvoice, ["fullName"]: nv });
            if (id) {
              getRequest<AttendanceDTO[]>(
                `admin/user/${id}/attendances/uncovered`
              ).then(setUserAttendances);
            }
          }}
        />
      </div>
      <div className="form-group mt-3">
        <label htmlFor="dateIssued">Izrakstīšanas datums:</label>
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
        <label htmlFor="dueDate">Apmaksas datums:</label>
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
        <label htmlFor="amount">Summa:</label>
        <input
          id="amount"
          name="amount"
          type="number"
          placeholder="€"
          className="form-control"
          step="0.01"
          pattern="^\d+(?:\.\d{1,2})?$"
          min="0"
          value={newInvoice.amount}
          onChange={(e) => {
            let str = e.target.value;
            let rounded: string = parseFloat(str).toFixed(2);
            let result =
              parseFloat(rounded) % 1 === 0
                ? parseInt(rounded)
                : parseFloat(rounded);
            setNewInvoice({
              ...newInvoice,
              amount: result.toString(),
            });
          }}
        />
      </div>
      <div className="form-group mt-3">
        <label htmlFor="status">Statuss:</label>
        <select
          id="status"
          name="status"
          className="form-control"
          value={newInvoice.status ?? ""}
          onChange={(e) =>
            setNewInvoice({ ...newInvoice, status: e.target.value })
          }
        >
          <option value="">-- Izvēlieties statusu --</option>
          <option value="NOT_PAID">Neapmaksāts</option>
          <option value="PAID">Apmaksāts</option>
          <option value="EXPIRED">Nokavēts</option>
        </select>
      </div>
      <div className="form-group mt-3">
        <label htmlFor="lesson">Stunda:</label>
        <select
          id="lesson"
          name="lesson"
          className="form-control"
          value={selectedAttendanceId ?? ""}
          onChange={(e) => setSelectedAttendanceId(Number(e.target.value))}
        >
          <option value="">-- Izvēlieties stundu --</option>
          {userAttendances?.map((att) => (
            <option key={att.id} value={att.id}>
              {att.lesson.topic} ({att.lesson.date})
              {att.childFullName
                ? ` — ${att.childFullName}`
                : att.childId
                ? ` — #${att.childId}`
                : ""}
            </option>
          ))}
        </select>
        <button onClick={addLesson} className="btn btn-secondary mt-2">
          Pievienot stundu
        </button>
      </div>
      <div className="form-group mt-3">
        <h4>Izvēlētās stundas:</h4>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Stundas ID</th>
              <th>Tēma</th>
              <th>Datums</th>
              <th>Bērns</th> {/* <-- новая колонка */}
              <th>Darbība</th>
            </tr>
          </thead>
          <tbody>
            {newInvoice.attendances?.map((att: any) => (
              <tr key={att.id}>
                <td>{att.lesson.id}</td>
                <td>{att.lesson.topic}</td>
                <td>{att.lesson.date}</td>
                <td>
                  {att.childFullName ?? (att.childId ? `#${att.childId}` : "")}
                </td>
                <td>
                  <button
                    onClick={() => removeLesson(att.id as number)}
                    className="btn btn-danger"
                  >
                    Dzēst
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={saveInvoice} className="btn btn-primary mt-3">
        Izrakstīt rēķinu
      </button>
    </div>
  );
};

export default InvoiceForm;
