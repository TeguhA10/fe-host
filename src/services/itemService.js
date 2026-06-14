import { getDB, saveDB } from '../data/db';

export const itemService = {
  getAll: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const db = getDB();
    
    // Resolve vendor names for display
    return (db.items || []).map(item => {
      const vendor = db.vendors.find(v => v.id === item.defaultVendorId);
      return {
        ...item,
        defaultVendorName: vendor ? vendor.name : 'Unknown Vendor'
      };
    });
  },

  getById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const db = getDB();
    const item = db.items.find(item => item.id === parseInt(id));
    if (!item) throw new Error('Item tidak ditemukan');
    
    const vendor = db.vendors.find(v => v.id === item.defaultVendorId);
    return {
      ...item,
      defaultVendorName: vendor ? vendor.name : 'Unknown Vendor'
    };
  },

  create: async (itemData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();

    // Check SKU uniqueness
    const skuExists = db.items.some(item => item.sku.toUpperCase() === itemData.sku.toUpperCase());
    if (skuExists) {
      throw new Error('SKU Item sudah terdaftar.');
    }

    const nextId = db.items.length > 0 ? Math.max(...db.items.map(item => item.id)) + 1 : 1;
    const newItem = {
      id: nextId,
      name: itemData.name,
      sku: itemData.sku.toUpperCase(),
      category: itemData.category,
      active: itemData.active !== undefined ? itemData.active : true,
      defaultVendorId: parseInt(itemData.defaultVendorId),
      lastPrice: parseFloat(itemData.lastPrice)
    };

    db.items.push(newItem);
    saveDB(db);
    return newItem;
  },

  update: async (id, itemData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    const index = db.items.findIndex(item => item.id === parseInt(id));

    if (index === -1) throw new Error('Item tidak ditemukan');

    // Check SKU uniqueness
    const skuExists = db.items.some(item => item.id !== parseInt(id) && item.sku.toUpperCase() === itemData.sku.toUpperCase());
    if (skuExists) {
      throw new Error('SKU Item sudah terdaftar.');
    }

    db.items[index] = {
      ...db.items[index],
      name: itemData.name,
      sku: itemData.sku.toUpperCase(),
      category: itemData.category,
      active: itemData.active !== undefined ? itemData.active : db.items[index].active,
      defaultVendorId: parseInt(itemData.defaultVendorId),
      lastPrice: parseFloat(itemData.lastPrice)
    };

    saveDB(db);
    return db.items[index];
  },

  delete: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    const itemId = parseInt(id);

    // Verify item is not in any POs
    const inPOs = db.purchaseOrders.some(po => 
      po.items && po.items.some(poi => poi.itemId === itemId)
    );
    if (inPOs) {
      throw new Error('Tidak dapat menghapus item yang sudah direferensikan dalam Purchase Order.');
    }

    db.items = db.items.filter(item => item.id !== itemId);
    saveDB(db);
    return true;
  }
};
