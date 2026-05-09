import api from "./api";

// Uses the unified api instance from api.js which handles auth tokens, refresh, and interceptors

/**
 * Application Services
 */
export const applicationApi = {
  submitPublic: (data) => api.post("/applications/public", data),
  submitDepartment: (data) => api.post("/applications", data),
  getAll: (params) => api.get("/applications", { params }),
  getDetails: (id) => api.get(`/applications/${id}`),
  getTimeline: (id) => api.get(`/applications/${id}/timeline`),
  forward: (id, data) => api.post(`/applications/${id}/forward`, data),
  backward: (id, data) => api.post(`/applications/${id}/backward`, data),
  resolve: (id, data) => api.post(`/applications/${id}/resolve`, data), // handles optional file
  requestDocuments: (id, data) => api.post(`/applications/${id}/request-documents`, data),
  uploadDocument: (id, formData) => api.post(`/applications/${id}/upload-document`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  }),
  track: (number) => api.get(`/applications/track/${number}`),
  getTrackDocs: (number) => api.get(`/applications/track/${number}/docs`),
  share: (id, userIds) => api.post(`/applications/${id}/share`, { userIds }),
  addRemark: (id, remarks) => api.post(`/applications/${id}/remark`, { remarks }),
  verifyDocument: (appId, docId) => api.patch(`/applications/${appId}/documents/${docId}/verify`),
  rejectDocument: (appId, docId, data) => api.patch(`/applications/${appId}/documents/${docId}/reject`, data),
  adminAction: (id, data) => api.patch(`/applications/${id}/admin-action`, data),
  update: (id, data) => api.patch(`/applications/${id}`, data),
};

/**
 * Dashboard Services
 */
export const dashboardApi = {
  getAdminStats: (params) => api.get("/dashboard/admin", { params }),
  getDepartmentStats: (params) => api.get("/dashboard/department", { params }),
};

/**
 * Notification Services
 */
export const notificationApi = {
  getAll: () => api.get("/notifications"),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch("/notifications/mark-all-read"),
};

/**
 * Master Data Services
 */
export const masterApi = {
  getDisasterTypes: () => api.get("/master/disaster-types"),
  getDocumentTypes: (disasterTypeId) => api.get(`/master/document-types/${disasterTypeId}`),
  getDistricts: () => api.get("/master/districts"),
  getBlocks: (districtId) => api.get(`/master/blocks/${districtId}`),
  getPanchayats: (blockId) => api.get(`/master/panchayats/${blockId}`),
  getTehsils: (districtId) => api.get(`/master/tehsils/${districtId}`),
  getVillages: (panchayatId) => api.get(`/master/villages/${panchayatId}`),
  getLossMetrics: () => api.get("/master/loss-metrics"),
};

/**
 * Auth & User Services
 */
export const authApi = {
  getUsers: () => api.get("/auth/users"),
  getAllUsers: () => api.get("/auth/users/all"),
  createUser: (data) => api.post("/auth/register-user", data),
  updateUser: (id, data) => api.put(`/auth/users/${id}`, data),
  toggleUserActive: (id) => api.patch(`/auth/users/${id}/toggle-active`),
  getMe: () => api.get("/auth/me"),
  updateAuthorizedDisasters: (id, disasterTypeIds) => api.patch(`/auth/users/${id}/authorized-disasters`, { disasterTypeIds }),
};

/**
 * Disaster Event Services
 */
export const disasterEventApi = {
  getAll: (params) => api.get("/disaster-events", { params }),
  getDetails: (id) => api.get(`/disaster-events/${id}`),
  create: (data) => api.post("/disaster-events", data),
  updateStatus: (id, status) => api.patch(`/disaster-events/${id}/status`, { status }),
  batchAction: (id, data) => api.post(`/disaster-events/${id}/batch-action`, data),
};

export default api;
