import { useCallback, useEffect, useState } from "react";
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from "../../api/customers.js";
import Modal from "../../components/common/Modal.jsx";
import DataTable from "../../components/common/DataTable.jsx";
import Badge from "../../components/common/Badge.jsx";

const EMPTY = { name: "", email: "", phone: "", address: "", city: "", credit_limit: "0", is_active: true };

const COLUMNS = [
  { key: "code",   label: "Code" },
  { key: "name",   label: "Name" },
  { key: "email",  label: "Email" },
  { key: "phone",  label: "Phone" },
  { key: "city",   label: "City" },
  { key: "balance", label: "Balance", render: (r) => `$${parseFloat(r.balance||0).toFixed(2)}` },
  { key: "credit_limit", label: "Credit", render: (r) => `$${parseFloat(r.credit_limit||0).toFixed(2)}` },
  { key: "is_active", label: "Status", render: (r) => <Badge label={r.is_active ? "Active" : "Inactive"} variant={r.is_active ? "success" : "warning"} /> },
];

export default function CustomersPage() {
  const [rows, setRows]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState(EMPTY);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await getCustomers({ search }); setRows(r.data.results ?? r.data); }
    catch { setRows([]); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm(EMPTY); setEditing(null); setError(""); setShowModal(true); };
  const openEdit   = (row) => { setForm({ ...row, credit_limit: row.credit_limit ?? "0" }); setEditing(row); setError(""); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Name is required."); return; }
    setSaving(true); setError("");
    try {
      editing ? await updateCustomer(editing.id, form) : await createCustomer(form);
      setShowModal(false); load();
    } catch (e) { setError(e.response?.data?.detail || JSON.stringify(e.response?.data) || "Save failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await deleteCustomer(confirmDelete.id); setConfirmDelete(null); load(); }
    catch { alert("Delete failed"); }
  };

  const f = (k) => (v) => setForm((p) => ({ ...p, [k]: typeof v === "object" ? v.target?.type === "checkbox" ? v.target.checked : v.target.value : v }));

  return (
    <div style={{ padding: 24 }}>
      <div className="page-header">
        <h1>Customers</h1>
        <button className="btn primary" onClick={openCreate}>+ Add Customer</button>
      </div>
      <div className="page-toolbar">
        <input className="search-input" placeholder="Search customers…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="table-wrapper">
        <DataTable columns={COLUMNS} rows={rows} loading={loading}
          onEdit={openEdit} onDelete={(r) => setConfirmDelete(r)} />
      </div>

      {showModal && (
        <Modal title={editing ? "Edit Customer" : "Add Customer"} size="md" onClose={() => setShowModal(false)}>
          {error && <div className="alert error">{error}</div>}
          <div className="form-grid">
            <div className="form-row">
              <div className="field"><label>Name *</label><input value={form.name} onChange={f("name")} /></div>
              <div className="field"><label>Email</label><input value={form.email} onChange={f("email")} /></div>
            </div>
            <div className="form-row">
              <div className="field"><label>Phone</label><input value={form.phone} onChange={f("phone")} /></div>
              <div className="field"><label>City</label><input value={form.city} onChange={f("city")} /></div>
            </div>
            <div className="field"><label>Address</label><textarea value={form.address} onChange={f("address")} /></div>
            <div className="form-row">
              <div className="field"><label>Credit Limit</label><input type="number" value={form.credit_limit} onChange={f("credit_limit")} /></div>
              <div className="field checkbox-field" style={{ display:"flex", alignItems:"center", gap:8, marginTop:20 }}>
                <input type="checkbox" checked={form.is_active} onChange={f("is_active")} />
                <label>Active</label>
              </div>
            </div>
          </div>
          <div className="form-actions">
            <button className="btn" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn primary" onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
          </div>
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Confirm Delete" size="sm" onClose={() => setConfirmDelete(null)}>
          <p>Delete <strong>{confirmDelete.name}</strong>?</p>
          <div className="form-actions">
            <button className="btn" onClick={() => setConfirmDelete(null)}>Cancel</button>
            <button className="btn danger" onClick={handleDelete}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
