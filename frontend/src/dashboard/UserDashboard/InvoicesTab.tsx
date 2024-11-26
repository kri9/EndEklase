import React, { useState, useEffect } from "react";
import { FaFilePdf, FaDownload, FaCreditCard } from "react-icons/fa";
import { getInvoicesByUser } from "src/api";
import { useSelector } from "react-redux";
import { RootState } from "src/redux/store";
import "./css/InvoiceTab.css";
import { handleDownloadPDF } from "src/general";

const InvoiceTab: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const token = useSelector((state: RootState) => state.auth.token);

  // Сопоставление статусов из базы данных с отображаемыми значениями
  const mapStatusToLabel = (status: string) => {
    switch (status) {
      case "PAID":
        return "Оплачен";
      case "NOT_PAID":
        return "Неоплачен";
      case "EXPIRED":
        return "Просрочен";
      default:
        return "Неизвестно";
    }
  };

  useEffect(() => {
    const loadInvoices = async () => {
      if (token) {
        try {
          const fetchedInvoices = await getInvoicesByUser(token);
          setInvoices(fetchedInvoices || []);
        } catch (error) {
          console.error("Ошибка загрузки счетов:", error);
        }
      }
    };
    loadInvoices();
  }, [token]);


  return (
    <div className="invoices-tab">
      <h2 className="text-3xl mb-4">Счета</h2>
      <div className="invoices-cards">
        {invoices.length > 0 ? (
          invoices.map((invoice) => (
            <div key={invoice.id} className="invoice-card">
              <div className="invoice-header">
                <FaFilePdf className="icon-pdf" />
                <h3>Инвойс #{invoice.id}</h3>
              </div>
              <p>Дата: {invoice.date}</p>
              <p>Сумма: {invoice.amount}</p>
              <p className={`status ${invoice.status.toLowerCase()}`}>
                {mapStatusToLabel(invoice.status)}
              </p>
              <div className="buttons">
                <button
                  className="download-button"
                  onClick={() => handleDownloadPDF(invoice.id)}
                >
                  <FaDownload className="icon-download" />
                  Скачать PDF
                </button>
                {invoice.status === "NOT_PAID" && (
                  <button className="pay-button">
                    <FaCreditCard className="icon-pay" />
                    Оплатить
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p>Нет доступных счетов.</p>
        )}
      </div>
    </div>
  );
};

export default InvoiceTab;
