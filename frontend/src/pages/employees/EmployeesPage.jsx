import { useCallback, useEffect, useState } from "react";
import { getEmployees, createEmployee, updateEmployee, deleteEmployee, getDepartments } from "../../api/employees.js";
import Modal from "../../components/common/Modal.jsx";
import DataTable from "../../components/common/DataTable.jsx";
import Badge from "../../components/common/Badge.jsx";

const STATUS_COLORS = { active:"success", inactive:"warning", terminated:"danger" };
const EMPTY = { first_name:"", last_name:"", email:"", phone:"", position:"", department:"", hire_date: new Date().toISOString().split("T")[0], basic_salary:"0", status:"active", address:"" };

const COLUMNS = [
  { key:"emp_number", label:"ID" },
  { key:"full_name", label:"Name" },
  { key:"email", label:"Email" },
  { key:"position", label:"Position" },
  { key:"department_name", label:"Department" },
  { key:"basic_salary", label:"Salary", render:(r)=>`$${parseFloat(r.basic_salary||0).toLocaleString()}` },
  { key:"status", label:"Status", render:(r)=><Badge label={r.status} variant={STATUS_COLORS[r.status]||"info"} /> },
];

export default function EmployeesPage() {
  const [rows, setRows]           = useState([]);
  const [depts, setDepts]         = useState([]);
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
    try {
      const [er, dr] = await Promise.all([getEmployees({ search }), getDepartments()]);
      setRows(er.data.results ?? er.data);
      setDepts(dr.data.results ?? dr.data);
    } catch { setRows([]); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm(EMPTY); setEditing(null); setError(""); setShowModal(true); };
  const openEdit   = (row) => { setForm({ ...row, department: row.department ?? "" }); setEditing(row); setError(""); setShowModal(true); };

  const handleSave = async () => {
    if (!form.first_name?.trim()) { setError("First name required."); return; }
    setSaving(true); setError("");
    try {
      const payload = { ...form, department: form.department || null };
      editing ? await updateEmployee(editing.id, payload) : await createEmployee(payload);
      setShowModal(false); load();
    } catch (e) { setError(e.response?.data?.detail || JSON.stringify(e.response?.data) || "Save failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await deleteEmployee(confirmDelete.id); setConfirmDelete(null); load(); }
    catch { alert("Delete failed"); }
  };

  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div style={{ padding: 24 }}>
      <div className="page-header">
        <h1>Employees</h1>
        <button className="btn primary" onClick={openCreate}>+ Add Employee</button>
      </div>
      <div className="page-toolbar">
        <input className="search-input" placeholder="Search employees…" value={search} onChange={e=>setSearch(e.target.value)} />
      </div>

      <div className="table-wrapper">
        <DataTable columns={COLUMNS} rows={rows} loading={loading} onEdit={openEdit} onDelete={r=>setConfirmDelete(r)} />
      </div>

      {showModal && (
        <Modal title={editing?"Edit Employee":"Add Employee"} size="lg" onClose={()=>setShowModal(false)}>
          {error && <div className="alert error">{error}</div>}
          <div className="form-grid">
            <div className="form-row">
              <div className="field"><label>First Name *</label><input value={form.first_name} onChange={f("first_name")} /></div>
              <div className="field"><label>Last Name</label><input value={form.last_name} onChange={f("last_name")} /></div>
            </div>
            <div className="form-row">
              <div className="field"><label>Email</label><input value={form.email} onChange={f("email")} /></div>
              <div className="field"><label>Phone</label><input value={form.phone} onChange={f("phone")} /></div>
            </div>
            <div className="form-row">
              <div className="field"><label>Position</label><input value={form.position} onChange={f("position")} /></div>
              <div className="field"><label>Department</label>
                <select value={form.department} onChange={f("department")}>
                  <option value="">— None —</option>
                  {depts.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="field"><label>Hire Date</label><input type="date" value={form.hire_date} onChange={f("hire_date")} /></div>
              <div className="field"><label>Basic Salary</label><input type="number" value={form.basic_salary} onChange={f("basic_salary")} /></div>
            </div>
            <div className="form-row">
              <div className="field"><label>Status</label>
                <select value={form.status} onChange={f("status")}>
                  {["active","inactive","terminated"].map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="field"><label>Address</label><textarea value={form.address} onChange={f("address")} /></div>
          </div>
          <div className="form-actions">
            <button className="btn" onClick={()=>setShowModal(false)}>Cancel</button>
            <button className="btn primary" onClick={handleSave} disabled={saving}>{saving?"Saving…":"Save"}</button>
          </div>
        </Modal>
      )}
      {confirmDelete && (
        <Modal title="Confirm Delete" size="sm" onClose={()=>setConfirmDelete(null)}>
          <p>Delete <strong>{confirmDelete.full_name || `${confirmDelete.first_name} ${confirmDelete.last_name}`}</strong>?</p>
          <div className="form-actions">
            <button className="btn" onClick={()=>setConfirmDelete(null)}>Cancel</button>
            <button className="btn danger" onClick={handleDelete}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
