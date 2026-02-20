import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios.js";
import Modal from "../../components/common/Modal.jsx";

const MASTER_CONFIG = [
  {
    key: "departments",
    label: "Department Master",
    endpoint: "/api/v1/departments/",
    openPath: "/employees",
    fields: [
      { key: "name", label: "Name" },
      { key: "description", label: "Description" },
    ],
  },
  {
    key: "suppliers",
    label: "Supplier Master",
    endpoint: "/api/v1/suppliers/",
    openPath: "/purchases",
    fields: [
      { key: "name", label: "Name" },
      { key: "contact_email", label: "Email" },
      { key: "phone", label: "Phone" },
    ],
  },
  {
    key: "main-categories",
    label: "Main Category Master",
    endpoint: "/api/v1/main-categories/",
    openPath: "/products",
    fields: [
      { key: "name", label: "Name" },
      { key: "description", label: "Description" },
    ],
  },
  {
    key: "subcategories",
    label: "Subcategory Master",
    endpoint: "/api/v1/subcategories/",
    openPath: "/products",
    fields: [
      { key: "name", label: "Name" },
      { key: "description", label: "Description" },
      { key: "parent", label: "Main Category ID", type: "number" },
    ],
  },
  {
    key: "warehouses",
    label: "Warehouse Master",
    endpoint: "/api/v1/warehouses/",
    openPath: "/stock",
    fields: [
      { key: "name", label: "Name" },
      { key: "location", label: "Location" },
    ],
  },
  {
    key: "customers",
    label: "Customer Master",
    endpoint: "/api/v1/customers/",
    openPath: "/customers",
    fields: [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "city", label: "City" },
      { key: "credit_limit", label: "Credit Limit", type: "number" },
      { key: "is_active", label: "Active", type: "bool" },
    ],
  },
  {
    key: "products",
    label: "Product Master",
    endpoint: "/api/v1/products/",
    openPath: "/products",
    fields: [
      { key: "sku", label: "SKU" },
      { key: "name", label: "Name" },
      { key: "description", label: "Description" },
      { key: "category", label: "Category ID", type: "number" },
      { key: "supplier", label: "Supplier ID", type: "number" },
      { key: "warehouse", label: "Warehouse ID", type: "number" },
      { key: "price", label: "Price", type: "number" },
      { key: "stock_quantity", label: "Stock Qty", type: "number" },
      { key: "low_stock_threshold", label: "Low Stock", type: "number" },
      { key: "is_active", label: "Active", type: "bool" },
    ],
  },
  {
    key: "employees",
    label: "Employee Master",
    endpoint: "/api/v1/employees/",
    openPath: "/employees",
    fields: [
      { key: "first_name", label: "First Name" },
      { key: "last_name", label: "Last Name" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "department", label: "Department ID", type: "number" },
      { key: "position", label: "Position" },
      { key: "basic_salary", label: "Basic Salary", type: "number" },
      {
        key: "status",
        label: "Status",
        type: "select",
        defaultValue: "active",
        options: [
          { label: "Active", value: "active" },
          { label: "Inactive", value: "inactive" },
          { label: "Terminated", value: "terminated" },
        ],
      },
    ],
  },
  {
    key: "accounts",
    label: "Finance Account Master",
    endpoint: "/api/v1/accounts/",
    openPath: "/finance",
    fields: [
      { key: "code", label: "Code" },
      { key: "name", label: "Name" },
      { key: "acct_type", label: "Type" },
      { key: "is_active", label: "Active", type: "bool" },
      { key: "description", label: "Description" },
    ],
  },
  {
    key: "roles",
    label: "Role Master",
    endpoint: "/api/v1/roles/",
    openPath: "/system",
    fields: [
      { key: "name", label: "Role" },
      { key: "description", label: "Description" },
    ],
  },
  {
    key: "screen-permissions",
    label: "Screen Permission Master",
    endpoint: "/api/v1/screen-permissions/",
    openPath: "/system",
    fields: [
      { key: "path", label: "Path" },
      { key: "description", label: "Description" },
    ],
  },
];

function splitCsvLine(line) {
  const re = /,(?=(?:[^"]*"[^"]*")*[^"]*$)/g;
  return line.split(re).map((v) => v.replace(/^"|"$/g, "").replace(/""/g, '"'));
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return [];
  const headers = splitCsvLine(lines[0]).map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line);
    return headers.reduce((acc, h, i) => {
      acc[h] = values[i] ?? "";
      return acc;
    }, {});
  });
}

function normalizeValue(value, type) {
  if (type === "number") return value === "" ? null : Number(value);
  if (type === "bool") {
    const v = String(value).toLowerCase();
    return v === "true" || v === "1" || v === "yes";
  }
  return value;
}

function buildCsv(rows, fields) {
  const header = fields.map((f) => f.key).join(",");
  const body = rows.map((r) => fields.map((f) => {
    const val = r[f.key] ?? "";
    const safe = String(val).replace(/"/g, '""');
    return safe.includes(",") ? `"${safe}"` : safe;
  }).join(","));
  return [header, ...body].join("\n");
}

export default function MastersPage() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [importTarget, setImportTarget] = useState(null);
  const [importFile, setImportFile] = useState(null);
  const [importStatus, setImportStatus] = useState("");
  const [loadingAudit, setLoadingAudit] = useState(true);
  
  // CRUD States
  const [selectedMaster, setSelectedMaster] = useState(null);
  const [records, setRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    api.get("/api/v1/audit-logs/")
      .then((res) => setAuditLogs(res.data.results ?? res.data))
      .catch(() => setAuditLogs([]))
      .finally(() => setLoadingAudit(false));
  }, []);

  // Load records when master is selected
  useEffect(() => {
    if (!selectedMaster) return;
    setLoadingRecords(true);
    api.get(selectedMaster.endpoint)
      .then((res) => setRecords(res.data.results ?? res.data))
      .catch(() => setRecords([]))
      .finally(() => setLoadingRecords(false));
  }, [selectedMaster]);

  // Open master data list
  const openMaster = (m) => {
    setSelectedMaster(m);
    setShowForm(false);
    setDeleteId(null);
  };

  // Open create form
  const openCreate = () => {
    const defaults = {};
    if (selectedMaster) {
      selectedMaster.fields.forEach((f) => {
        if (f.defaultValue !== undefined) defaults[f.key] = f.defaultValue;
      });
    }
    setFormData(defaults);
    setIsEditing(false);
    setShowForm(true);
  };

  // Open edit form
  const openEdit = (record) => {
    setFormData(record);
    setIsEditing(true);
    setShowForm(true);
  };

  // Save record (Create or Update)
  const handleSave = async () => {
    if (!selectedMaster) return;
    const payload = {};
    selectedMaster.fields.forEach((f) => {
      if (formData[f.key] !== undefined) {
        payload[f.key] = normalizeValue(formData[f.key], f.type);
      }
    });
    try {
      if (isEditing) {
        // Update
        await api.patch(`${selectedMaster.endpoint}${formData.id}/`, payload);
        api.post("/api/v1/audit-logs/log/", {
          action: "update",
          model: selectedMaster.label,
          object_repr: formData.id,
          changes: payload,
        }).catch(() => {});
      } else {
        // Create
        await api.post(selectedMaster.endpoint, payload);
        api.post("/api/v1/audit-logs/log/", {
          action: "create",
          model: selectedMaster.label,
          object_repr: formData.name || formData.id || "New",
          changes: payload,
        }).catch(() => {});
      }
      // Reload records
      const res = await api.get(selectedMaster.endpoint);
      setRecords(res.data.results ?? res.data);
      setShowForm(false);
      setFormData({});
    } catch (error) {
      alert("Error saving record: " + (error.response?.data?.detail || error.message));
    }
  };

  // Delete record
  const handleDelete = async () => {
    if (!selectedMaster || !deleteId) return;
    try {
      await api.delete(`${selectedMaster.endpoint}${deleteId}/`);
      api.post("/api/v1/audit-logs/log/", {
        action: "delete",
        model: selectedMaster.label,
        object_repr: deleteId,
      }).catch(() => {});
      // Reload records
      const res = await api.get(selectedMaster.endpoint);
      setRecords(res.data.results ?? res.data);
      setDeleteId(null);
    } catch (error) {
      alert("Error deleting record: " + (error.response?.data?.detail || error.message));
    }
  };

  const openImport = (m) => {
    setImportTarget(m);
    setImportFile(null);
    setImportStatus("");
  };

  const handleExport = async (m) => {
    const res = await api.get(m.endpoint);
    const rows = res.data.results ?? res.data;
    const csv = buildCsv(rows, m.fields);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${m.key}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    api.post("/api/v1/audit-logs/log/", {
      action: "export",
      model: m.label,
      object_repr: `${rows.length} rows`,
    }).catch(() => {});
  };

  const handleTemplate = (m) => {
    const csv = buildCsv([], m.fields);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${m.key}-template.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    if (!importFile || !importTarget) return;
    const text = await importFile.text();
    const rows = parseCsv(text);
    if (!rows.length) {
      setImportStatus("No rows found in CSV.");
      return;
    }
    let success = 0;
    let failed = 0;
    for (const row of rows) {
      const payload = {};
      importTarget.fields.forEach((f) => {
        if (row[f.key] !== undefined) payload[f.key] = normalizeValue(row[f.key], f.type);
      });
      try {
        await api.post(importTarget.endpoint, payload);
        success += 1;
      } catch {
        failed += 1;
      }
    }
    setImportStatus(`Imported ${success} rows, ${failed} failed.`);
    api.post("/api/v1/audit-logs/log/", {
      action: "import",
      model: importTarget.label,
      object_repr: `${success} ok / ${failed} failed`,
      changes: { success, failed },
    }).catch(() => {});
  };

  return (
    <div style={{ padding: 24 }}>
      {!selectedMaster ? (
        <>
          {/* Master Selection Grid */}
          <div className="page-header">
            <h1>System Masters</h1>
            <p>Click "View Data" to manage records or use import/export for bulk operations</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
            {MASTER_CONFIG.map((m) => (
              <div key={m.key} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 18 }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>{m.label}</div>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 12 }}>Manage {m.label.toLowerCase()} records.</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button className="btn primary" onClick={() => openMaster(m)} style={{ flex: 1 }}>View Data</button>
                  <button className="btn" onClick={() => handleExport(m)}>Export</button>
                  <button className="btn" onClick={() => handleTemplate(m)}>Template</button>
                  <button className="btn" onClick={() => openImport(m)}>Import</button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Master Data Management */}
          <div className="page-header">
            <button style={{ background: "none", border: "none", color: "#18b34a", cursor: "pointer", fontSize: 16 }} onClick={() => setSelectedMaster(null)}>← Back</button>
            <h1 style={{ marginLeft: 12 }}>{selectedMaster.label}</h1>
          </div>

          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
            {/* Toolbar */}
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #e5e7eb", display: "flex", gap: 8, alignItems: "center" }}>
              <button className="btn primary" onClick={openCreate}>+ New {selectedMaster.label}</button>
              <button className="btn" onClick={() => handleExport(selectedMaster)}>Export CSV</button>
              <span style={{ marginLeft: "auto", color: "#6b7280", fontSize: 12 }}>{records.length} records</span>
            </div>

            {/* Records Table */}
            <div style={{ overflowX: "auto" }}>
              {loadingRecords ? (
                <div style={{ padding: 20, textAlign: "center", color: "#9ca3af" }}>Loading records...</div>
              ) : records.length === 0 ? (
                <div style={{ padding: 20, textAlign: "center", color: "#9ca3af" }}>No records found. Click "+ New" to create one.</div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      {selectedMaster.fields.map((f) => (
                        <th key={f.key}>{f.label}</th>
                      ))}
                      <th style={{ width: 100 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr key={record.id}>
                        {selectedMaster.fields.map((f) => (
                          <td key={f.key}>
                            {f.type === "bool" ? (record[f.key] ? "✓" : "✗") : String(record[f.key] || "—").substring(0, 50)}
                          </td>
                        ))}
                        <td style={{ whiteSpace: "nowrap" }}>
                          <button className="btn" style={{ fontSize: 11, padding: "4px 8px" }} onClick={() => openEdit(record)}>Edit</button>
                          <button className="btn" style={{ fontSize: 11, padding: "4px 8px", marginLeft: 4, color: "#ef4444" }} onClick={() => setDeleteId(record.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}

      {/* Audit Log */}
      <div style={{ marginTop: 28, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10 }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #e5e7eb", fontWeight: 700 }}>Recent Audit Log</div>
        <div style={{ padding: "12px 16px" }}>
          {loadingAudit ? (
            <div style={{ color: "#9ca3af" }}>Loading audit logs…</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Actor</th>
                  <th>Action</th>
                  <th>Model</th>
                  <th>Object</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.slice(0, 25).map((l) => (
                  <tr key={l.id}>
                    <td>{new Date(l.created_at).toLocaleString()}</td>
                    <td>{l.actor_email || "—"}</td>
                    <td>{l.action}</td>
                    <td>{l.model}</td>
                    <td>{l.object_repr || l.object_id}</td>
                  </tr>
                ))}
                {auditLogs.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: "center", color: "#9ca3af" }}>No audit logs yet</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create/Edit Form Modal */}
      {showForm && selectedMaster && (
        <Modal title={isEditing ? `Edit ${selectedMaster.label}` : `Create ${selectedMaster.label}`} onClose={() => setShowForm(false)}>
          <div className="form-grid">
            {selectedMaster.fields
              .filter((f) => f.key !== "id") // Don't edit ID
              .map((field) => (
                <div key={field.key} className="field">
                  <label>{field.label}</label>
                  {field.type === "bool" ? (
                    <select
                      value={formData[field.key] ? "true" : "false"}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value === "true" })}
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  ) : field.type === "select" && Array.isArray(field.options) ? (
                    <select
                      value={formData[field.key] ?? ""}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                    >
                      <option value="">Select...</option>
                      {field.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "number" ? (
                    <input
                      type="number"
                      value={formData[field.key] ?? ""}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      placeholder={field.label}
                    />
                  ) : (
                    <input
                      type="text"
                      value={formData[field.key] ?? ""}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      placeholder={field.label}
                    />
                  )}
                </div>
              ))}
          </div>
          <div className="form-actions">
            <button className="btn" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn primary" onClick={handleSave}>Save</button>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && selectedMaster && (
        <Modal title="Delete Record" onClose={() => setDeleteId(null)}>
          <p>Are you sure you want to delete this record? This action cannot be undone.</p>
          <div className="form-actions">
            <button className="btn" onClick={() => setDeleteId(null)}>Cancel</button>
            <button className="btn" style={{ background: "#ef4444" }} onClick={handleDelete}>Delete</button>
          </div>
        </Modal>
      )}

      {/* Import Modal */}
      {importTarget && (
        <Modal title={`Import ${importTarget.label}`} size="md" onClose={() => setImportTarget(null)}>
          <div className="form-grid">
            <div className="field">
              <label>CSV File</label>
              <input type="file" accept=".csv" onChange={(e) => setImportFile(e.target.files?.[0] || null)} />
            </div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>
              Required columns: {importTarget.fields.map((f) => f.key).join(", ")}
            </div>
            {importStatus && <div className="alert success">{importStatus}</div>}
          </div>
          <div className="form-actions">
            <button className="btn" onClick={() => setImportTarget(null)}>Close</button>
            <button className="btn primary" onClick={handleImport} disabled={!importFile}>Import</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
