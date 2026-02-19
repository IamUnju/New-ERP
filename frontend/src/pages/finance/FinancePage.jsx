import { useCallback, useEffect, useState } from "react";
import { getExpenses, createExpense, updateExpense, deleteExpense, getIncome, createIncome, updateIncome, deleteIncome, getFinanceSummary } from "../../api/finance.js";
import Modal from "../../components/common/Modal.jsx";
import DataTable from "../../components/common/DataTable.jsx";
import Badge from "../../components/common/Badge.jsx";

const STATUS_COLORS = { pending:"warning", approved:"info", paid:"success", rejected:"danger" };
const EMPTY_EXP = { title:"", amount:"", expense_date: new Date().toISOString().split("T")[0], status:"pending", description:"" };
const EMPTY_INC = { title:"", amount:"", income_date: new Date().toISOString().split("T")[0], description:"" };

const EXP_COLS = [
  { key:"reference", label:"Ref" },
  { key:"title", label:"Title" },
  { key:"expense_date", label:"Date" },
  { key:"amount", label:"Amount", render:(r)=>`$${parseFloat(r.amount||0).toFixed(2)}` },
  { key:"status", label:"Status", render:(r)=><Badge label={r.status} variant={STATUS_COLORS[r.status]||"info"} /> },
];
const INC_COLS = [
  { key:"reference", label:"Ref" },
  { key:"title", label:"Title" },
  { key:"income_date", label:"Date" },
  { key:"amount", label:"Amount", render:(r)=>`$${parseFloat(r.amount||0).toFixed(2)}` },
];

function SumCard({ label, value, color }) {
  return (
    <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:8, padding:"18px 24px", flex:1, minWidth:160 }}>
      <div style={{ fontSize:12, color:"#6b7280", marginBottom:4 }}>{label}</div>
      <div style={{ fontSize:22, fontWeight:700, color }}>${parseFloat(value||0).toLocaleString(undefined,{minimumFractionDigits:2})}</div>
    </div>
  );
}

export default function FinancePage() {
  const [tab, setTab]             = useState("expenses");
  const [expenses, setExpenses]   = useState([]);
  const [income, setIncome]       = useState([]);
  const [summary, setSummary]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState(EMPTY_EXP);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const isExp = tab === "expenses";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [er, ir, sr] = await Promise.all([
        getExpenses(), getIncome(),
        getFinanceSummary({ year: new Date().getFullYear() }),
      ]);
      setExpenses(er.data.results ?? er.data);
      setIncome(ir.data.results ?? ir.data);
      setSummary(sr.data);
    } catch { /* noop */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm(isExp ? EMPTY_EXP : EMPTY_INC); setEditing(null); setError(""); setShowModal(true); };
  const openEdit   = (row) => { setForm(row); setEditing(row); setError(""); setShowModal(true); };

  const handleSave = async () => {
    if (!form.title?.trim()) { setError("Title required."); return; }
    setSaving(true); setError("");
    try {
      if (isExp) { editing ? await updateExpense(editing.id, form) : await createExpense(form); }
      else       { editing ? await updateIncome(editing.id, form) : await createIncome(form); }
      setShowModal(false); load();
    } catch (e) { setError(e.response?.data?.detail || "Save failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      if (isExp) await deleteExpense(confirmDelete.id);
      else       await deleteIncome(confirmDelete.id);
      setConfirmDelete(null); load();
    } catch { alert("Delete failed"); }
  };

  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div style={{ padding: 24 }}>
      <div className="page-header">
        <h1>Finance</h1>
        <button className="btn primary" onClick={openCreate}>+ Add {isExp ? "Expense" : "Income"}</button>
      </div>

      {/* Summary cards */}
      {summary && (
        <div style={{ display:"flex", gap:16, marginBottom:24, flexWrap:"wrap" }}>
          <SumCard label="Total Income"   value={summary.total_income}   color="#18b34a" />
          <SumCard label="Total Expenses" value={summary.total_expenses} color="#dc2626" />
          <SumCard label="Net Profit"     value={summary.net_profit}     color={parseFloat(summary.net_profit)>=0?"#2563eb":"#dc2626"} />
        </div>
      )}

      {/* Tabs */}
      <div style={{ display:"flex", gap:4, marginBottom:16, borderBottom:"2px solid #e5e7eb" }}>
        {["expenses","income"].map(t=>(
          <button key={t} onClick={()=>setTab(t)}
            style={{padding:"8px 20px",background:"none",border:"none",cursor:"pointer",fontSize:13,fontWeight:tab===t?700:400,borderBottom:tab===t?"2px solid #18b34a":"2px solid transparent",color:tab===t?"#18b34a":"#374151",marginBottom:-2}}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>

      <div className="table-wrapper">
        <DataTable columns={isExp ? EXP_COLS : INC_COLS} rows={isExp ? expenses : income} loading={loading}
          onEdit={openEdit} onDelete={r=>setConfirmDelete(r)} />
      </div>

      {showModal && (
        <Modal title={`${editing?"Edit":"Add"} ${isExp?"Expense":"Income"}`} size="md" onClose={()=>setShowModal(false)}>
          {error && <div className="alert error">{error}</div>}
          <div className="form-grid">
            <div className="form-row">
              <div className="field"><label>Title *</label><input value={form.title} onChange={f("title")} /></div>
              <div className="field"><label>Amount</label><input type="number" value={form.amount} onChange={f("amount")} /></div>
            </div>
            <div className="form-row">
              <div className="field"><label>Date</label><input type="date" value={isExp?form.expense_date:form.income_date} onChange={f(isExp?"expense_date":"income_date")} /></div>
              {isExp && <div className="field"><label>Status</label>
                <select value={form.status} onChange={f("status")}>
                  {["pending","approved","paid","rejected"].map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </div>}
            </div>
            <div className="field"><label>Description</label><textarea value={form.description} onChange={f("description")} /></div>
          </div>
          <div className="form-actions">
            <button className="btn" onClick={()=>setShowModal(false)}>Cancel</button>
            <button className="btn primary" onClick={handleSave} disabled={saving}>{saving?"Saving…":"Save"}</button>
          </div>
        </Modal>
      )}
      {confirmDelete && (
        <Modal title="Confirm Delete" size="sm" onClose={()=>setConfirmDelete(null)}>
          <p>Delete <strong>{confirmDelete.title}</strong>?</p>
          <div className="form-actions">
            <button className="btn" onClick={()=>setConfirmDelete(null)}>Cancel</button>
            <button className="btn danger" onClick={handleDelete}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
