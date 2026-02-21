import { Fragment, useCallback, useEffect, useState } from "react";
import {
  bulkAssignRolePermissions,
  createRole,
  deleteRole,
  grantAllPermissionsToAdmin,
  getRoles,
  getRolePermissions,
  getScreens,
  updateRole,
} from "../../api/users.js";
import Badge from "../../components/common/Badge.jsx";
import DataTable from "../../components/common/DataTable.jsx";
import Modal from "../../components/common/Modal.jsx";

const PERMISSION_ACTIONS = ["view", "create", "update", "delete"];
const FRONTEND_MODULES = [
  { name: "System", match: (path) => path.startsWith("/system") || path.startsWith("/users") || path.startsWith("/register") },
  { name: "Dashboard", match: (path) => path === "/" || path.startsWith("/home") },
  { name: "Products", match: (path) => path.startsWith("/products") },
  { name: "Retail", match: (path) => path.startsWith("/retail") },
  { name: "Sales", match: (path) => path.startsWith("/sales") },
  { name: "Stock", match: (path) => path.startsWith("/stock") },
  { name: "Customers", match: (path) => path.startsWith("/customers") },
  { name: "Purchases", match: (path) => path.startsWith("/purchases") },
  { name: "Finance", match: (path) => path.startsWith("/finance") },
  { name: "Employees", match: (path) => path.startsWith("/employees") },
  { name: "Reports", match: (path) => path.startsWith("/reports") },
];

const API_MODULES = [
  { name: "API: System", match: (path) => path.startsWith("users") || path.startsWith("roles") || path.startsWith("screens") || path.startsWith("role-permissions") },
  { name: "API: Products", match: (path) => path.startsWith("products") || path.startsWith("categories") },
  { name: "API: Purchases", match: (path) => path.startsWith("suppliers") },
  { name: "API: Stock", match: (path) => path.startsWith("warehouses") || path.startsWith("stock-movements") },
  { name: "API: Sales", match: (path) => path.startsWith("orders") },
  { name: "API: Reports", match: (path) => path.startsWith("reports") },
];

const MODULE_ORDER = [
  "System",
  "Dashboard",
  "Products",
  "Retail",
  "Sales",
  "Stock",
  "Customers",
  "Purchases",
  "Finance",
  "Employees",
  "Reports",
  "API: System",
  "API: Products",
  "API: Purchases",
  "API: Stock",
  "API: Sales",
  "API: Reports",
  "Other",
  "API: Other",
];

const getModuleLabel = (path) => {
  if (path.startsWith("/api/")) {
    const apiPath = path.replace("/api/", "").replace(/^\/+/, "");
    const match = API_MODULES.find((item) => item.match(apiPath));
    return match ? match.name : "API: Other";
  }
  const match = FRONTEND_MODULES.find((item) => item.match(path));
  return match ? match.name : "Other";
};

const getModuleOrder = (moduleName) => {
  const index = MODULE_ORDER.indexOf(moduleName);
  return index === -1 ? MODULE_ORDER.length : index;
};

const EMPTY_ROLE = {
  name: "",
  description: "",
  remarks: "",
  is_active: true,
};

export default function RolesPermissionsPage() {
  const [roles, setRoles] = useState([]);
  const [screens, setScreens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleForm, setRoleForm] = useState(EMPTY_ROLE);
  const [roleError, setRoleError] = useState("");
  const [roleSaving, setRoleSaving] = useState(false);
  const [confirmRoleDelete, setConfirmRoleDelete] = useState(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [rolePermissions, setRolePermissions] = useState({});
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [permissionError, setPermissionError] = useState("");
  const [permissionSuccess, setPermissionSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [grantingAdminAll, setGrantingAdminAll] = useState(false);

  /* ── Fetch roles ──────────────────────────────────────────────────────────── */
  const fetchRoles = useCallback(async () => {
    setRoleLoading(true);
    try {
      const rolesRes = await getRoles();
      setRoles(rolesRes.data.results ?? rolesRes.data);
    } catch (err) {
      console.error("Failed to load roles:", err);
    } finally {
      setRoleLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await fetchRoles();
        const screensRes = await getScreens();
        setScreens(screensRes.data.results ?? screensRes.data);
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [fetchRoles]);

  /* ── Load permissions for selected role ────────────────────────────────── */
  const loadRolePermissions = useCallback(async (roleId) => {
    setPermissionsLoading(true);
    setPermissionError("");
    setPermissionSuccess("");
    try {
      console.log(`📥 Loading ALL permissions for Role ID: ${roleId}`);
      
      // Fetch all pages by calling the API iteratively
      let allItems = [];
      let page = 1;
      let hasMore = true;
      
      while (hasMore) {
        console.log(`  📄 Fetching page ${page}...`);
        const res = await getRolePermissions({ page });
        
        const data = res.data;
        const items = data.results ? data.results : (Array.isArray(data) ? data : []);
        console.log(`    Got ${items.length} items from page ${page}`);
        
        allItems = [...allItems, ...items];
        
        // Check if there are more pages
        hasMore = !!data.next;
        page++;
      }
      
      console.log(`✅ Fetched ${allItems.length} total permissions across all pages`);
      
      const map = {};
      
      // Initialize all screens with empty permissions
      screens.forEach((screen) => {
        map[screen.id] = [];
      });
      
      // Load existing permissions for this role
      const rolePermList = allItems.filter(item => {
        const itemRoleId = item.role || item.role_id;
        return itemRoleId && String(itemRoleId) === String(roleId);
      });
      
      console.log(`🎯 Found ${rolePermList.length} permissions for Role ID ${roleId}`);
      
      rolePermList.forEach((item) => {
        const screenId = item.screen?.id ?? item.screen_id;
        if (screenId && map.hasOwnProperty(screenId)) {
          map[screenId] = Array.isArray(item.actions) ? item.actions : [];
          console.log(`  ✓ Screen ${screenId}: ${JSON.stringify(map[screenId])}`);
        }
      });
      
      console.log(`✓ Final permission map:`, map);
      setRolePermissions(map);
    } catch (err) {
      setPermissionError("Failed to load role permissions.");
      console.error("❌ Error loading permissions:", err);
    } finally {
      setPermissionsLoading(false);
    }
  }, [screens]);

  /* ── Open permissions modal ────────────────────────────────────────────── */
  const openPermissionsModal = async (role) => {
    setSelectedRole(role);
    setShowPermissionsModal(true);
    setPermissionSuccess(""); // Clear previous success message
    setPermissionError(""); // Clear previous errors
    // loadRolePermissions will handle setPermissionsLoading
    await loadRolePermissions(role.id);
  };

  const openCreateRole = () => {
    setEditingRole(null);
    setRoleError("");
    setRoleForm(EMPTY_ROLE);
    setShowRoleModal(true);
  };

  const openEditRole = (role) => {
    setEditingRole(role);
    setRoleError("");
    setRoleForm({
      name: role.name || "",
      description: role.description || "",
      remarks: role.remarks || "",
      is_active: role.is_active ?? true,
    });
    setShowRoleModal(true);
  };

  /* ── Save permissions ──────────────────────────────────────────────────── */
  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    setSaving(true);
    setPermissionError("");
    setPermissionSuccess("");
    try {
      const permissionsPayload = screens
        .map((screen) => ({
          screen_id: screen.id,
          actions: rolePermissions[screen.id] || [],
        }))
        .filter((item) => item.actions.length > 0);
      
      console.log(`📤 Saving permissions for Role ID ${selectedRole.id}:`, permissionsPayload);
      
      await bulkAssignRolePermissions({
        role_id: selectedRole.id,
        permissions: permissionsPayload,
      });
      
      console.log(`✓ Permissions saved successfully for Role ID ${selectedRole.id}`);
      
      // Clear UI to show save was applied
      setRolePermissions({});
      setPermissionSuccess("✓ Permissions saved successfully!");
      
      // Auto-close after 1.5 seconds
      setTimeout(() => {
        setShowPermissionsModal(false);
        setPermissionSuccess("");
      }, 1500);
    } catch (err) {
      const data = err.response?.data;
      setPermissionError(data ? JSON.stringify(data) : "Save failed.");
      console.error("❌ Error saving permissions:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleRoleFormChange = (event) => {
    const { name, value, type, checked } = event.target;
    setRoleForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRoleSubmit = async (event) => {
    event.preventDefault();
    setRoleSaving(true);
    setRoleError("");
    try {
      const payload = {
        name: roleForm.name,
        description: roleForm.description,
        remarks: roleForm.remarks,
        is_active: roleForm.is_active,
      };

      if (editingRole) {
        await updateRole(editingRole.id, payload);
      } else {
        await createRole(payload);
      }

      setShowRoleModal(false);
      await fetchRoles();
    } catch (err) {
      const data = err.response?.data;
      setRoleError(data ? JSON.stringify(data) : "Save failed.");
    } finally {
      setRoleSaving(false);
    }
  };

  const handleRoleDelete = async () => {
    if (!confirmRoleDelete) return;
    try {
      await deleteRole(confirmRoleDelete.id);
      setConfirmRoleDelete(null);
      await fetchRoles();
    } catch (err) {
      const data = err.response?.data;
      setRoleError(data ? JSON.stringify(data) : "Delete failed.");
    }
  };

  /* ── Grant all permissions to admin ────────────────────────────────────── */
  const handleGrantAllToAdmin = async () => {
    if (!window.confirm("Grant ALL permissions to Admin role? This will overwrite existing permissions.")) {
      return;
    }
    
    setGrantingAdminAll(true);
    try {
      const res = await grantAllPermissionsToAdmin();
      console.log("✓ Granted all permissions to Admin:", res.data);
      
      // Refresh roles
      await fetchRoles();
      
      // Show success message
      alert(`✅ ${res.data.message}`);
    } catch (err) {
      console.error("❌ Error granting permissions:", err);
      alert("Failed to grant permissions to Admin role");
    } finally {
      setGrantingAdminAll(false);
    }
  };

  /* ── Columns for roles table ──────────────────────────────────────────── */
  const COLUMNS = [
    { key: "id", label: "ROLE_ID" },
    { key: "name", label: "ROLE_NAME" },
    { key: "description", label: "ROLE_DESC" },
    { key: "remarks", label: "REMARKS", render: (r) => r.remarks || "—" },
    {
      key: "is_active",
      label: "STATUS",
      render: (r) => (
        <Badge label={r.is_active ? "Active" : "Inactive"} variant={r.is_active ? "success" : "warning"} />
      ),
    },
  ];

  return (
    <section className="page">
      {/* ── Page header ── */}
      <div className="page-header">
        <div>
          <h1>Roles & Permissions</h1>
          <p style={{ color: "#6b7280", marginTop: 4 }}>Manage your roles</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button 
            className="btn" 
            onClick={handleGrantAllToAdmin}
            disabled={grantingAdminAll}
            title="Grant all permissions to Admin role"
          >
            {grantingAdminAll ? "Granting..." : "👑 Grant All to Admin"}
          </button>
          <button className="btn primary" onClick={openCreateRole}>
            + New Role
          </button>
        </div>
      </div>

      {/* ── Roles table ── */}
      <DataTable
        columns={COLUMNS}
        rows={roles}
        loading={loading || roleLoading}
        renderActions={(row) => (
          <>
            <button className="btn-icon" onClick={() => openPermissionsModal(row)} title="Role permissions">
              🛡️
            </button>
            <button className="btn-icon edit" onClick={() => openEditRole(row)} title="Edit role">
              ✏️
            </button>
            <button className="btn-icon delete" onClick={() => setConfirmRoleDelete(row)} title="Delete role">
              🗑️
            </button>
          </>
        )}
      />

      {showRoleModal && (
        <Modal
          title={editingRole ? "Edit Role" : "New Role"}
          onClose={() => setShowRoleModal(false)}
          size="md"
        >
          <form className="form-grid" onSubmit={handleRoleSubmit}>
            <label className="field">
              Role Name
              <input
                name="name"
                value={roleForm.name}
                onChange={handleRoleFormChange}
                required
              />
            </label>
            <label className="field">
              Role Description
              <input
                name="description"
                value={roleForm.description}
                onChange={handleRoleFormChange}
              />
            </label>
            <label className="field">
              Remarks
              <input
                name="remarks"
                value={roleForm.remarks}
                onChange={handleRoleFormChange}
              />
            </label>
            <label className="field checkbox-field">
              <input
                name="is_active"
                type="checkbox"
                checked={roleForm.is_active}
                onChange={handleRoleFormChange}
              />
              Active
            </label>

            {roleError && <div className="alert error">{roleError}</div>}

            <div className="form-actions">
              <button type="button" className="btn" onClick={() => setShowRoleModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn primary" disabled={roleSaving}>
                {roleSaving ? "Saving..." : editingRole ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {confirmRoleDelete && (
        <Modal title="Confirm Delete" onClose={() => setConfirmRoleDelete(null)} size="sm">
          <p>
            Delete role <strong>{confirmRoleDelete.name}</strong>? This cannot be undone.
          </p>
          <div className="form-actions">
            <button className="btn" onClick={() => setConfirmRoleDelete(null)}>
              Cancel
            </button>
            <button className="btn danger" onClick={handleRoleDelete}>
              Delete
            </button>
          </div>
        </Modal>
      )}

      {/* ── Permissions Modal ── */}
      {showPermissionsModal && selectedRole && (
        <Modal
          title={`Role Permissions`}
          onClose={() => setShowPermissionsModal(false)}
          size="lg"
          customHeader={
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              padding: "16px 24px", 
              borderBottom: "1px solid #e5e7eb", 
              backgroundColor: "#f9fafb",
              minHeight: "60px"
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>Manage Permissions</h2>
                <p style={{ color: "#6b7280", fontSize: 13, margin: "4px 0 0 0" }}>
                  Role: <strong>{selectedRole.name}</strong> (ID: {selectedRole.id})
                </p>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center", flexShrink: 0 }}>
                {permissionSuccess && (
                  <span style={{ color: "#10b981", fontSize: 13, fontWeight: 600 }}>
                    ✓ {permissionSuccess}
                  </span>
                )}
                <button
                  className="btn primary"
                  onClick={handleSavePermissions}
                  disabled={saving || permissionsLoading}
                  style={{ minWidth: 140, fontWeight: 600, padding: "8px 16px" }}
                  title="Save all permission changes for this role"
                >
                  {saving ? "Saving..." : "💾 Save Changes"}
                </button>
                <button
                  className="btn"
                  onClick={() => setShowPermissionsModal(false)}
                  style={{ minWidth: 90 }}
                >
                  Close
                </button>
              </div>
            </div>
          }
        >
          <div style={{ padding: "24px" }}>
            {permissionError && (
              <div
                className="alert error"
                style={{ marginBottom: 16 }}
              >
                {permissionError}
              </div>
            )}

            {permissionSuccess && (
              <div
                className="alert success"
                style={{ marginBottom: 16 }}
              >
                {permissionSuccess}
              </div>
            )}

            {permissionsLoading ? (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                Loading permissions...
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #d1d5db", backgroundColor: "#f0f4f8" }}>
                      <th
                        style={{
                          padding: "14px 16px",
                          textAlign: "left",
                          fontWeight: 700,
                          fontSize: 13,
                          color: "#1f2937",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Module Name
                      </th>
                      <th
                        style={{
                          padding: "14px 16px",
                          textAlign: "center",
                          fontWeight: 700,
                          fontSize: 13,
                          color: "#1f2937",
                          letterSpacing: "0.5px",
                        }}
                      >
                        All
                      </th>
                      {PERMISSION_ACTIONS.map((action) => (
                        <th
                          key={action}
                          style={{
                            padding: "14px 16px",
                            textAlign: "center",
                            fontWeight: 700,
                            fontSize: 13,
                            color: "#1f2937",
                            textTransform: "capitalize",
                            letterSpacing: "0.5px",
                          }}
                        >
                          {action === "view" ? "Read" : action.charAt(0).toUpperCase() + action.slice(1)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(
                      screens.reduce((acc, screen) => {
                        const moduleName = getModuleLabel(screen.path || "");
                        if (!acc[moduleName]) acc[moduleName] = [];
                        acc[moduleName].push(screen);
                        return acc;
                      }, {})
                    )
                      .sort(([a], [b]) => {
                        const orderDiff = getModuleOrder(a) - getModuleOrder(b);
                        return orderDiff !== 0 ? orderDiff : a.localeCompare(b);
                      })
                      .map(([moduleName, moduleScreens]) => {
                        const isModuleActionChecked = (action) =>
                          moduleScreens.length > 0 && moduleScreens.every((screen) => (rolePermissions[screen.id] || []).includes(action));

                        const isModuleAllChecked = () =>
                          moduleScreens.length > 0 && moduleScreens.every((screen) =>
                            PERMISSION_ACTIONS.every((action) => (rolePermissions[screen.id] || []).includes(action))
                          );

                        const toggleModuleAction = (action, checked) => {
                          setRolePermissions((prev) => {
                            const next = { ...prev };
                            moduleScreens.forEach((screen) => {
                              const current = next[screen.id] || [];
                              if (checked) {
                                next[screen.id] = current.includes(action)
                                  ? current
                                  : [...current, action];
                              } else {
                                next[screen.id] = current.filter((a) => a !== action);
                              }
                            });
                            return next;
                          });
                        };

                        const toggleModuleAll = (checked) => {
                          setRolePermissions((prev) => {
                            const next = { ...prev };
                            moduleScreens.forEach((screen) => {
                              next[screen.id] = checked ? [...PERMISSION_ACTIONS] : [];
                            });
                            return next;
                          });
                        };

                        return (
                          <Fragment key={moduleName}>
                            <tr
                              style={{
                                backgroundColor: "#f0f4f8",
                                borderBottom: "1px solid #e5e7eb",
                              }}
                            >
                              <td
                                style={{
                                  padding: "14px 16px",
                                  fontWeight: 700,
                                  fontSize: 14,
                                  color: "#1f2937",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.5px",
                                }}
                              >
                                {moduleName}
                              </td>
                              <td style={{ padding: "14px 16px", textAlign: "center" }}>
                                <input
                                  type="checkbox"
                                  checked={isModuleAllChecked()}
                                  onChange={(event) => toggleModuleAll(event.target.checked)}
                                  style={{ cursor: "pointer", width: 18, height: 18, accentColor: "#8b5cf6" }}
                                />
                              </td>
                              {PERMISSION_ACTIONS.map((action) => (
                                <td key={action} style={{ padding: "14px 16px", textAlign: "center" }}>
                                  <input
                                    type="checkbox"
                                    checked={isModuleActionChecked(action)}
                                    onChange={(event) => toggleModuleAction(action, event.target.checked)}
                                    style={{ cursor: "pointer", width: 18, height: 18, accentColor: "#8b5cf6" }}
                                  />
                                </td>
                              ))}
                            </tr>
                            {moduleScreens.map((screen, index) => {
                              const actions = rolePermissions[screen.id] || [];
                              const isScreenAllChecked = PERMISSION_ACTIONS.every((action) => actions.includes(action));
                              const toggleScreenAll = (checked) => {
                                setRolePermissions((prev) => ({
                                  ...prev,
                                  [screen.id]: checked ? [...PERMISSION_ACTIONS] : [],
                                }));
                              };
                              const toggleScreenAction = (action) => {
                                setRolePermissions((prev) => {
                                  const current = prev[screen.id] || [];
                                  const next = current.includes(action)
                                    ? current.filter((a) => a !== action)
                                    : [...current, action];
                                  return { ...prev, [screen.id]: next };
                                });
                              };

                              return (
                                <tr
                                  key={screen.id}
                                  style={{
                                    borderBottom: "1px solid #e5e7eb",
                                    backgroundColor: index % 2 === 0 ? "#ffffff" : "#f9fafb",
                                  }}
                                >
                                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151" }}>
                                    <div style={{ fontWeight: 600, color: "#1f2937" }}>{screen.path}</div>
                                    {screen.description && (
                                      <div
                                        style={{
                                          fontSize: 11,
                                          color: "#9ca3af",
                                          marginTop: 3,
                                        }}
                                      >
                                        {screen.description}
                                      </div>
                                    )}
                                  </td>
                                  <td style={{ padding: "12px 16px", textAlign: "center" }}>
                                    <input
                                      type="checkbox"
                                      checked={isScreenAllChecked}
                                      onChange={(event) => toggleScreenAll(event.target.checked)}
                                      style={{ cursor: "pointer", width: 18, height: 18, accentColor: "#8b5cf6" }}
                                    />
                                  </td>
                                  {PERMISSION_ACTIONS.map((action) => (
                                    <td key={action} style={{ padding: "12px 16px", textAlign: "center" }}>
                                      <input
                                        type="checkbox"
                                        checked={actions.includes(action)}
                                        onChange={() => toggleScreenAction(action)}
                                        style={{ cursor: "pointer", width: 18, height: 18, accentColor: "#8b5cf6" }}
                                      />
                                    </td>
                                  ))}
                                </tr>
                              );
                            })}
                          </Fragment>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Modal>
      )}
    </section>
  );
}
