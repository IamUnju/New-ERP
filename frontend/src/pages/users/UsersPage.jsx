import { useCallback, useEffect, useState } from "react";
import {
  createUser,
  deleteUser,
  getRoles,
  getUsers,
  updateUser,
} from "../../api/users.js";
import Badge from "../../components/common/Badge.jsx";
import DataTable from "../../components/common/DataTable.jsx";
import Modal from "../../components/common/Modal.jsx";

/* ─── Empty form ────────────────────────────────────────────────────────────── */
const EMPTY = {
  email: "",
  username: "",
  first_name: "",
  last_name: "",
  password: "",
  role_ids: [],
  is_active: true,
};

/* ─── Table columns ─────────────────────────────────────────────────────────── */
const COLUMNS = [
  { key: "username", label: "Username" },
  { key: "email", label: "Email" },
  { key: "first_name", label: "First Name" },
  { key: "last_name", label: "Last Name" },
  {
    key: "roles",
    label: "Roles",
    render: (r) =>
      r.roles?.length ? (
        <div className="badge-list">
          {r.roles.map((role) => (
            <Badge key={role} label={role} variant="info" />
          ))}
        </div>
      ) : (
        "—"
      ),
  },
  {
    key: "is_active",
    label: "Status",
    render: (r) => <Badge label={r.is_active ? "Active" : "Inactive"} variant={r.is_active ? "success" : "warning"} />,
  },
];

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [roles, setRoles] = useState([]);

  /* ── Fetch users ────────────────────────────────────────────────────────── */
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUsers({ search });
      setUsers(res.data.results ?? res.data);
    } catch {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  /* ── Load roles once ────────────────────────────────────────────────────── */
  useEffect(() => {
    getRoles().then((res) => setRoles(res.data.results ?? res.data));
  }, []);

  /* ── Open create modal ──────────────────────────────────────────────────── */
  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setError("");
    setShowModal(true);
  };

  /* ── Open edit modal ────────────────────────────────────────────────────── */
  const openEdit = (user) => {
    setEditing(user);
    /* Map role names → ids for the checkboxes */
    const selectedIds = roles
      .filter((r) => user.roles?.includes(r.name))
      .map((r) => r.id);
    setForm({
      email: user.email,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      password: "",        /* leave blank to keep existing password */
      role_ids: selectedIds,
      is_active: user.is_active,
    });
    setError("");
    setShowModal(true);
  };

  /* ── Handle generic field change ────────────────────────────────────────── */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  /* ── Handle role checkbox toggle ────────────────────────────────────────── */
  const toggleRole = (id) => {
    setForm((prev) => {
      const already = prev.role_ids.includes(id);
      return {
        ...prev,
        role_ids: already ? prev.role_ids.filter((x) => x !== id) : [...prev.role_ids, id],
      };
    });
  };

  /* ── Submit create / update ─────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;   /* don't send empty password on edit */
      if (editing) {
        await updateUser(editing.id, payload);
      } else {
        await createUser(payload);
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      const data = err.response?.data;
      setError(data ? JSON.stringify(data) : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Confirm + execute delete ───────────────────────────────────────────── */
  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteUser(confirmDelete.id);
      setConfirmDelete(null);
      fetchUsers();
    } catch {
      setError("Delete failed.");
    }
  };

  return (
    <section className="page">
      {/* ── Page header ── */}
      <div className="page-header">
        <h1>Users</h1>
        <button className="btn primary" onClick={openCreate}>
          + New User
        </button>
      </div>

      {/* ── Search ── */}
      <div className="page-toolbar">
        <input
          className="search-input"
          placeholder="Search by username or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <div className="alert error">{error}</div>}

      {/* ── Data table ── */}
      <DataTable
        columns={COLUMNS}
        rows={users}
        loading={loading}
        onEdit={openEdit}
        onDelete={(row) => setConfirmDelete(row)}
      />

      {/* ── Create / Edit Modal ── */}
      {showModal && (
        <Modal
          title={editing ? "Edit User" : "New User"}
          onClose={() => setShowModal(false)}
          size="md"
        >
          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="form-row">
              <label className="field">
                Email *
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </label>
              <label className="field">
                Username *
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  required
                />
              </label>
            </div>

            <div className="form-row">
              <label className="field">
                First Name
                <input name="first_name" value={form.first_name} onChange={handleChange} />
              </label>
              <label className="field">
                Last Name
                <input name="last_name" value={form.last_name} onChange={handleChange} />
              </label>
            </div>

            <label className="field">
              Password {editing ? "(leave blank to keep current)" : "*"}
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required={!editing}
              />
            </label>

            {/* Roles checkboxes */}
            {roles.length > 0 && (
              <div className="field">
                <span className="field-label">Roles</span>
                <div className="checkbox-group">
                  {roles.map((role) => (
                    <label key={role.id} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={form.role_ids.includes(role.id)}
                        onChange={() => toggleRole(role.id)}
                      />
                      {role.name}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <label className="field checkbox-field">
              <input
                name="is_active"
                type="checkbox"
                checked={form.is_active}
                onChange={handleChange}
              />
              Active
            </label>

            {error && <div className="alert error">{error}</div>}

            <div className="form-actions">
              <button type="button" className="btn" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn primary" disabled={saving}>
                {saving ? "Saving…" : editing ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Delete Confirm Modal ── */}
      {confirmDelete && (
        <Modal title="Confirm Delete" onClose={() => setConfirmDelete(null)} size="sm">
          <p>
            Delete user <strong>{confirmDelete.username}</strong> ({confirmDelete.email})? This cannot be undone.
          </p>
          <div className="form-actions">
            <button className="btn" onClick={() => setConfirmDelete(null)}>
              Cancel
            </button>
            <button className="btn danger" onClick={handleDelete}>
              Delete
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}
