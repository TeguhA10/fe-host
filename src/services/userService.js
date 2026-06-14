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

export const userService = {
  getAll: async () => {
    const res = await apiClient.get('/api/auth/users');
    return (res.data || []).map(mapUser);
  },

  create: async (userData) => {
    const payload = {
      name: userData.name,
      email: userData.email,
      password: userData.password || 'password123',
      role: userData.roleId,
      branch_id: userData.branchId ? parseInt(userData.branchId) : null,
      is_active: true
    };
    const res = await apiClient.post('/api/auth/users', payload);
    return mapUser(res.data);
  },

  update: async (id, userData) => {
    const payload = {
      name: userData.name,
      email: userData.email,
      role: userData.roleId,
      branch_id: userData.branchId ? parseInt(userData.branchId) : null,
      ...(userData.password ? { password: userData.password } : {})
    };
    const res = await apiClient.put(`/api/auth/users/${id}`, payload);
    return mapUser(res.data);
  },

  toggleActive: async (id, currentUserId) => {
    const currentUsers = await userService.getAll();
    const user = currentUsers.find(u => u.id === parseInt(id));
    if (!user) throw new Error('User tidak ditemukan');
    
    if (currentUserId && parseInt(currentUserId) === parseInt(id)) {
      throw new Error('Anda tidak dapat menonaktifkan akun Anda sendiri.');
    }

    const res = await apiClient.put(`/api/auth/users/${id}`, {
      is_active: !user.active
    });
    return mapUser(res.data);
  }
};
