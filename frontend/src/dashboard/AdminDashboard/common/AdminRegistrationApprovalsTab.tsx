import React, { useEffect, useMemo, useState } from "react";
import { approveRegistration, getPendingRegistrations, rejectRegistration } from "src/api";

type Req = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  kindergartenName?: string | null;
  groupName?: string | null;
  childrenLine?: string | null; // "A B, C D"
  status: string;
  createdAt?: string;
};

const AdminRegistrationApprovalsTab: React.FC = () => {
  const [items, setItems] = useState<Req[]>([]);
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMode, setConfirmMode] = useState<"approve" | "reject">("approve");
  const [selected, setSelected] = useState<Req | null>(null);

  const load = async () => {
    setBusy(true);
    try {
      const data = await getPendingRegistrations();
      setItems(data || []);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter(x =>
      (x.email || "").toLowerCase().includes(s) ||
      (x.firstName || "").toLowerCase().includes(s) ||
      (x.lastName || "").toLowerCase().includes(s) ||
      (x.childrenLine || "").toLowerCase().includes(s) ||
      (x.kindergartenName || "").toLowerCase().includes(s) ||
      (x.groupName || "").toLowerCase().includes(s)
    );
  }, [items, q]);

  const openConfirm = (mode: "approve" | "reject", row: Req) => {
    setConfirmMode(mode);
    setSelected(row);
    setConfirmOpen(true);
  };

  const runConfirm = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      if (confirmMode === "approve") await approveRegistration(selected.id);
      else await rejectRegistration(selected.id);

      setItems(prev => prev.filter(x => x.id !== selected.id));
      setConfirmOpen(false);
      setSelected(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white p-6 shadow-md rounded-lg">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h3 className="text-xl font-semibold m-0">Reģistrācijas pieteikumi</h3>
        <button className="btn btn-outline-primary btn-sm" onClick={load} disabled={busy}>
          {busy ? "Atjauno…" : "Atjaunot"}
        </button>
      </div>

      <input
        className="form-control mb-3"
        placeholder="Meklēt (e-pasts, vārds, bērni, grupa...)"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div className="table-responsive">
        <table className="table table-bordered align-middle">
          <thead>
            <tr>
              <th>ID</th>
              <th>Vecāks</th>
              <th>E-pasts</th>
              <th>Tālrunis</th>
              <th>Bērni</th>
              <th>Bērnudārzs / Grupa</th>
              <th>Statuss</th>
              <th style={{ width: 220 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center text-muted">
                  Nav pieteikumu
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{(r.firstName || "") + " " + (r.lastName || "")}</td>
                  <td>{r.email}</td>
                  <td>{r.phoneNumber || "-"}</td>
                  <td>{r.childrenLine || "-"}</td>
                  <td>
                    {(r.kindergartenName || "-") + " / " + (r.groupName || "-")}
                  </td>
                  <td>{r.status}</td>
                  <td className="d-flex gap-2">
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => openConfirm("approve", r)}
                      disabled={busy}
                    >
                      Apstiprināt
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => openConfirm("reject", r)}
                      disabled={busy}
                    >
                      Noraidīt
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {confirmOpen && selected && (
        <div className="modal fade show" style={{ display: "block" }} role="dialog" aria-modal="true">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {confirmMode === "approve" ? "Apstiprināt pieteikumu?" : "Noraidīt pieteikumu?"}
                </h5>
                <button type="button" className="btn-close" onClick={() => setConfirmOpen(false)}></button>
              </div>
              <div className="modal-body">
                <div><b>Vecāks:</b> {selected.firstName} {selected.lastName}</div>
                <div><b>E-pasts:</b> {selected.email}</div>
                <div><b>Bērni:</b> {selected.childrenLine || "-"}</div>
                <div className="text-muted mt-2">
                  {confirmMode === "approve"
                    ? "Tiks izveidots lietotājs un bērni tiks piesaistīti izvēlētajai grupai."
                    : "Pieteikums tiks noraidīts."}
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setConfirmOpen(false)} disabled={busy}>
                  Atcelt
                </button>
                <button
                  className={`btn ${confirmMode === "approve" ? "btn-success" : "btn-danger"}`}
                  onClick={runConfirm}
                  disabled={busy}
                >
                  {busy ? "Apstrāde…" : (confirmMode === "approve" ? "Apstiprināt" : "Noraidīt")}
                </button>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </div>
      )}
    </div>
  );
};

export default AdminRegistrationApprovalsTab;
