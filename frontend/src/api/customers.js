import api from "./axios.js";

export const getCustomers = (params) => api.get("/api/v1/customers/", { params });
export const createCustomer = (data) => api.post("/api/v1/customers/", data);
export const updateCustomer = (id, data) => api.patch(`/api/v1/customers/${id}/`, data);
export const deleteCustomer = (id) => api.delete(`/api/v1/customers/${id}/`);
export const getCustomerTransactions = (id) => api.get(`/api/v1/customers/${id}/transactions/`);
