import { getDB, saveDB } from '../data/db';

export const employeeService = {
  getAll: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    return db.employees || [];
  },

  getById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const db = getDB();
    const employee = db.employees.find(emp => emp.id === parseInt(id));
    if (!employee) throw new Error('Karyawan tidak ditemukan');
    return employee;
  },

  create: async (employeeData) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const db = getDB();
    const nextId = db.employees.length > 0 ? Math.max(...db.employees.map(e => e.id)) + 1 : 1;
    
    const newEmployee = {
      id: nextId,
      ...employeeData,
      branchId: parseInt(employeeData.branchId),
      divisionId: parseInt(employeeData.divisionId),
      positionId: parseInt(employeeData.positionId),
      supervisorId: employeeData.supervisorId ? parseInt(employeeData.supervisorId) : null,
      photo: employeeData.photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&h=256&q=80"
    };

    db.employees.push(newEmployee);
    saveDB(db);
    return newEmployee;
  },

  update: async (id, employeeData) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const db = getDB();
    const index = db.employees.findIndex(emp => emp.id === parseInt(id));
    
    if (index === -1) throw new Error('Karyawan tidak ditemukan');

    db.employees[index] = {
      ...db.employees[index],
      ...employeeData,
      branchId: parseInt(employeeData.branchId),
      divisionId: parseInt(employeeData.divisionId),
      positionId: parseInt(employeeData.positionId),
      supervisorId: employeeData.supervisorId ? parseInt(employeeData.supervisorId) : null
    };

    saveDB(db);
    return db.employees[index];
  },

  delete: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    db.employees = db.employees.filter(emp => emp.id !== parseInt(id));
    saveDB(db);
    return true;
  }
};
