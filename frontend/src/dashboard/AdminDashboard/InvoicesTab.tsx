import React, { useState, useEffect } from "react";
import Autosuggest from "react-autosuggest";
import { getRequest, postRequest } from "src/api";

const InvoicesTab: React.FC = () => {
  const [newInvoice, setNewInvoice] = useState({
    fullName: "",
    userId: 0,
    dateIssued: "",
    dueDate: "",
    amount: "",
    status: "",
  });
  const [usersInfo, setUsersInfo] = useState<
    { id: number; fullName: string }[]
  >([]);
  const [userSuggestions, setUserSuggestions] = useState<{ text: string }[]>(
    []
  );
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    getRequest<{ id: number; fullName: string }[]>(
      "admin/user-emails"
    ).then(setUsersInfo);
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    const fetchedInvoices = null; //await getRequest<any[]>("admin/invoices");
    setInvoices(fetchedInvoices || []);
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
        });
        alert("Счёт успешно сохранён");
        loadInvoices();
      });
    } else {
      alert("Пользователь не найден");
    }
  };

  return (
    <div>
      <h2>Выставление счетов</h2>
      <div className="invoice-form mt-4">
        <h3>Добавить новый счет</h3>
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
        <button onClick={saveInvoice} className="btn btn-primary mt-3">
          Выставить счет
        </button>
      </div>

      <div className="invoice-list mt-5">
        <h3>Список счетов</h3>
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
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td>{invoice.id}</td>
                  <td>{invoice.userFullName}</td>
                  <td>{invoice.dateIssued}</td>
                  <td>{invoice.dueDate}</td>
                  <td>{invoice.amount}</td>
                  <td>{invoice.status}</td>
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

