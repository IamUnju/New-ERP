import api from "./axios.js";

// Suppliers
export const getSuppliers = (params) => api.get("/api/v1/suppliers/", { params });
export const createSupplier = (data) => api.post("/api/v1/suppliers/", data);
export const updateSupplier = (id, data) => api.patch(`/api/v1/suppliers/${id}/`, data);
export const deleteSupplier = (id) => api.delete(`/api/v1/suppliers/${id}/`);

// Purchase Orders
export const getPurchaseOrders = (params) => api.get("/api/v1/purchase-orders/", { params });
export const createPurchaseOrder = (data) => api.post("/api/v1/purchase-orders/", data);
export const updatePurchaseOrder = (id, data) => api.patch(`/api/v1/purchase-orders/${id}/`, data);
export const deletePurchaseOrder = (id) => api.delete(`/api/v1/purchase-orders/${id}/`);
export const receivePurchaseOrder = (id) => api.post(`/api/v1/purchase-orders/${id}/receive/`);
