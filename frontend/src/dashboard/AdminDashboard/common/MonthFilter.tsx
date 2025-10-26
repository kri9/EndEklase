import React from "react";

interface MonthFilterProps {
  value: string;           
  onChange: (v: string) => void;
  label?: string;
}

const MonthFilter: React.FC<MonthFilterProps> = ({ value, onChange, label }) => {
  return (
    <div className="form-group">
      <label>{label ?? "Rēķinu mēnesis (izrakstīšanas datums)"}</label>
      <input
        type="month"
        className="form-control"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default MonthFilter;
