import { apiClient } from '../lib/apiClient';

const generateCode = (name) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 5);
};

const mapPosition = (p) => {
  if (!p) return null;
  return {
    id: p.id,
    name: p.name,
    code: p.code || generateCode(p.name),
    parentId: p.parent_position_id,
    level: p.level,
    division: p.division,
    branchId: p.branch_id
  };
};

const mapPositionTree = (nodes) => {
  return (nodes || []).map(node => ({
    ...mapPosition(node),
    children: mapPositionTree(node.children)
  }));
};

const deriveDivisionAndLevel = async (name, parentId) => {
  let division = 'Information Technology';
  const lower = name.toLowerCase();
  if (lower.includes('hr') || lower.includes('recruitment') || lower.includes('people') || lower.includes('sumber daya')) {
    division = 'Human Resources';
  } else if (lower.includes('purchasing') || lower.includes('logistics') || lower.includes('vendor') || lower.includes('pengadaan')) {
    division = 'Purchasing & Logistics';
  } else if (lower.includes('finance') || lower.includes('account') || lower.includes('tax') || lower.includes('keuangan')) {
    division = 'Finance & Accounting';
  } else if (lower.includes('executive') || lower.includes('chief') || lower.includes('director') || lower.includes('direktur')) {
    division = 'Executive Suite';
  }

  let level = 4; // default to Staff
  if (parentId) {
    try {
      const parent = await positionService.getById(parentId);
      if (parent && parent.level) {
        level = Math.min(4, parseInt(parent.level) + 1);
      }
    } catch (e) {
      // ignore
    }
  } else {
    if (lower.includes('director') || lower.includes('chief') || lower.includes('president') || lower.includes('ceo') || lower.includes('direktur')) {
      level = 1;
    } else if (lower.includes('manager') || lower.includes('manajer')) {
      level = 2;
    } else if (lower.includes('supervisor') || lower.includes('spv')) {
      level = 3;
    }
  }

  return { division, level };
};

export const positionService = {
  getAll: async () => {
    const res = await apiClient.get('/api/employee/positions');
    const rawPositions = Array.isArray(res) ? res : (res.data || []);
    return rawPositions.map(mapPosition);
  },

  getById: async (id) => {
    const res = await apiClient.get(`/api/employee/positions/${id}`);
    return mapPosition(res.data || res);
  },

  getTree: async () => {
    const res = await apiClient.get('/api/employee/positions?tree=1');
    const rawTree = Array.isArray(res) ? res : (res.data || []);
    return mapPositionTree(rawTree);
  },

  create: async (positionData) => {
    const parentId = positionData.parentId ? parseInt(positionData.parentId) : null;
    const { division, level } = await deriveDivisionAndLevel(positionData.name, parentId);

    const payload = {
      name: positionData.name,
      level,
      division,
      parent_position_id: parentId,
      branch_id: positionData.branchId ? parseInt(positionData.branchId) : 1
    };

    const res = await apiClient.post('/api/employee/positions', payload);
    return mapPosition(res.data || res);
  },

  update: async (id, positionData) => {
    const parentId = positionData.parentId ? parseInt(positionData.parentId) : null;
    const { division, level } = await deriveDivisionAndLevel(positionData.name, parentId);

    const payload = {
      name: positionData.name,
      level,
      division,
      parent_position_id: parentId,
      branch_id: positionData.branchId ? parseInt(positionData.branchId) : 1
    };

    const res = await apiClient.put(`/api/employee/positions/${id}`, payload);
    return mapPosition(res.data || res);
  },

  delete: async (id) => {
    await apiClient.delete(`/api/employee/positions/${id}`);
    return true;
  }
};
