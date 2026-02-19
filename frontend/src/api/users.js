import api from "./axios.js";

// ── Users ─────────────────────────────────────────────────────────────────────
export const getUsers = (params) => api.get("/api/v1/users/", { params });
export const getUser = (id) => api.get(`/api/v1/users/${id}/`);
export const createUser = (data) => api.post("/api/v1/users/", data);
export const updateUser = (id, data) => api.patch(`/api/v1/users/${id}/`, data);
export const deleteUser = (id) => api.delete(`/api/v1/users/${id}/`);

// ── Roles (for dropdown) ──────────────────────────────────────────────────────
export const getRoles = () => api.get("/api/v1/roles/");
