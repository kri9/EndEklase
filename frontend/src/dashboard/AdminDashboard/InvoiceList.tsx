import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getInvoices, putRequest } from "src/api";
import { RootState } from "src/redux/store";

interface InvoiceListProps {
  invoices: any[];
  filters: any;
  onFilterChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onEdit: (invoice: any) => void;
  onSave: (invoice: any) => void;
  onCancel: () => void;
}

const InvoiceList: React.FC<InvoiceListProps> = ({
  invoices,
  filters,
  onFilterChange,
  onEdit,
  onSave,
  onCancel,
}) => {
  const [editingInvoiceId, setEditingInvoiceId] = useState<number | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    if (token) {
      const fetchedInvoices = await getInvoices(token);
      setInvoices(fetchedInvoices || []);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onFilterChange(e);
  };

  const filteredInvoices = invoices.filter((invoice) => {
    return (
      (!filters.fullName || (invoice.userFullName && invoice.userFullName.toLowerCase().includes(filters.fullName.toLowerCase()))) &&
      (!filters.dateIssuedFrom || new Date(invoice.dateIssued) >= new Date(filters.dateIssuedFrom)) &&
      (!filters.dateIssuedTo || new Date(invoice.dateIssued) <= new Date(filters.dateIssuedTo)) &&
      (!filters.dueDateFrom || new Date(invoice.dueDate) >= new Date(filters.dueDateFrom)) &&
      (!filters.dueDateTo || new Date(invoice.dueDate) <= new Date(filters.dueDateTo)) &&
      (!filters.status || invoice.status === filters.status)
    );
  });

  const startEditing = (invoice: any) => {
    setEditingInvoiceId(invoice.id);
    setEditingInvoice({ ...invoice });
  };

  const cancelEditing = () => {
    setEditingInvoiceId(null);
    setEditingInvoice(null);
  };

  const saveEditing = async () => {
    if (editingInvoiceId && editingInvoice) {
      await putRequest(`admin/invoice/${editingInvoiceId}`, editingInvoice);
      alert("Изменения сохранены");
      setEditingInvoiceId(null);
      setEditingInvoice(null);
      loadInvoices();
    }
  };

  const handleEditingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditingInvoice({ ...editingInvoice, [e.target.name]: e.target.value });
  };

  return (
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
            {filteredInvoices && filteredInvoices.map((invoice) => (
              <tr key={invoice.id}>
                <td>{invoice.id}</td>
                <td>
                  {editingInvoiceId === invoice.id ? (
                    <input
                      type="text"
                      name="userFullName"
                      value={editingInvoice.userFullName || ""}
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
                      value={editingInvoice.dateIssued || ""}
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
                      value={editingInvoice.dueDate || ""}
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
                      value={editingInvoice.amount || ""}
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
                      value={editingInvoice.status || ""}
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
                  {invoice.lessons && invoice.lessons.map((lesson: any) => (
                    <div key={lesson.id}>
                      {lesson.topic} ({lesson.date})
                    </div>
                  ))}
                </td>
                <td>
                  {editingInvoiceId === invoice.id ? (
                    <div className="d-flex justify-content-around">
                      <button onClick={saveEditing} className="btn btn-primary">Сохранить</button>
                      <button onClick={cancelEditing} className="btn btn-secondary">Отменить</button>
                    </div>
                  ) : (
                    <button onClick={() => startEditing(invoice)} className="btn btn-primary">Редактировать</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoiceList;