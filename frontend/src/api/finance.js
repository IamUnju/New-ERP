import api from "./axios.js";

export const getAccounts = (params) => api.get("/api/v1/accounts/", { params });
export const createAccount = (data) => api.post("/api/v1/accounts/", data);
export const updateAccount = (id, data) => api.patch(`/api/v1/accounts/${id}/`, data);
export const deleteAccount = (id) => api.delete(`/api/v1/accounts/${id}/`);

export const getExpenses = (params) => api.get("/api/v1/expenses/", { params });
export const createExpense = (data) => api.post("/api/v1/expenses/", data);
export const updateExpense = (id, data) => api.patch(`/api/v1/expenses/${id}/`, data);
export const deleteExpense = (id) => api.delete(`/api/v1/expenses/${id}/`);

export const getIncome = (params) => api.get("/api/v1/income/", { params });
export const createIncome = (data) => api.post("/api/v1/income/", data);
export const updateIncome = (id, data) => api.patch(`/api/v1/income/${id}/`, data);
export const deleteIncome = (id) => api.delete(`/api/v1/income/${id}/`);

export const getFinanceSummary = (params) => api.get("/api/v1/finance/summary/", { params });
