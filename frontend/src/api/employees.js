import api from "./axios.js";

export const getDepartments = () => api.get("/api/v1/departments/");
export const createDepartment = (data) => api.post("/api/v1/departments/", data);
export const updateDepartment = (id, data) => api.patch(`/api/v1/departments/${id}/`, data);
export const deleteDepartment = (id) => api.delete(`/api/v1/departments/${id}/`);

export const getEmployees = (params) => api.get("/api/v1/employees/", { params });
export const createEmployee = (data) => api.post("/api/v1/employees/", data);
export const updateEmployee = (id, data) => api.patch(`/api/v1/employees/${id}/`, data);
export const deleteEmployee = (id) => api.delete(`/api/v1/employees/${id}/`);

export const getSalaryPayments = (params) => api.get("/api/v1/salary-payments/", { params });
export const createSalaryPayment = (data) => api.post("/api/v1/salary-payments/", data);
