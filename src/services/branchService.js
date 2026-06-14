import { apiClient } from '../lib/apiClient';

const mapBranch = (b) => {
  if (!b) return null;
  return {
    id: b.id,
    name: b.name,
    code: b.code,
    parentId: b.parent_id,
    address: b.address,
    isActive: b.is_active
  };
};

const buildBranchTree = (branches, parentId = null) => {
  return branches
    .filter(b => b.parentId === parentId)
    .map(b => ({
      ...b,
      children: buildBranchTree(branches, b.id)
    }));
};

export const branchService = {
  getAll: async () => {
    const res = await apiClient.get('/api/employee/branches');
    const rawBranches = Array.isArray(res) ? res : (res.data || []);
    return rawBranches.map(mapBranch);
  },

  getTree: async () => {
    const flat = await branchService.getAll();
    return buildBranchTree(flat, null);
  },

  create: async (branchData) => {
    const payload = {
      name: branchData.name,
      code: branchData.code,
      parent_id: branchData.parentId ? parseInt(branchData.parentId) : null,
      address: branchData.address || 'Kantor Utama',
      is_active: true
    };
    const res = await apiClient.post('/api/employee/branches', payload);
    return mapBranch(res.data || res);
  },

  update: async (id, branchData) => {
    const payload = {
      name: branchData.name,
      code: branchData.code,
      parent_id: branchData.parentId ? parseInt(branchData.parentId) : null,
      address: branchData.address || 'Kantor Utama',
      is_active: branchData.isActive !== undefined ? branchData.isActive : true
    };
    const res = await apiClient.put(`/api/employee/branches/${id}`, payload);
    return mapBranch(res.data || res);
  },

  delete: async (id) => {
    await apiClient.delete(`/api/employee/branches/${id}`);
    return true;
  }
};
