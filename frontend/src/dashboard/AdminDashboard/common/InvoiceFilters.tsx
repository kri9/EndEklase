import React from "react";

interface Props {
  filters: {
    fullName: string;
    dateIssuedFrom: string;
    dateIssuedTo: string;
    dueDateFrom: string;
    dueDateTo: string;
    status: string;
    kindergartenName: string;
    groupName: string;
  };
  kindergartenOptions: string[];
  groupOptions: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onClear: () => void;
}

const InvoiceFilters: React.FC<Props> = ({ filters, kindergartenOptions, groupOptions, onChange, onClear }) => {
  return (
    <div className="filter-form grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 items-end mt-5">
      <div className="form-group">
        <label htmlFor="filterFullName">Lietotāja vārds:</label>
        <input
          type="text"
          id="filterFullName"
          name="fullName"
          className="form-control"
          value={filters.fullName}
          onChange={onChange}
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
          onChange={onChange}
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
          onChange={onChange}
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
          onChange={onChange}
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
          onChange={onChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="filterStatus">Statuss:</label>
        <select
          id="filterStatus"
          name="status"
          className="form-control"
          value={filters.status}
          onChange={onChange}
        >
          <option value="">-- Visi --</option>
          <option value="NOT_PAID">Neapmaksāts</option>
          <option value="PAID">Apmaksāts</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="filterKindergarten">Bērnudārzs:</label>
        <select
          id="filterKindergarten"
          name="kindergartenName"
          className="form-control"
          value={filters.kindergartenName}
          onChange={onChange}
        >
          <option value="">-- Visi --</option>
          {kindergartenOptions.map((kg) => (
            <option key={kg} value={kg}>{kg}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="filterGroup">Grupa:</label>
        <select
          id="filterGroup"
          name="groupName"
          className="form-control"
          value={filters.groupName}
          onChange={onChange}
        >
          <option value="">-- Visas --</option>
          {groupOptions.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <button className="btn btn-secondary mt-1" onClick={onClear}>Notīrīt filtrus</button>
      </div>
    </div>
  );
};

export default InvoiceFilters;
