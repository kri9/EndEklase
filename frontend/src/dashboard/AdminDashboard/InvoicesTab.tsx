import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "src/redux/store";
import {
  getRequest,
  postRequest,
  putRequest,
  deleteInvoice,
  getLessonsByUser,
  getKindergartens,
  getGroupsByKindergarten,
} from "src/api";

import InvoiceForm from "./InvoiceForm";
import GenerateInvoicesForm from "./GenerateInvoicesForm";
import CrudTable from "./common/CrudTable";
import RootObjectForm from "./common/RootObjectForm";
import NumberInput from "./common/NumberInput";
import MultiSelect from "./common/MultiSelect";
import { InvoiceDTO, LessonDTO } from "src/common/interfaces";

type KG = { id: string | number; name: string };
type Group = { id: string | number; name: string };

const InvoicesTab: React.FC = () => {
  const token = useSelector((state: RootState) => state.auth.token);

  const [usersInfo, setUsersInfo] = useState<
    { id: number; fullName: string }[]
  >([]);
  const [lessons, setLessons] = useState<LessonDTO[]>([]);
  const [invoices, setInvoices] = useState<InvoiceDTO[]>([]);

  const [kindergartens, setKindergartens] = useState<KG[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [filterKindergartenId, setFilterKindergartenId] = useState<string>("");
  const [filterGroupId, setFilterGroupId] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  useEffect(() => {
    getRequest<{ id: number; fullName: string }[]>("admin/user-emails").then(
      setUsersInfo,
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
        setGroups(list || []),
      );
      setFilterGroupId("");
    } else {
      setGroups([]);
      setFilterGroupId("");
    }
  }, [token, filterKindergartenId]);

  useEffect(() => {
    loadInvoicesFiltered();
  }, [filterKindergartenId, filterGroupId, filterStatus]);

  const loadLessons = async () => {
    if (!token) return;
    const fetched = await getRequest<LessonDTO[]>("admin/lessons");
    setLessons(fetched || []);
  };

  const loadInvoices = async () => {
    if (!token) return;
    const fetched = await getRequest<InvoiceDTO[]>("admin/invoices");
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

    const url =
      "admin/invoices/search" + (params.length ? `?${params.join("&")}` : "");
    const fetched = await getRequest<InvoiceDTO[]>(url);
    setInvoices(sortMergeInvoices(invoices, fetched || []));
  };

  const sortMergeInvoices = (prev: InvoiceDTO[], fetched: InvoiceDTO[]) => {
    const map = new Map(prev.map((inv) => [inv.id, inv]));
    return fetched
      .map((inv) => map.get(inv.id) || inv)
      .sort((a, b) => a.id - b.id);
  };

  const handleDeleteInvoice = async (invoice: InvoiceDTO) => {
    if (!token || invoice.id === undefined) return;
    if (
      window.confirm(
        `Vai esat pārliecināts, ka vēlaties dzēst rēķinu Nr.${invoice.id}?`,
      )
    ) {
      await deleteInvoice(invoice.id);
      setInvoices((prev) => prev.filter((i) => i.id !== invoice.id));
    }
  };

  const handleInvoiceSave = async (invoice: InvoiceDTO) => {
    try {
      const savedInvoice = await postRequest<InvoiceDTO>(
        "admin/invoice",
        invoice,
      );
      setInvoices((invs) => invs.concat(savedInvoice));
    } catch (error) {
      console.error("Kļūda, saglabājot rēķinu:", error);
      alert("Kļūda, saglabājot rēķину");
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
      await postRequest("admin/invoices", data);
      await loadInvoicesFiltered();
      alert("Invoices generated successfully");
    } catch (error) {
      console.error("Kļūda, ģenerējot rēķinus:", error);
      alert("Kļūda, ģenerējot рēķinus");
    }
  };

  return (
    <div>
      <h2 className="text-3xl">Rēķinu izrakstīšana</h2>

      {/* формы слева — как было */}
      <div className="d-flex">
        <InvoiceForm
          usersInfo={usersInfo}
          lessons={lessons}
          onSave={handleInvoiceSave}
        />
        <GenerateInvoicesForm
          kindergartens={kindergartens}
          onGenerate={handleGenerateInvoices}
        />
      </div>

      {/* ФИЛЬТРЫ над таблицей */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
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
            {/* если используешь EXPIRED — добавь: <option value="EXPIRED">EXPIRED</option> */}
          </select>
        </div>

        <div>
          <button
            className="btn btn-secondary mt-6"
            onClick={() => {
              setFilterKindergartenId("");
              setFilterGroupId("");
              setFilterStatus("");
            }}
          >
            Notīrīt filtrus
          </button>
        </div>
      </div>

      {/* ТАБЛИЦА (CrudTable оставляем как есть) */}
      <CrudTable
        excludeColumns={["lessons"]}
        items={invoices as Required<InvoiceDTO>[]}
        onDelete={(item) => {
          const invoice = invoices.find((inv) => inv.id === item.id);
          if (invoice) handleDeleteInvoice(invoice);
        }}
        editFormSupplier={(it, close, isOpen) => {
          const [item, setItem] = useState<InvoiceDTO>({
            ...it,
            lessons: Array.isArray(it.lessons) ? it.lessons : [],
          });

          const [userLessons, setUserLessons] = useState<LessonDTO[]>([]);

          useEffect(() => {
            if (token && it.userId && isOpen) {
              getLessonsByUser(it.userId).then(setUserLessons);
            }
          }, [it.userId, token, isOpen]);

          useEffect(() => {
            if (userLessons.length > 0) {
              setItem((prev) => ({ ...prev, lessons: userLessons }));
            }
          }, [userLessons]);

      return (
        <RootObjectForm rootObject={item} rootObjectSetter={setItem}>
          <NumberInput field="amount" header="Summa" />

          {/* СТАТУС */}
          <div className="mt-3">
            <label className="block text-sm mb-1">Statuss</label>
            <select
              className="form-control"
              value={item.status || ""}
              onChange={(e) => {
                const next = e.target.value as "NOT_PAID" | "PAID" | "EXPIRED";
                setItem((prev) => {
                  let prd = prev.paymentReceiveDate ?? null;
                  if (next === "PAID" && !prd) prd = (new Date());
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

          {/* ДАТА ОПЛАТЫ: дата -> статус PAID, очистил -> NOT_PAID */}
          <div className="mt-3">
            <label className="block text-sm mb-1">Maksājuma saņemšanas datums</label>
            <input
              type="date"
              className="form-control"
              value={toDateInputValue(item.paymentReceiveDate ?? null)}
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

          <MultiSelect
            field="lessons"
            columns={["id", "topic", "date"]}
            columnMap={{ id: "Stundas ID", topic: "Tēma", date: "Datums" }}
            options={userLessons.map((i) => ({
              ...i,
              name: `${i.topic} (${i.date})`,
            }))}
          />

          <div className="mt-3 flex justify-end space-x-2">
            <button
              onClick={async () => {
                const payload = {
                  ...item,
                  dateIssued: (item.dateIssued),
                  dueDate: (item.dueDate),
                  paymentReceiveDate: (item.paymentReceiveDate ?? null),
                  lessons: Array.isArray(item.lessons)
                    ? item.lessons.map((l: any) => (typeof l === "number" ? l : l.id))
                    : item.lessons,
                };
                await putRequest("admin/invoice", payload);
                const fresh = await getRequest<InvoiceDTO>(`admin/invoice/${item.id}`);
                setInvoices((prev) => prev.map((inv) => (inv.id === fresh.id ? fresh : inv)));
                close();
              }}
              className="btn btn-primary"
            >
              Saglabāt
            </button>
            <button onClick={close} className="btn btn-secondary">Aizvērt</button>
          </div>
        </RootObjectForm>
      );

        }}
      />
    </div>
  );
};

export default InvoicesTab;
