import { useCallback, useEffect, useState } from "react";
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier, getPurchaseOrders } from "../../api/purchases.js";
import Modal from "../../components/common/Modal.jsx";
import DataTable from "../../components/common/DataTable.jsx";
import Badge from "../../components/common/Badge.jsx";

const STATUS_COLORS = { draft:"info", ordered:"warning", received:"success", partial:"info", cancelled:"danger" };
const EMPTY_SUPPLIER = { name:"", email:"", phone:"", address:"", is_active:true };

const PO_COLUMNS = [
  { key:"order_number", label:"Order #" },
  { key:"supplier_name", label:"Supplier" },
  { key:"order_date", label:"Date" },
  { key:"status", label:"Status", render:(r)=><Badge label={r.status} variant={STATUS_COLORS[r.status]||"info"} /> },
  { key:"total_amount", label:"Total", render:(r)=>`$${parseFloat(r.total_amount||0).toFixed(2)}` },
];

const SUP_COLUMNS = [
  { key:"code", label:"Code" },
  { key:"name", label:"Name" },
  { key:"email", label:"Email" },
  { key:"phone", label:"Phone" },
  { key:"balance", label:"Balance", render:(r)=>`$${parseFloat(r.balance||0).toFixed(2)}` },
  { key:"is_active", label:"Status", render:(r)=><Badge label={r.is_active?"Active":"Inactive"} variant={r.is_active?"success":"warning"} /> },
];

export default function PurchasesPage() {
  const [tab, setTab]             = useState("orders");
  const [orders, setOrders]       = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState(EMPTY_SUPPLIER);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const loadOrders    = useCallback(async () => { try { const r = await getPurchaseOrders({ search }); setOrders(r.data.results ?? r.data); } catch { setOrders([]); } }, [search]);
  const loadSuppliers = useCallback(async () => { try { const r = await getSuppliers({ search }); setSuppliers(r.data.results ?? r.data); } catch { setSuppliers([]); } }, [search]);

  useEffect(() => { setLoading(true); Promise.all([loadOrders(), loadSuppliers()]).finally(() => setLoading(false)); }, [loadOrders, loadSuppliers]);

  const openCreate = () => { setForm(EMPTY_SUPPLIER); setEditing(null); setError(""); setShowModal(true); };
  const openEdit   = (row) => { setForm(row); setEditing(row); setError(""); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name?.trim()) { setError("Name required."); return; }
    setSaving(true); setError("");
    try {
      editing ? await updateSupplier(editing.id, form) : await createSupplier(form);
      setShowModal(false); loadSuppliers();
    } catch (e) { setError(e.response?.data?.detail || "Save failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await deleteSupplier(confirmDelete.id); setConfirmDelete(null); loadSuppliers(); }
    catch { alert("Delete failed"); }
  };

  const f = (k) => (v) => setForm((p) => ({ ...p, [k]: typeof v === "object" ? (v.target.type === "checkbox" ? v.target.checked : v.target.value) : v }));

  return (
    <div style={{ padding: 24 }}>
      <div className="page-header">
        <h1>Purchases</h1>
        {tab === "suppliers" && <button className="btn primary" onClick={openCreate}>+ Add Supplier</button>}
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:4, marginBottom:16, borderBottom:"2px solid #e5e7eb" }}>
        {["orders", "suppliers"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding:"8px 20px", background:"none", border:"none", cursor:"pointer", fontSize:13, fontWeight:tab===t?700:400, borderBottom:tab===t?"2px solid #18b34a":"2px solid transparent", color:tab===t?"#18b34a":"#374151", marginBottom:-2 }}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>

      <div className="page-toolbar">
        <input className="search-input" placeholder={`Search ${tab}…`} value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="table-wrapper">
        {tab === "orders"
          ? <DataTable columns={PO_COLUMNS} rows={orders} loading={loading} />
          : <DataTable columns={SUP_COLUMNS} rows={suppliers} loading={loading} onEdit={openEdit} onDelete={r=>setConfirmDelete(r)} />
        }
      </div>

      {showModal && (
        <Modal title={editing?"Edit Supplier":"Add Supplier"} size="md" onClose={() => setShowModal(false)}>
          {error && <div className="alert error">{error}</div>}
          <div className="form-grid">
            <div className="form-row">
              <div className="field"><label>Name *</label><input value={form.name} onChange={f("name")} /></div>
              <div className="field"><label>Email</label><input value={form.email} onChange={f("email")} /></div>
            </div>
            <div className="form-row">
              <div className="field"><label>Phone</label><input value={form.phone} onChange={f("phone")} /></div>
            </div>
            <div className="field"><label>Address</label><textarea value={form.address} onChange={f("address")} /></div>
            <div className="field checkbox-field" style={{display:"flex",alignItems:"center",gap:8}}>
              <input type="checkbox" checked={form.is_active} onChange={f("is_active")} /><label>Active</label>
            </div>
          </div>
          <div className="form-actions">
            <button className="btn" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn primary" onClick={handleSave} disabled={saving}>{saving?"Saving…":"Save"}</button>
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
