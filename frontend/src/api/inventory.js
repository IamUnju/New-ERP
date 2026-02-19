import api from "./axios.js";

export const getStockLevels = (params) => api.get("/api/v1/stock-levels/", { params });
export const getStockMovements = (params) => api.get("/api/v1/stock-movements/", { params });
export const createStockMovement = (data) => api.post("/api/v1/stock-movements/", data);
