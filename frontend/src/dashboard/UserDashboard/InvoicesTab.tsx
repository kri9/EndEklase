import React, { useState, useEffect } from "react";
import { getInvoicesByUser } from "src/api";
import { useSelector } from "react-redux";
import { RootState } from "src/redux/store";

const InvoiceTab: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const token = useSelector((state: RootState) => state.auth.token);
  const userId = useSelector((state: RootState) => state.auth.user?.id);

  useEffect(() => {
    const loadInvoices = async () => {
      if (token && userId) {
        try {
          const fetchedInvoices = await getInvoicesByUser(token, userId);
          setInvoices(fetchedInvoices || []);
        } catch (error) {
          console.error("Failed to load invoices:", error);
        }
      }
    };
    loadInvoices();
  }, [token, userId]);

  return (
    <div className="container mt-5">
      <h2 className="text-3xl mb-4">Счета</h2>
      {invoices.length > 0 ? (
        <table className="table table-bordered table-hover">
          <thead className="thead-dark">
            <tr>
              <th>ID</th>
              <th>Дата</th>
              <th>Сумма</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td>{invoice.id}</td>
                <td>{invoice.date}</td>
                <td>{invoice.amount}</td>
                <td>{invoice.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Нет доступных счетов.</p>
      )}
    </div>
  );
};

export default InvoiceTab;