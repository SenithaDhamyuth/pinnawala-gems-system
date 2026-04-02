import api from "./api";

export const inventoryService = {
  createItem: async (payload) => (await api.post("/inventory", payload)).data,
  getMyItems: async (params = {}) => (await api.get("/inventory/my-items", { params })).data,
  getLowStockItems: async () => (await api.get("/inventory/low-stock")).data,
  getItemById: async (id) => (await api.get(`/inventory/${id}`)).data,
  updateItem: async (id, payload) => (await api.put(`/inventory/${id}`, payload)).data,
  archiveItem: async (id) => (await api.patch(`/inventory/${id}/archive`)).data,
  updateStatus: async (id, status) => (await api.patch(`/inventory/${id}/status`, { status })).data,
  deleteItem: async (id) => (await api.delete(`/inventory/${id}`)).data,
};
