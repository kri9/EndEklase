import React, { useState } from "react";
import { FaFilePdf, FaCalendarAlt, FaDownload } from "react-icons/fa";
import jsPDF from "jspdf";
import "./css/InvoiceTab.css";

interface Invoice {
  id: number;
  date: string;
  amount: string;
  status: "Оплачен" | "Неоплачен" | "Просрочен";
}

const invoicesData: Invoice[] = [
  { id: 1, date: "2024-10-01", amount: "$150.00", status: "Оплачен" },
  { id: 2, date: "2024-10-10", amount: "$200.00", status: "Неоплачен" },
  { id: 3, date: "2024-10-15", amount: "$120.00", status: "Просрочен" },
];

const InvoicesTab: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>("");

  const handleDownloadPDF = (invoice: Invoice) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Инвойс", 20, 20);
    doc.setFontSize(12);
    doc.text(`ID: ${invoice.id}`, 20, 40);
    doc.text(`Дата: ${invoice.date}`, 20, 50);
    doc.text(`Сумма: ${invoice.amount}`, 20, 60);
    doc.text(`Статус: ${invoice.status}`, 20, 70);
    doc.save(`invoice_${invoice.id}.pdf`);
  };

  return (
    <div className="invoices-tab">
      <h2>Инвойсы</h2>

      {/* Выбор даты */}
      <div className="date-select">
        <label htmlFor="date-select">
          <FaCalendarAlt className="icon-calendar" />
          Выберите дату:
        </label>
        <input
          type="date"
          id="date-select"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      {/* Карточки инвойсов */}
      <div className="invoices-cards">
        {invoicesData
          .filter((invoice) =>
            selectedDate ? invoice.date === selectedDate : true
          )
          .map((invoice) => (
            <div key={invoice.id} className="invoice-card">
              <div className="invoice-header">
                <FaFilePdf className="icon-pdf" />
                <h3>Инвойс #{invoice.id}</h3>
              </div>
              <p>Дата: {invoice.date}</p>
              <p>Сумма: {invoice.amount}</p>
              <p className={`status ${invoice.status.toLowerCase()}`}>
                {invoice.status}
              </p>
              <button
                className="download-button"
                onClick={() => handleDownloadPDF(invoice)}
              >
                <FaDownload className="icon-download" />
                Скачать PDF
              </button>
            </div>
          ))}
      </div>
    </div>
  );
};

export default InvoicesTab;
