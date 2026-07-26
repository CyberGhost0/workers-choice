import { api } from './api';

export const adminApi = {
  // Dashboard stats
  getDashboardStats: () => api.get('/admin/dashboard'),

  // User management
  getUsers: (params?: { page?: number; limit?: number; role?: string; status?: string; search?: string }) =>
    api.get('/admin/users', { params }),

  updateUserStatus: (userId: string, emailVerified: boolean) =>
    api.put(`/admin/users/${userId}/status`, { emailVerified }),

  updateUserRole: (userId: string, role: string) =>
    api.put(`/admin/users/${userId}/role`, { role }),

  // Platform stats
  getPlatformStats: () => api.get('/admin/stats'),

  // Platform settings
  updatePlatformSettings: (settings: { platformFee?: number; maintenanceMode?: boolean; secureMode?: boolean }) =>
    api.put('/admin/settings', settings),
};
