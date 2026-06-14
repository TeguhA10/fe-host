import { getDB, saveDB } from '../data/db';

const buildPositionTree = (positions, parentId = null) => {
  return positions
    .filter(p => p.parentId === parentId)
    .map(p => ({
      ...p,
      children: buildPositionTree(positions, p.id)
    }));
};

export const positionService = {
  getAll: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const db = getDB();
    return db.positions || [];
  },

  getTree: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const db = getDB();
    return buildPositionTree(db.positions, null);
  },

  create: async (positionData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    const nextId = db.positions.length > 0 ? Math.max(...db.positions.map(p => p.id)) + 1 : 1;

    const newPosition = {
      id: nextId,
      name: positionData.name,
      code: positionData.code,
      parentId: positionData.parentId ? parseInt(positionData.parentId) : null
    };

    db.positions.push(newPosition);
    saveDB(db);
    return newPosition;
  },

  update: async (id, positionData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    const index = db.positions.findIndex(p => p.id === parseInt(id));

    if (index === -1) throw new Error('Jabatan tidak ditemukan');

    db.positions[index] = {
      ...db.positions[index],
      name: positionData.name,
      code: positionData.code,
      parentId: positionData.parentId ? parseInt(positionData.parentId) : null
    };

    saveDB(db);
    return db.positions[index];
  },

  delete: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    const posId = parseInt(id);

    // Check if it has subordinate positions
    const hasChildren = db.positions.some(p => p.parentId === posId);
    if (hasChildren) {
      throw new Error('Tidak dapat menghapus jabatan yang memiliki bawahan.');
    }

    // Check if any employees hold this position
    const hasEmployees = db.employees.some(emp => emp.positionId === posId);
    if (hasEmployees) {
      throw new Error('Tidak dapat menghapus jabatan yang masih diduduki karyawan.');
    }

    db.positions = db.positions.filter(p => p.id !== posId);
    saveDB(db);
    return true;
  }
};
