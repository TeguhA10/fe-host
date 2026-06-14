import { apiClient } from '../lib/apiClient';

const mapUser = (apiUser) => {
  if (!apiUser) return null;
  return {
    id: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    roleId: apiUser.role,
    branchId: apiUser.branch_id,
    active: apiUser.is_active
  };
};

export const authService = {
  login: async (email, password) => {
    await apiClient.post('/api/auth/login', { email, password });
    const profile = await authService.getProfile();
    return { user: profile, token: 'session-active' };
  },

  logout: async () => {
    try {
      await apiClient.post('/api/auth/logout');
    } catch (err) {
      console.error('Logout error on backend:', err);
    }
    return true;
  },

  refresh: async () => {
    return apiClient.post('/api/auth/refresh');
  },

  getProfile: async () => {
    const res = await apiClient.get('/api/auth/me');
    return mapUser(res.data);
  }
};
