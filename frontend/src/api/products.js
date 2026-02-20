import api from "./axios.js";

// ── Products ──────────────────────────────────────────────────────────────────
export const getProducts = (params) => api.get("/api/v1/products/", { params });
export const generateSKU = () => api.get("/api/v1/products/generate_sku/");
export const createProduct = (data) => api.post("/api/v1/products/", data);
export const updateProduct = (id, data) => api.patch(`/api/v1/products/${id}/`, data);
export const deleteProduct = (id) => api.delete(`/api/v1/products/${id}/`);

// ── Support entities (for dropdowns) ─────────────────────────────────────────
export const getCategories = (params = {}) => api.get("/api/v1/categories/", { params });
export const getActiveCategories = () => api.get("/api/v1/categories/active/");
export const getMainCategories = (params = {}) => api.get("/api/v1/main-categories/", { params });
export const getActiveMainCategories = () => api.get("/api/v1/main-categories/active/");
export const getSubcategories = (params = {}) => api.get("/api/v1/subcategories/", { params });
export const getActiveSubcategories = (parentId = null) => {
  const params = parentId ? { parent: parentId } : {};
  return api.get("/api/v1/subcategories/active/", { params });
};
export const getSuppliers = (params = {}) => api.get("/api/v1/suppliers/", { params });
export const getWarehouses = (params = {}) => api.get("/api/v1/warehouses/", { params });
export const createWarehouse = (data) => api.post("/api/v1/warehouses/", data);
export const updateWarehouse = (id, data) => api.patch(`/api/v1/warehouses/${id}/`, data);
export const deleteWarehouse = (id) => api.delete(`/api/v1/warehouses/${id}/`);
