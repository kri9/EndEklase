// src/components/ReportsTab.tsx
import React, { useEffect, useState } from "react";
import { getRequest, getKindergartens, getGroupsByKindergarten } from "src/api";
import { FullInvoiceDTO } from "src/common/interfaces";

type KG = { id: string | number; name: string };
type Group = { id: string | number; name: string };

const formatEur = (cents: number) =>
  (cents / 100).toFixed(2).replace(".", ",") + " €";

const ReportsTab: React.FC = () => {
  const [kindergartens, setKindergartens] = useState<KG[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [filterKindergartenId, setFilterKindergartenId] =
    useState<string>("");
  const [filterGroupId, setFilterGroupId] = useState<string>("");
  const [filterIssueMonth, setFilterIssueMonth] = useState<string>(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  });

  const [invoices, setInvoices] = useState<FullInvoiceDTO[]>([]);
  const [loading, setLoading] = useState(false);

  // загрузка садиков
  useEffect(() => {
    getKindergartens().then((list: KG[]) => setKindergartens(list || []));
  }, []);

  // загрузка групп при выборе садика
  useEffect(() => {
    if (filterKindergartenId) {
      getGroupsByKindergarten(filterKindergartenId).then((list: Group[]) =>
        setGroups(list || []),
      );
      setFilterGroupId("");
    } else {
      setGroups([]);
      setFilterGroupId("");
    }
  }, [filterKindergartenId]);

  // загрузка счетов по фильтрам
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params: string[] = [];
        if (filterKindergartenId)
          params.push(
            `kindergartenId=${encodeURIComponent(filterKindergartenId)}`,
          );
        if (filterGroupId)
          params.push(`groupId=${encodeURIComponent(filterGroupId)}`);
        if (filterIssueMonth)
          params.push(`issueMonth=${encodeURIComponent(filterIssueMonth)}`);

        const url =
          "admin/invoices/search" + (params.length ? `?${params.join("&")}` : "");
        const fetched = await getRequest<FullInvoiceDTO[]>(url);
        setInvoices(fetched || []);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [filterKindergartenId, filterGroupId, filterIssueMonth]);

  // агрегаты
  const totalAmount = invoices.reduce(
    (sum, inv) => sum + (inv.amount ?? 0),
    0,
  );
  const paidAmount = invoices
    .filter((i) => i.status === "PAID")
    .reduce((sum, inv) => sum + (inv.amount ?? 0), 0);
  const unpaidAmount = totalAmount - paidAmount;

  const totalCount = invoices.length;
  const paidCount = invoices.filter((i) => i.status === "PAID").length;
  const notPaidCount = invoices.filter((i) => i.status === "NOT_PAID").length;
  const expiredCount = invoices.filter((i) => i.status === "EXPIRED").length;

  return (
    <div>
      <h2 className="text-3xl mb-4">Pārskati par grupām</h2>

      {/* Фильтры */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end mb-6">
        <div>
          <label className="text-sm mb-1 block">Bērnudārzs</label>
          <select
            className="form-control"
            value={filterKindergartenId}
            onChange={(e) => setFilterKindergartenId(e.target.value)}
          >
            <option value="">— Visi —</option>
            {kindergartens.map((k) => (
              <option key={String(k.id)} value={String(k.id)}>
                {k.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm mb-1 block">Grupa</label>
          <select
            className="form-control"
            value={filterGroupId}
            onChange={(e) => setFilterGroupId(e.target.value)}
            disabled={!filterKindergartenId}
          >
            <option value="">— Visas —</option>
            {groups.map((g) => (
              <option key={String(g.id)} value={String(g.id)}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm mb-1 block">Mēnesis</label>
          <input
            type="month"
            className="form-control"
            value={filterIssueMonth}
            onChange={(e) => setFilterIssueMonth(e.target.value)}
          />
        </div>

        <div>
          <button
            className="btn btn-secondary mt-6"
            onClick={() => {
              setFilterKindergartenId("");
              setFilterGroupId("");
              const d = new Date();
              const y = d.getFullYear();
              const m = String(d.getMonth() + 1).padStart(2, "0");
              setFilterIssueMonth(`${y}-${m}`);
            }}
          >
            Notīrīt filtrus
          </button>
        </div>
      </div>

      {/* Карточки с суммами */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded border bg-white shadow-sm">
          <div className="text-sm text-gray-500">Kopējā summa</div>
          <div className="text-2xl font-semibold">{formatEur(totalAmount)}</div>
          <div className="text-xs text-gray-500 mt-1">
            Rēķinu skaits: {totalCount}
          </div>
        </div>

        <div className="p-4 rounded border bg-white shadow-sm">
          <div className="text-sm text-gray-500">Samaksāts</div>
          <div className="text-2xl font-semibold text-green-700">
            {formatEur(paidAmount)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Samaksāto rēķinu skaits: {paidCount}
          </div>
        </div>

        <div className="p-4 rounded border bg-white shadow-sm">
          <div className="text-sm text-gray-500">Atlikusī summa</div>
          <div className="text-2xl font-semibold text-red-700">
            {formatEur(unpaidAmount)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Neapmaksāti: {notPaidCount}, Nokavēti: {expiredCount}
          </div>
        </div>
      </div>

      {/* Табличка по статусам */}
      <div className="bg-white p-4 rounded border shadow-sm">
        <h3 className="text-lg font-semibold mb-3">Rēķinu sadalījums pēc statusa</h3>
        {loading ? (
          <div>Notiek ielāde...</div>
        ) : (
          <table className="table table-bordered w-full">
            <thead>
              <tr>
                <th>Statuss</th>
                <th>Skaits</th>
                <th>Summa</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>PAID</td>
                <td>{paidCount}</td>
                <td>{formatEur(paidAmount)}</td>
              </tr>
              <tr>
                <td>NOT_PAID</td>
                <td>{notPaidCount}</td>
                <td>
                  {formatEur(
                    invoices
                      .filter((i) => i.status === "NOT_PAID")
                      .reduce((s, inv) => s + (inv.amount ?? 0), 0),
                  )}
                </td>
              </tr>
              <tr>
                <td>EXPIRED</td>
                <td>{expiredCount}</td>
                <td>
                  {formatEur(
                    invoices
                      .filter((i) => i.status === "EXPIRED")
                      .reduce((s, inv) => s + (inv.amount ?? 0), 0),
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ReportsTab;
