import { useCallback, useEffect, useState } from "react";
import {
  getStockLevels, getStockMovements, createStockMovement,
} from "../../api/inventory.js";
import { getProducts, getWarehouses, createWarehouse, updateWarehouse, deleteWarehouse } from "../../api/products.js";
import Modal from "../../components/common/Modal.jsx";
import DataTable from "../../components/common/DataTable.jsx";
import Badge from "../../components/common/Badge.jsx";

const EMPTY_WH = { name:"", address:"", is_active:true };
const EMPTY_MOV = { product:"", warehouse:"", movement_type:"in", quantity:"", reference:"", note:"" };

const WH_COLS = [
  { key:"code",  label:"Code" },
  { key:"name",  label:"Warehouse" },
  { key:"address", label:"Address" },
  { key:"is_active", label:"Status", render:(r)=><Badge label={r.is_active?"Active":"Inactive"} variant={r.is_active?"success":"warning"} /> },
];

const LEVEL_COLS = [
  { key:"product_sku",    label:"SKU" },
  { key:"product_name",  label:"Product" },
  { key:"warehouse_name",label:"Warehouse" },
  { key:"quantity",      label:"Qty" },
];

const MOV_COLS = [
  { key:"product_name",   label:"Product" },
  { key:"warehouse_name", label:"Warehouse" },
  { key:"movement_type",  label:"Type" },
  { key:"quantity",       label:"Qty" },
  { key:"reference",      label:"Reference" },
];

export default function StockPage() {
  const [tab, setTab]               = useState("levels");
  const [warehouses, setWarehouses] = useState([]);
  const [levels, setLevels]         = useState([]);
  const [movements, setMovements]   = useState([]);
  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showWHModal, setShowWHModal]   = useState(false);
  const [showMovModal, setShowMovModal] = useState(false);
  const [editingWH, setEditingWH]   = useState(null);
  const [formWH, setFormWH]         = useState(EMPTY_WH);
  const [formMov, setFormMov]       = useState(EMPTY_MOV);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [wr, lr, mr, pr] = await Promise.all([getWarehouses(), getStockLevels(), getStockMovements(), getProducts()]);
      setWarehouses(wr.data.results ?? wr.data);
      setLevels(lr.data.results ?? lr.data);
      setMovements(mr.data.results ?? mr.data);
      setProducts(pr.data.results ?? pr.data);
    } catch { /* noop */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const fw = (k) => (e) => setFormWH(p => ({ ...p, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  const fm = (k) => (e) => setFormMov(p => ({ ...p, [k]: e.target.value }));

  const saveWH = async () => {
    if (!formWH.name?.trim()) { setError("Name required"); return; }
    setSaving(true); setError("");
    try {
      editingWH ? await updateWarehouse(editingWH.id, formWH) : await createWarehouse(formWH);
      setShowWHModal(false); load();
    } catch (e) { setError(e.response?.data?.detail || "Failed"); }
    finally { setSaving(false); }
  };

  const saveMov = async () => {
    if (!formMov.product || !formMov.warehouse || !formMov.quantity) { setError("Product, warehouse and qty required"); return; }
    setSaving(true); setError("");
    try {
      await createStockMovement(formMov);
      setShowMovModal(false); load();
    } catch (e) { setError(e.response?.data?.detail || "Failed"); }
    finally { setSaving(false); }
  };

  const handleDeleteWH = async () => {
    try { await deleteWarehouse(confirmDelete.id); setConfirmDelete(null); load(); }
    catch { alert("Delete failed"); }
  };

  return (
    <div style={{ padding: 24 }}>
      <div className="page-header">
        <h1>Stock / Inventory</h1>
        <div style={{ display:"flex", gap:8 }}>
          {tab === "warehouses" && <button className="btn primary" onClick={()=>{ setFormWH(EMPTY_WH); setEditingWH(null); setError(""); setShowWHModal(true); }}>+ Add Warehouse</button>}
          <button className="btn primary" onClick={()=>{ setFormMov(EMPTY_MOV); setError(""); setShowMovModal(true); }}>+ Movement</button>
        </div>
      </div>

      <div style={{ display:"flex", gap:4, marginBottom:16, borderBottom:"2px solid #e5e7eb" }}>
        {["levels","movements","warehouses"].map(t=>(
          <button key={t} onClick={()=>setTab(t)}
            style={{padding:"8px 20px",background:"none",border:"none",cursor:"pointer",fontSize:13,fontWeight:tab===t?700:400,borderBottom:tab===t?"2px solid #18b34a":"2px solid transparent",color:tab===t?"#18b34a":"#374151",marginBottom:-2}}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>

      <div className="table-wrapper">
        {tab === "levels"      && <DataTable columns={LEVEL_COLS} rows={levels}    loading={loading} />}
        {tab === "movements"   && <DataTable columns={MOV_COLS}   rows={movements} loading={loading} />}
        {tab === "warehouses"  && <DataTable columns={WH_COLS}    rows={warehouses} loading={loading}
            onEdit={r=>{ setFormWH(r); setEditingWH(r); setError(""); setShowWHModal(true); }}
            onDelete={r=>setConfirmDelete(r)} />}
      </div>

      {showWHModal && (
        <Modal title={editingWH?"Edit Warehouse":"Add Warehouse"} size="sm" onClose={()=>setShowWHModal(false)}>
          {error && <div className="alert error">{error}</div>}
          <div className="form-grid">
            <div className="field"><label>Name *</label><input value={formWH.name} onChange={fw("name")} /></div>
            <div className="field"><label>Address</label><textarea value={formWH.address} onChange={fw("address")} /></div>
            <div className="field checkbox-field" style={{display:"flex",alignItems:"center",gap:8}}>
              <input type="checkbox" checked={formWH.is_active} onChange={fw("is_active")} /><label>Active</label>
            </div>
          </div>
          <div className="form-actions">
            <button className="btn" onClick={()=>setShowWHModal(false)}>Cancel</button>
            <button className="btn primary" onClick={saveWH} disabled={saving}>{saving?"Saving…":"Save"}</button>
          </div>
        </Modal>
      )}

      {showMovModal && (
        <Modal title="Record Stock Movement" size="md" onClose={()=>setShowMovModal(false)}>
          {error && <div className="alert error">{error}</div>}
          <div className="form-grid">
            <div className="form-row">
              <div className="field"><label>Product *</label>
                <select value={formMov.product} onChange={fm("product")}>
                  <option value="">Select…</option>
                  {products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="field"><label>Warehouse *</label>
                <select value={formMov.warehouse} onChange={fm("warehouse")}>
                  <option value="">Select…</option>
                  {warehouses.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="field"><label>Type</label>
                <select value={formMov.movement_type} onChange={fm("movement_type")}>
                  {["in","out","transfer","adjust"].map(t=><option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="field"><label>Quantity *</label><input type="number" value={formMov.quantity} onChange={fm("quantity")} /></div>
            </div>
            <div className="field"><label>Reference</label><input value={formMov.reference} onChange={fm("reference")} /></div>
            <div className="field"><label>Note</label><textarea value={formMov.note} onChange={fm("note")} /></div>
          </div>
          <div className="form-actions">
            <button className="btn" onClick={()=>setShowMovModal(false)}>Cancel</button>
            <button className="btn primary" onClick={saveMov} disabled={saving}>{saving?"Saving…":"Save"}</button>
          </div>
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Confirm Delete" size="sm" onClose={()=>setConfirmDelete(null)}>
          <p>Delete warehouse <strong>{confirmDelete.name}</strong>?</p>
          <div className="form-actions">
            <button className="btn" onClick={()=>setConfirmDelete(null)}>Cancel</button>
            <button className="btn danger" onClick={handleDeleteWH}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
