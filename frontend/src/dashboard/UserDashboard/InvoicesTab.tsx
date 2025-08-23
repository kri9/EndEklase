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

  // Statusu kartēšana no datubāzes uz attēlojamiem tekstiem
  const mapStatusToLabel = (status: string) => {
    switch (status) {
      case "PAID":
        return "Apmaksāts";
      case "NOT_PAID":
        return "Nav apmaksāts";
      case "EXPIRED":
        return "Nokavēts";
      default:
        return "Nezināms";
    }
  };

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        const fetchedInvoices = await getInvoicesByUser();
        setInvoices(fetchedInvoices || []);
      } catch (error) {
        console.error("Kļūda, ielādējot rēķinus:", error);
      }
    };
    loadInvoices();
  }, [token]);

  return (
    <div className="invoices-tab">
      <h2 className="text-3xl mb-4">Rēķini</h2>
      <div className="invoices-cards">
        {invoices.length > 0 ? (
          invoices.map((invoice) => (
            <div key={invoice.id} className="invoice-card">
              <div className="invoice-header">
                <FaFilePdf className="icon-pdf" />
                <h3>Rēķins #{invoice.id}</h3>
              </div>
              <p>Datums: {invoice.date}</p>
              <p>Summa: {invoice.amount}</p>
              <p className={`status ${invoice.status.toLowerCase()}`}>
                {mapStatusToLabel(invoice.status)}
              </p>
              <div className="buttons">
                <button
                  className="download-button"
                  onClick={() => handleDownloadPDF(invoice.id)}
                >
                  <FaDownload className="icon-download" />
                  Lejupielādēt PDF
                </button>
                {invoice.status === "NOT_PAID" && (
                  <button className="pay-button">
                    <FaCreditCard className="icon-pay" />
                    Apmaksāt
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p>Nav pieejamu rēķinu.</p>
        )}
      </div>
    </div>
  );
};

export default InvoiceTab;
