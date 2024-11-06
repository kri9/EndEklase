import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getRequest, postRequest, putRequest } from "src/api";
import { RootState } from "src/redux/store";
import InvoiceForm from "./InvoiceForm";
import GenerateInvoicesForm from "./GenerateInvoicesForm";
import InvoiceList from "./InvoiceList";

const InvoicesTab: React.FC = () => {
  const [usersInfo, setUsersInfo] = useState<{ id: number; fullName: string }[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [kindergartens, setKindergartens] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [filters, setFilters] = useState<any>({
    fullName: "",
    dateIssuedFrom: "",
    dateIssuedTo: "",
    dueDateFrom: "",
    dueDateTo: "",
    status: "",
  });
  const [editingInvoiceId, setEditingInvoiceId] = useState<number | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);

  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    getRequest<{ id: number; fullName: string }[]>("admin/user-emails").then(setUsersInfo);
    loadLessons();
    loadGroups();
    loadKindergartens();
    loadInvoices();
  }, []);

  const loadLessons = async () => {
    if (token) {
      const fetchedLessons = await getRequest<any[]>("admin/lessons");
      setLessons(fetchedLessons || []);
    }
  };

  const loadGroups = async () => {
    if (token) {
      const fetchedGroups = await getRequest<any[]>("admin/groups");
      setGroups(fetchedGroups || []);
    }
  };

  const loadKindergartens = async () => {
    if (token) {
      const fetchedKindergartens = await getRequest<any[]>("admin/kindergartens");
      setKindergartens(fetchedKindergartens || []);
    }
  };

  const loadInvoices = async () => {
    if (token) {
      const fetchedInvoices = await getRequest<any[]>("admin/invoices");
      setInvoices(fetchedInvoices || []);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleEdit = (invoice: any) => {
    setEditingInvoiceId(invoice.id);
    setEditingInvoice({ ...invoice });
  };

  const handleSave = async () => {
    if (editingInvoiceId && editingInvoice) {
      await putRequest(`admin/invoice/${editingInvoiceId}`, editingInvoice);
      alert("Изменения сохранены");
      setEditingInvoiceId(null);
      setEditingInvoice(null);
      loadInvoices();
    }
  };

  const handleCancel = () => {
    setEditingInvoiceId(null);
    setEditingInvoice(null);
  };

  const handleInvoiceSave = (invoice: any) => {
    postRequest("admin/invoice", invoice).then(() => {
      loadInvoices();
    });
  };

  const handleGenerateInvoices = (from: string, to: string, groupId: number | "") => {
    // Логика генерации счетов
    postRequest("admin/generate-invoices", { from, to, groupId }).then(() => {
      loadInvoices();
    });
  };

  return (
    <div>
      <h2>Выставление счетов</h2>
      <div className="d-flex">
        <InvoiceForm usersInfo={usersInfo} lessons={lessons} onSave={handleInvoiceSave} />
        <GenerateInvoicesForm kindergartens={kindergartens} onGenerate={handleGenerateInvoices} />
      </div>
      <InvoiceList
        invoices={invoices}
        filters={filters}
        onFilterChange={handleFilterChange}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancel={handleCancel}
        editingInvoiceId={editingInvoiceId}
        editingInvoice={editingInvoice}
        setEditingInvoice={setEditingInvoice}
      />
    </div>
  );
};

export default InvoicesTab;
