import api from "./api";

export const adminService = {
  createItem: async (payload) => (await api.post("/admin/inventory", payload)).data,
  getAllInventory: async (params = {}) => (await api.get("/admin/inventory", { params })).data,
  getLowStockItems: async () => (await api.get("/admin/dashboard/low-stock")).data,
  getItemById: async (id) => (await api.get(`/admin/inventory/${id}`)).data,
  updateItem: async (id, payload) => (await api.put(`/admin/inventory/${id}`, payload)).data,
  archiveItem: async (id) => (await api.patch(`/admin/inventory/${id}/archive`)).data,
  updateStatus: async (id, status) => (await api.patch(`/admin/inventory/${id}/status`, { status })).data,
  deleteItem: async (id) => (await api.delete(`/admin/inventory/${id}`)).data,
  getDashboardStats: async () => (await api.get("/admin/dashboard/stats")).data,
};
