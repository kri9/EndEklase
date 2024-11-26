import React, { useEffect, useState } from "react";
import { FaDownload } from "react-icons/fa";
import { getRequest } from "src/api";
import { handleDownloadPDF, handleDownloadPDFAdmin } from "src/general";

interface InvoiceListProps {
  invoices: any[];
  filters: any;
  onFilterChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onEdit: (invoice: any) => void;
  onSave: () => void;
  onCancel: () => void;
  editingInvoiceId: number | null;
  editingInvoice: any;
  setEditingInvoice: (invoice: any) => void;
}

const InvoiceList: React.FC<InvoiceListProps> = ({
  invoices,
  filters,
  onFilterChange,
  onEdit,
  onSave,
  onCancel,
  editingInvoiceId,
  editingInvoice,
  setEditingInvoice,
}) => {

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
            onChange={onFilterChange}
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
            onChange={onFilterChange}
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
            onChange={onFilterChange}
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
            onChange={onFilterChange}
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
            onChange={onFilterChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="filterStatus">Статус:</label>
          <select
            id="filterStatus"
            name="status"
            className="form-control"
            value={filters.status}
            onChange={onFilterChange}
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
            {filteredInvoices.map((invoice) => (
              <tr key={invoice.id}>
                <td>{invoice.id}</td>
                <td>
                  {editingInvoiceId === invoice.id ? (
                    <input
                      type="text"
                      name="userFullName"
                      value={editingInvoice.userFullName || ""}
                      onChange={(e) => setEditingInvoice({ ...editingInvoice, [e.target.name]: e.target.value })}
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
                      onChange={(e) => setEditingInvoice({ ...editingInvoice, [e.target.name]: e.target.value })}
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
                      onChange={(e) => setEditingInvoice({ ...editingInvoice, [e.target.name]: e.target.value })}
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
                      onChange={(e) => setEditingInvoice({ ...editingInvoice, [e.target.name]: e.target.value })}
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
                      onChange={(e) => setEditingInvoice({ ...editingInvoice, [e.target.name]: e.target.value })}
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
                  {invoice.lessons && invoice.lessons.length > 0
                    ? invoice.lessons.map((lesson: any) => lesson.topic).join(", ")
                    : "Нет уроков"}
                </td>
                <td>
                  {editingInvoiceId === invoice.id ? (
                    <div className="d-flex justify-content-around">
                      <button onClick={onSave} className="btn btn-primary">
                        Сохранить
                      </button>
                      <button onClick={onCancel} className="btn btn-secondary">
                        Отменить
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <button onClick={() => onEdit(invoice)} className="btn btn-primary">
                        Редактировать
                      </button>
                      <button
                        className="flex btn btn-primary mt-1 justify-center"
                        onClick={() => handleDownloadPDFAdmin(invoice.id)}
                      >
                        <FaDownload className="icon-download" />
                        Скачать PDF
                      </button>
                    </div>
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
