import React, { useState } from "react";
import { generateInvoices } from "src/api";

const GenerateInvoiceForm = (props: { kindergartens: any[], onGenerate: any }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    try {
      await props.onGenerate({ startDate, endDate });
    } catch (error) {
      console.error("Kļūda, ģenerējot rēķinus:", error);
      alert("Kļūda, ģenerējot rēķinus");
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="startDate">Datums no:</label>
        <input
          type="date"
          id="startDate"
          name="startDate"
          className="form-control"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>
      <div className="form-group mt-3">
        <label htmlFor="endDate">Datums līdz:</label>
        <input
          type="date"
          id="endDate"
          name="endDate"
          className="form-control"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>
      <button type="submit" className="btn btn-primary mt-3">Ģenerēt rēķinus</button>
    </form>
  );
};

export default GenerateInvoiceForm;
