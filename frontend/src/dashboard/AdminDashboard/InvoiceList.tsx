import React from "react";
import { FaDownload } from "react-icons/fa";
import { handleDownloadPDFAdmin } from "src/general";

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
      <h3>Rēķinu saraksts</h3>
      <div className="filter-form">
        <div className="form-group">
          <label htmlFor="filterFullName">Lietotāja vārds:</label>
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
          <label htmlFor="filterDateIssuedFrom">Izrakstīšanas datums (no):</label>
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
          <label htmlFor="filterDateIssuedTo">Izrakstīšanas datums (līdz):</label>
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
          <label htmlFor="filterDueDateFrom">Apmaksas datums (no):</label>
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
          <label htmlFor="filterDueDateTo">Apmaksas datums (līdz):</label>
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
          <label htmlFor="filterStatus">Statuss:</label>
          <select
            id="filterStatus"
            name="status"
            className="form-control"
            value={filters.status}
            onChange={onFilterChange}
          >
            <option value="">-- Izvēlieties statusu --</option>
            <option value="NOT_PAID">Neapmaksāts</option>
            <option value="PAID">Apmaksāts</option>
            <option value="EXPIRED">Nokavēts</option>
          </select>
        </div>
      </div>
      <div className="invoice-table mt-4">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Rēķina ID</th>
              <th>Lietotāja vārds</th>
              <th>Izrakstīšanas datums</th>
              <th>Apmaksas datums</th>
              <th>Summa</th>
              <th>Statuss</th>
              <th>Stundas</th>
              <th>Darbība</th>
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
                      <option value="NOT_PAID">Neapmaksāts</option>
                      <option value="PAID">Apmaksāts</option>
                      <option value="EXPIRED">Nokavēts</option>
                    </select>
                  ) : (
                    invoice.status
                  )}
                </td>
                <td>
                  {invoice.lessons && invoice.lessons.length > 0
                    ? invoice.lessons.map((lesson: any) => lesson.topic).join(", ")
                    : "Nav stundu"}
                </td>
                <td>
                  {editingInvoiceId === invoice.id ? (
                    <div className="d-flex justify-content-around">
                      <button onClick={onSave} className="btn btn-primary">
                        Saglabāt
                      </button>
                      <button onClick={onCancel} className="btn btn-secondary">
                        Atcelt
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <button onClick={() => onEdit(invoice)} className="btn btn-primary">
                        Rediģēt
                      </button>
                      <button
                        className="flex btn btn-primary mt-1 justify-center"
                        onClick={() => handleDownloadPDFAdmin(invoice.id)}
                      >
                        <FaDownload className="icon-download" />
                        Lejupielādēt PDF
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
