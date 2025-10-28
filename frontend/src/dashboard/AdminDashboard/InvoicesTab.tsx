import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "src/redux/store";
import {
  getRequest,
  postRequest,
  putRequest,
  deleteInvoice,
  getKindergartens,
  getGroupsByKindergarten,
} from "src/api";

import InvoiceForm from "./InvoiceForm";
import GenerateInvoicesForm from "./GenerateInvoicesForm";
import CrudTable from "./common/CrudTable";
import RootObjectForm from "./common/RootObjectForm";
import NumberInput from "./common/NumberInput";
import MultiSelect from "./common/MultiSelect";
import EmailBlastForm from "./EmailBlastForm";

import {
  AttendanceDTO,
  FullInvoiceDTO,
  InvoiceState,
  LessonDTO,
} from "src/common/interfaces";

type KG = { id: string | number; name: string };
type Group = { id: string | number; name: string };

// const EmailBlastForm: React.FC = () => (
//   <div className="invoice-form">
//     <h3>Masveida e-pasta izsūtīšana (sagatavošana)</h3>
//     <div className="text-sm text-gray-600">
//       Šeit būs forma, lai atlasītu rēķinus un sagatavotu sūtīšanu klientiem.
//     </div>
//   </div>
// );

const InvoicesTab: React.FC = () => {
  const token = useSelector((state: RootState) => state.auth.token);

  const [usersInfo, setUsersInfo] = useState<{ id: number; fullName: string }[]>(
    []
  );
  const [lessons, setLessons] = useState<LessonDTO[]>([]);
  const [invoices, setInvoices] = useState<FullInvoiceDTO[]>([]);

  const [kindergartens, setKindergartens] = useState<KG[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [filterKindergartenId, setFilterKindergartenId] = useState<string>("");
  const [filterGroupId, setFilterGroupId] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  const [filterIssueMonth, setFilterIssueMonth] = useState<string>(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  });

  const [showManual, setShowManual] = useState<boolean>(true);
  const [showGenerate, setShowGenerate] = useState<boolean>(true);
  const [showEmail, setShowEmail] = useState<boolean>(true);

  useEffect(() => {
    getRequest<{ id: number; fullName: string }[]>("admin/user-emails").then(
      setUsersInfo
    );
    loadLessons();
    loadInvoices();
  }, []);

  useEffect(() => {
    if (!token) return;
    getKindergartens().then((list: KG[]) => setKindergartens(list || []));
  }, [token]);

  useEffect(() => {
    if (!token) return;
    if (filterKindergartenId) {
      getGroupsByKindergarten(filterKindergartenId).then((list: Group[]) =>
        setGroups(list || [])
      );
      setFilterGroupId("");
    } else {
      setGroups([]);
      setFilterGroupId("");
    }
  }, [token, filterKindergartenId]);

  useEffect(() => {
    loadInvoicesFiltered();
  }, [filterKindergartenId, filterGroupId, filterStatus, filterIssueMonth]);

  const loadLessons = async () => {
    if (!token) return;
    const fetched = await getRequest<LessonDTO[]>("admin/lessons");
    setLessons(fetched || []);
  };

  const loadInvoices = async () => {
    if (!token) return;
    const fetched = await getRequest<FullInvoiceDTO[]>("admin/invoices");
    setInvoices(sortMergeInvoices(invoices, fetched || []));
  };

  const loadInvoicesFiltered = async () => {
    if (!token) return;
    const params: string[] = [];
    if (filterKindergartenId)
      params.push(`kindergartenId=${encodeURIComponent(filterKindergartenId)}`);
    if (filterGroupId)
      params.push(`groupId=${encodeURIComponent(filterGroupId)}`);
    if (filterStatus) params.push(`status=${encodeURIComponent(filterStatus)}`);
    if (filterIssueMonth)
      params.push(`issueMonth=${encodeURIComponent(filterIssueMonth)}`);

    const url =
      "admin/invoices/search" + (params.length ? `?${params.join("&")}` : "");
    const fetched = await getRequest<FullInvoiceDTO[]>(url);
    setInvoices(sortMergeInvoices(invoices, fetched || []));
  };

  const sortMergeInvoices = (
    prev: FullInvoiceDTO[],
    fetched: FullInvoiceDTO[]
  ) => {
    const map = new Map(prev.map((inv) => [inv.id, inv]));
    return fetched
      .map((inv) => map.get(inv.id) || inv)
      .sort((a, b) => a.id - b.id);
  };

  const handleDeleteInvoice = async (invoice: FullInvoiceDTO) => {
    if (!token || invoice.id === undefined) return;
    if (
      window.confirm(
        `Vai esat pārliecināts, ka vēlaties dzēst rēķinu Nr.${invoice.id}?`
      )
    ) {
      await deleteInvoice(invoice.id);
      setInvoices((prev) => prev.filter((i) => i.id !== invoice.id));
    }
  };

  const handleInvoiceSave = async (invoice: FullInvoiceDTO) => {
    try {
      const savedInvoice = await postRequest<FullInvoiceDTO>(
        "admin/invoice",
        invoice
      );
      setInvoices((invs) => invs.concat(savedInvoice));
    } catch (error) {
      console.error("Kļūda, saglabājot rēķinu:", error);
      alert("Kļūda, saglabājot rēķinu");
    }
  };

  const toDateInputValue = (d?: Date | string | null): string => {
    if (!d) return "";
    const date = typeof d === "string" ? new Date(d) : d;
    if (isNaN(date.getTime())) return "";
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleGenerateInvoices = async (data: {
    startDate: string;
    endDate: string;
  }) => {
    try {
      const drafts = await postRequest<FullInvoiceDTO[]>(
        "admin/invoices/draft",
        data
      );
      await postRequest("admin/invoices", drafts);
      await loadInvoicesFiltered();
      alert("Invoices generated successfully");
    } catch (error) {
      console.error("Kļūda, ģenerējot rēķinus:", error);
      alert("Кļūda, ģenerējot рēķinus");
    }
  };

  const btnClass = (active: boolean) =>
    `btn ${active ? "btn-primary" : "btn-secondary"}`;

  return (
    <div>
      <h2 className="text-3xl">Rēķinu izrakstīšana</h2>

      {/* переключатели */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button className={btnClass(showManual)} onClick={() => setShowManual((v) => !v)}>
          Мануальное выставление счетов
        </button>
        <button className={btnClass(showGenerate)} onClick={() => setShowGenerate((v) => !v)}>
          Массовая генерация счетов
        </button>
        <button className={btnClass(showEmail)} onClick={() => setShowEmail((v) => !v)}>
          Разослать e-mail счетов
        </button>
      </div>

      {/* формы: grid 12 колонок, на xl — 5/12 + 2/12 + 5/12 */}
      <div className="mt-4 grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {showManual && (
          <div className="min-w-0 overflow-hidden p-4 rounded border bg-white xl:col-span-5">
            <InvoiceForm
              usersInfo={usersInfo}
              lessons={lessons}
              onSave={handleInvoiceSave}
            />
          </div>
        )}

        {showGenerate && (
          <div className="min-w-0 overflow-hidden p-4 rounded border bg-white xl:col-span-2">
            <GenerateInvoicesForm
              kindergartens={kindergartens}
              onGenerate={handleGenerateInvoices}
            />
          </div>
        )}

        {showEmail && (
          <div className="min-w-0 overflow-hidden p-4 rounded border bg-white xl:col-span-5">
            <EmailBlastForm />
          </div>
        )}
      </div>

      {/* фильтры */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
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
          <label className="text-sm mb-1 block">Statuss</label>
          <select
            className="form-control"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">— Visi —</option>
            <option value="NOT_PAID">NOT_PAID</option>
            <option value="PAID">PAID</option>
            <option value="EXPIRED">EXPIRED</option>
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
              setFilterStatus("");
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

      {/* таблица */}
      <CrudTable
        excludeColumns={["lessons", "attendanceIds", "attendances", "actions"]}
        columnTransormers={{
          amount: (v) => parseFloat(v) / 100 + "€",
        }}
        items={invoices as Required<FullInvoiceDTO>[]}
        onDelete={(item) => {
          const invoice = invoices.find((inv) => inv.id === item.id);
          if (invoice) handleDeleteInvoice(invoice);
        }}
        editFormSupplier={(it, close, isOpen) => {
          const [userAttendances, setUserAttendances] = useState<AttendanceDTO[]>(
            []
          );
          const [item, setItem] = useState<InvoiceState>({
            ...it,
            attendances: Array.isArray(it.attendances) ? it.attendances : [],
            attendancesMeta: [],
          });

          useEffect(() => {
            if (token && it.id && isOpen) {
              getRequest<AttendanceDTO[]>(
                `admin/invoice/${it.id}/potential-attendances`
              ).then((at) => {
                setUserAttendances(at);
                const ats: AttendanceDTO[] = item.attendances!.map(
                  (id) => at.find((i) => i.id == id)!
                );
                setItem({ ...item, attendancesMeta: ats });
              });
            }
          }, [it.id, token, isOpen]);

          const toDateInputValueInner = (d?: Date | string | null): string => {
            if (!d) return "";
            const date = typeof d === "string" ? new Date(d) : d;
            if (isNaN(date.getTime())) return "";
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, "0");
            const dd = String(date.getDate()).padStart(2, "0");
            return `${yyyy}-${mm}-${dd}`;
          };

          return (
            <RootObjectForm rootObject={item} rootObjectSetter={setItem}>
              <NumberInput field="amount" header="Summa" />

              <div className="mt-3">
                <label className="block text-sm mb-1">Statuss</label>
                <select
                  className="form-control"
                  value={item.status || ""}
                  onChange={(e) => {
                    const next = e.target.value as "NOT_PAID" | "PAID" | "EXPIRED";
                    setItem((prev) => {
                      let prd = prev.paymentReceiveDate ?? null;
                      if (next === "PAID" && !prd) prd = new Date();
                      if (next !== "PAID") prd = null;
                      return { ...prev, status: next, paymentReceiveDate: prd };
                    });
                  }}
                >
                  <option value="NOT_PAID">NOT_PAID</option>
                  <option value="PAID">PAID</option>
                  <option value="EXPIRED">EXPIRED</option>
                </select>
              </div>

              <div className="mt-3">
                <label className="block text-sm mb-1">
                  Maksājuma saņemšanas datums
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={toDateInputValueInner(item.paymentReceiveDate ?? null)}
                  onChange={(e) => {
                    const v = e.target.value?.trim();
                    setItem((prev) => {
                      if (v) {
                        return { ...prev, paymentReceiveDate: v, status: "PAID" };
                      }
                      return { ...prev, paymentReceiveDate: null, status: "NOT_PAID" };
                    });
                  }}
                />
              </div>

              {userAttendances.length > 0 && (
                <MultiSelect
                  field="attendancesMeta"
                  columns={["id", "lesson.topic", "date"]}
                  columnMap={{
                    id: "Stundas ID",
                    "lesson.topic": "Tēma",
                    date: "Datums",
                  }}
                  options={userAttendances.map((i) => ({
                    ...i,
                    name: `${i.lesson.topic} (${i.lesson.date})`,
                  }))}
                />
              )}

              <div className="mt-3 flex justify-end space-x-2">
                <button
                  onClick={async () => {
                    const payload = {
                      ...item,
                      dateIssued: item.dateIssued,
                      dueDate: item.dueDate,
                      paymentReceiveDate: item.paymentReceiveDate ?? null,
                      attendances: item.attendancesMeta.map((a) => a!.id),
                    };
                    await putRequest("admin/invoice", payload);
                    const fresh = await getRequest<FullInvoiceDTO>(
                      `admin/invoice/${item.id}`
                    );
                    setInvoices((prev) =>
                      prev.map((inv) => (inv.id === fresh.id ? fresh : inv))
                    );
                    close();
                  }}
                  className="btn btn-primary"
                >
                  Saglabāt
                </button>
                <button onClick={close} className="btn btn-secondary">
                  Aizvērt
                </button>
              </div>
            </RootObjectForm>
          );
        }}
      />
    </div>
  );
};

export default InvoicesTab;
