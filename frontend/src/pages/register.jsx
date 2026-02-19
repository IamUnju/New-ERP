import React, { useEffect, useState } from "react";
import { getRoles, createUser } from "../api/users";
import { useNavigate } from "react-router-dom";

const RegisterForm = () => {
  const [form, setForm] = useState({ username: "", email: "", password: "", is_active: true });
  const [roles, setRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getRoles()
      .then((res) => setRoles(res.data?.results ?? res.data ?? []))
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const toggleRole = (id) => {
    setSelectedRoles((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await createUser({ ...form, role_ids: selectedRoles });
      setSuccess("User created successfully!");
      setForm({ username: "", email: "", password: "", is_active: true });
      setSelectedRoles([]);
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === "object") {
        setError(Object.values(data).flat().join(" "));
      } else {
        setError("Failed to create user.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 560 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#111827" }}>Register New User</h2>
        <button
          onClick={() => navigate("/users")}
          style={{ marginLeft: "auto", padding: "6px 14px", background: "white", border: "1px solid #d1d5db", borderRadius: 6, cursor: "pointer", fontSize: 13 }}
        >
          ← Back to Users
        </button>
      </div>

      {error && <div className="alert alert-danger" style={{ marginBottom: 16 }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: 16 }}>{success}</div>}

      <form onSubmit={handleSubmit} style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 10, padding: 24 }}>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Username *</label>
            <input
              className="form-control"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Enter username"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input
              className="form-control"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter email"
              required
            />
          </div>
          <div className="form-group" style={{ gridColumn: "1 / -1" }}>
            <label className="form-label">Password *</label>
            <input
              className="form-control"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
            />
          </div>
          <div className="form-group" style={{ gridColumn: "1 / -1" }}>
            <label className="form-label">Roles</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {roles.map((role) => (
                <label key={role.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", border: "1px solid #d1d5db", borderRadius: 6, cursor: "pointer", fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role.id)}
                    onChange={() => toggleRole(role.id)}
                  />
                  {role.name}
                </label>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer" }}>
              <input
                type="checkbox"
                name="is_active"
                checked={form.is_active}
                onChange={handleChange}
              />
              Active User
            </label>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 20 }}>
          <button
            type="button"
            onClick={() => navigate("/users")}
            style={{ padding: "8px 20px", background: "white", border: "1px solid #d1d5db", borderRadius: 6, cursor: "pointer", fontSize: 14 }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ padding: "8px 20px" }}
          >
            {loading ? "Creating…" : "Create User"}
          </button>
        </div>
      </form>
    </div>
  );
};
export default RegisterForm;
