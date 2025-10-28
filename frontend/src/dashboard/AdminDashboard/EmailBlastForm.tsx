import React, { useEffect, useState } from "react";
import { getRequest, postRequest } from "src/api";
import { FullInvoiceDTO } from "src/common/interfaces";

const todayStr = () => {
  const d = new Date();
  return d.toISOString().slice(0, 10);
};

const EmailBlastForm: React.FC = () => {
  const [issueDate, setIssueDate] = useState<string>(todayStr());
  const [unsentOnly, setUnsentOnly] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<FullInvoiceDTO[]>([]);
  const [stats, setStats] = useState<{ total?: number; sent?: number; failed?: number }>({});

  const load = async () => {
    setLoading(true);
    try {
      const data = await getRequest<FullInvoiceDTO[]>(
        `admin/invoices/by-issue-date?issueDate=${issueDate}&unsentOnly=${unsentOnly}`
      );
      setList(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [issueDate, unsentOnly]);

  const sendAll = async () => {
    if (!list.length) {
      alert("Нет счетов для отправки");
      return;
    }
    setLoading(true);
    try {
      const res = await postRequest<any>(
        `admin/invoices/email?issueDate=${issueDate}&unsentOnly=${unsentOnly}`,
        {}
      );
      setStats(res || {});
      await load();
      alert(`Отправлено: ${res?.sent ?? 0}, ошибок: ${res?.failed ?? 0}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="invoice-form">
      <h3>Массовая отправка счетов по электронной почте</h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <div>
          <label className="text-sm mb-1 block">Дата выставления счетов</label>
          <input
            type="date"
            className="form-control"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
          />
        </div>

        <label className="flex items-center gap-2 mt-6">
          <input
            type="checkbox"
            checked={unsentOnly}
            onChange={(e) => setUnsentOnly(e.target.checked)}
          />
          Только неотправленные
        </label>

        <div>
          <button className="btn btn-primary mt-6" onClick={sendAll} disabled={loading}>
            {loading ? "Отправка..." : "Отправить все"}
          </button>
        </div>

        <div className="text-sm mt-6">
          {stats.total != null && (
            <span>
              Всего: {stats.total}, Отправлено: {stats.sent}, Ошибок: {stats.failed}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4">
        <div className="text-sm text-gray-600 mb-2">
          Найдено счетов: {list.length}
        </div>

        <div className="overflow-x-auto">
          <table className="table table-bordered w-full">
            <thead>
              <tr>
                <th>ID</th>
                <th>Пользователь</th>
                <th>Сумма</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {list.map((inv) => (
                <tr key={inv.id}>
                  <td>{inv.id}</td>
                  <td>{inv.userFullName}</td>
                  <td>{(inv.amount ?? 0) / 100}€</td>
                  <td>{inv.status}</td>
                </tr>
              ))}
              {!list.length && (
                <tr>
                  <td colSpan={4} className="text-center py-6">
                    Нет данных
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmailBlastForm;
