import { getDB, saveDB } from '../data/db';

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
    await new Promise(resolve => setTimeout(resolve, 200));
    const db = getDB();
    return db.branches || [];
  },

  getTree: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const db = getDB();
    return buildBranchTree(db.branches, null);
  },

  create: async (branchData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    const nextId = db.branches.length > 0 ? Math.max(...db.branches.map(b => b.id)) + 1 : 1;

    const newBranch = {
      id: nextId,
      name: branchData.name,
      code: branchData.code,
      parentId: branchData.parentId ? parseInt(branchData.parentId) : null
    };

    db.branches.push(newBranch);
    saveDB(db);
    return newBranch;
  },

  update: async (id, branchData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    const index = db.branches.findIndex(b => b.id === parseInt(id));

    if (index === -1) throw new Error('Cabang tidak ditemukan');

    db.branches[index] = {
      ...db.branches[index],
      name: branchData.name,
      code: branchData.code,
      parentId: branchData.parentId ? parseInt(branchData.parentId) : null
    };

    saveDB(db);
    return db.branches[index];
  },

  delete: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    const branchId = parseInt(id);

    // Check if it has child nodes
    const hasChildren = db.branches.some(b => b.parentId === branchId);
    if (hasChildren) {
      throw new Error('Tidak dapat menghapus cabang yang memiliki sub-cabang.');
    }

    // Check if any employees belong to this branch
    const hasEmployees = db.employees.some(emp => emp.branchId === branchId);
    if (hasEmployees) {
      throw new Error('Tidak dapat menghapus cabang yang masih memiliki karyawan.');
    }

    db.branches = db.branches.filter(b => b.id !== branchId);
    saveDB(db);
    return true;
  }
};
