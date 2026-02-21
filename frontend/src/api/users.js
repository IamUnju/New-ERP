import api from "./axios.js";

// ── Users ─────────────────────────────────────────────────────────────────────
export const getUsers = (params) => api.get("/api/v1/users/", { params });
export const getUser = (id) => api.get(`/api/v1/users/${id}/`);
export const createUser = (data) => api.post("/api/v1/users/", data);
export const updateUser = (id, data) => api.patch(`/api/v1/users/${id}/`, data);
export const deleteUser = (id) => api.delete(`/api/v1/users/${id}/`);

// ── Roles (for dropdown) ──────────────────────────────────────────────────────
export const getRoles = () => api.get("/api/v1/roles/");
export const createRole = (data) => api.post("/api/v1/roles/", data);
export const updateRole = (id, data) => api.patch(`/api/v1/roles/${id}/`, data);
export const deleteRole = (id) => api.delete(`/api/v1/roles/${id}/`);

// ── Screens + Role Permissions ───────────────────────────────────────────────
export const getScreens = () => api.get("/api/v1/screens/");
export const getRolePermissions = (params) => api.get("/api/v1/role-permissions/", { params });
export const bulkAssignRolePermissions = (data) =>
	api.post("/api/v1/role-permissions/bulk_assign/", data);
export const grantAllPermissionsToAdmin = () =>
	api.post("/api/v1/role-permissions/grant_all_to_admin/", {});
