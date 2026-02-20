import api from "./axios.js";

// ── Products ──────────────────────────────────────────────────────────────────
export const getProducts = (params) => api.get("/api/v1/products/", { params });
export const createProduct = (data) => api.post("/api/v1/products/", data);
export const updateProduct = (id, data) => api.patch(`/api/v1/products/${id}/`, data);
export const deleteProduct = (id) => api.delete(`/api/v1/products/${id}/`);

// ── Support entities (for dropdowns) ─────────────────────────────────────────
export const getCategories = () => api.get("/api/v1/categories/");
export const getMainCategories = () => api.get("/api/v1/main-categories/");
export const getSubcategories = () => api.get("/api/v1/subcategories/");
export const getSuppliers = () => api.get("/api/v1/suppliers/");
export const getWarehouses = () => api.get("/api/v1/warehouses/");
export const createWarehouse = (data) => api.post("/api/v1/warehouses/", data);
export const updateWarehouse = (id, data) => api.patch(`/api/v1/warehouses/${id}/`, data);
export const deleteWarehouse = (id) => api.delete(`/api/v1/warehouses/${id}/`);
