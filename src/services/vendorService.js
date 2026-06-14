import { getDB, saveDB } from '../data/db';

export const vendorService = {
  getAll: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const db = getDB();
    return db.vendors || [];
  },

  getById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const db = getDB();
    const vendor = db.vendors.find(v => v.id === parseInt(id));
    if (!vendor) throw new Error('Vendor tidak ditemukan');

    // Attach purchase order history
    const poHistory = (db.purchaseOrders || []).filter(po => po.vendorId === vendor.id);
    return {
      ...vendor,
      poHistory
    };
  },

  create: async (vendorData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();

    // Check code uniqueness
    const codeExists = db.vendors.some(v => v.code.toUpperCase() === vendorData.code.toUpperCase());
    if (codeExists) {
      throw new Error('Kode Vendor sudah digunakan.');
    }

    const nextId = db.vendors.length > 0 ? Math.max(...db.vendors.map(v => v.id)) + 1 : 1;
    const newVendor = {
      id: nextId,
      name: vendorData.name,
      code: vendorData.code.toUpperCase(),
      contact: vendorData.contact,
      email: vendorData.email,
      address: vendorData.address,
      active: vendorData.active !== undefined ? vendorData.active : true
    };

    db.vendors.push(newVendor);
    saveDB(db);
    return newVendor;
  },

  update: async (id, vendorData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    const index = db.vendors.findIndex(v => v.id === parseInt(id));

    if (index === -1) throw new Error('Vendor tidak ditemukan');

    // Check code uniqueness if changing code
    const codeExists = db.vendors.some(v => v.id !== parseInt(id) && v.code.toUpperCase() === vendorData.code.toUpperCase());
    if (codeExists) {
      throw new Error('Kode Vendor sudah digunakan.');
    }

    db.vendors[index] = {
      ...db.vendors[index],
      name: vendorData.name,
      code: vendorData.code.toUpperCase(),
      contact: vendorData.contact,
      email: vendorData.email,
      address: vendorData.address,
      active: vendorData.active !== undefined ? vendorData.active : db.vendors[index].active
    };

    saveDB(db);
    return db.vendors[index];
  },

  delete: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    const vendorId = parseInt(id);

    // Check if vendor has purchase orders
    const hasPOs = db.purchaseOrders.some(po => po.vendorId === vendorId);
    if (hasPOs) {
      throw new Error('Tidak dapat menghapus vendor yang memiliki riwayat Purchase Order.');
    }

    db.vendors = db.vendors.filter(v => v.id !== vendorId);
    saveDB(db);
    return true;
  }
};
