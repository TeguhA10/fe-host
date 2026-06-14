import { getDB, saveDB } from '../data/db';

const getUserName = (db, userId) => {
  const user = db.users.find(u => u.id === parseInt(userId));
  return user ? user.name : `User ID ${userId}`;
};

export const purchaseOrderService = {
  getAll: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const db = getDB();
    
    // Resolve vendor name and branch name
    return (db.purchaseOrders || []).map(po => {
      const vendor = db.vendors.find(v => v.id === po.vendorId);
      const branch = db.branches.find(b => b.id === po.branchId);
      const creator = db.users.find(u => u.id === po.creatorId);
      return {
        ...po,
        vendorName: vendor ? vendor.name : 'Unknown Vendor',
        branchName: branch ? branch.name : 'Unknown Branch',
        creatorName: creator ? creator.name : 'Unknown'
      };
    });
  },

  getById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const db = getDB();
    const po = db.purchaseOrders.find(po => po.id === parseInt(id));
    if (!po) throw new Error('Purchase Order tidak ditemukan');
    
    const vendor = db.vendors.find(v => v.id === po.vendorId);
    const branch = db.branches.find(b => b.id === po.branchId);
    const creator = db.users.find(u => u.id === po.creatorId);

    // Resolve detailed items (name, sku, category)
    const resolvedItems = (po.items || []).map(poi => {
      const itemDetails = db.items.find(item => item.id === poi.itemId);
      return {
        ...poi,
        itemName: itemDetails ? itemDetails.name : 'Unknown Item',
        itemSku: itemDetails ? itemDetails.sku : 'N/A',
        itemCategory: itemDetails ? itemDetails.category : 'N/A'
      };
    });

    return {
      ...po,
      vendorDetails: vendor || null,
      branchDetails: branch || null,
      creatorDetails: creator || null,
      items: resolvedItems
    };
  },

  create: async (poData, creatorId) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const db = getDB();
    
    // Calculate total amount from items
    let total = 0;
    const formattedItems = poData.items.map((item, idx) => {
      const itemDb = db.items.find(i => i.id === parseInt(item.itemId));
      const price = parseFloat(item.price) || (itemDb ? itemDb.lastPrice : 0);
      const qty = parseInt(item.qty) || 1;
      const subtotal = qty * price;
      total += subtotal;
      
      return {
        id: idx + 1,
        itemId: parseInt(item.itemId),
        qty,
        price,
        subtotal
      };
    });

    // Update item last prices
    formattedItems.forEach(fi => {
      const itemIdx = db.items.findIndex(item => item.id === fi.itemId);
      if (itemIdx !== -1) {
        db.items[itemIdx].lastPrice = fi.price;
      }
    });

    const nextId = db.purchaseOrders.length > 0 ? Math.max(...db.purchaseOrders.map(po => po.id)) + 1 : 1;
    const poNumber = `PO-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(nextId).padStart(4, '0')}`;
    
    const creatorName = getUserName(db, creatorId);

    const newPO = {
      id: nextId,
      poNumber,
      branchId: parseInt(poData.branchId),
      vendorId: parseInt(poData.vendorId),
      totalAmount: total,
      status: "Draft",
      creatorId: parseInt(creatorId),
      createdAt: new Date().toISOString().split('T')[0],
      items: formattedItems,
      timeline: [
        {
          status: "Draft",
          timestamp: new Date().toISOString(),
          note: `Draft PO dibuat oleh ${creatorName}`
        }
      ]
    };

    db.purchaseOrders.push(newPO);
    saveDB(db);
    return newPO;
  },

  update: async (id, poData, userId) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const db = getDB();
    const index = db.purchaseOrders.findIndex(po => po.id === parseInt(id));

    if (index === -1) throw new Error('Purchase Order tidak ditemukan');
    if (db.purchaseOrders[index].status !== 'Draft') {
      throw new Error('Hanya Purchase Order berstatus Draft yang dapat diperbarui.');
    }

    let total = 0;
    const formattedItems = poData.items.map((item, idx) => {
      const itemDb = db.items.find(i => i.id === parseInt(item.itemId));
      const price = parseFloat(item.price) || (itemDb ? itemDb.lastPrice : 0);
      const qty = parseInt(item.qty) || 1;
      const subtotal = qty * price;
      total += subtotal;

      return {
        id: idx + 1,
        itemId: parseInt(item.itemId),
        qty,
        price,
        subtotal
      };
    });

    // Update item last prices
    formattedItems.forEach(fi => {
      const itemIdx = db.items.findIndex(item => item.id === fi.itemId);
      if (itemIdx !== -1) {
        db.items[itemIdx].lastPrice = fi.price;
      }
    });

    const userName = getUserName(db, userId);

    db.purchaseOrders[index] = {
      ...db.purchaseOrders[index],
      branchId: parseInt(poData.branchId),
      vendorId: parseInt(poData.vendorId),
      totalAmount: total,
      items: formattedItems
    };

    db.purchaseOrders[index].timeline.push({
      status: "Draft",
      timestamp: new Date().toISOString(),
      note: `Purchase Order diperbarui oleh ${userName}`
    });

    saveDB(db);
    return db.purchaseOrders[index];
  },

  submit: async (id, userId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    const index = db.purchaseOrders.findIndex(po => po.id === parseInt(id));

    if (index === -1) throw new Error('Purchase Order tidak ditemukan');
    if (db.purchaseOrders[index].status !== 'Draft') {
      throw new Error('Hanya PO berstatus Draft yang dapat diajukan (Submit).');
    }

    const userName = getUserName(db, userId);

    db.purchaseOrders[index].status = 'Submitted';
    db.purchaseOrders[index].timeline.push({
      status: 'Submitted',
      timestamp: new Date().toISOString(),
      note: `PO diajukan oleh ${userName} untuk review`
    });

    saveDB(db);
    return db.purchaseOrders[index];
  },

  approve: async (id, userId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    const index = db.purchaseOrders.findIndex(po => po.id === parseInt(id));

    if (index === -1) throw new Error('Purchase Order tidak ditemukan');
    if (db.purchaseOrders[index].status !== 'Submitted') {
      throw new Error('Hanya PO berstatus Submitted yang dapat disetujui (Approve).');
    }

    const userName = getUserName(db, userId);

    db.purchaseOrders[index].status = 'Approved';
    db.purchaseOrders[index].timeline.push({
      status: 'Approved',
      timestamp: new Date().toISOString(),
      note: `PO disetujui oleh ${userName}`
    });

    saveDB(db);
    return db.purchaseOrders[index];
  },

  reject: async (id, userId, reason) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    const index = db.purchaseOrders.findIndex(po => po.id === parseInt(id));

    if (index === -1) throw new Error('Purchase Order tidak ditemukan');
    if (db.purchaseOrders[index].status !== 'Submitted') {
      throw new Error('Hanya PO berstatus Submitted yang dapat ditolak (Reject).');
    }

    const userName = getUserName(db, userId);

    db.purchaseOrders[index].status = 'Rejected';
    db.purchaseOrders[index].timeline.push({
      status: 'Rejected',
      timestamp: new Date().toISOString(),
      note: `PO ditolak oleh ${userName}. Alasan: ${reason || 'Tidak ada alasan spesifik'}`
    });

    saveDB(db);
    return db.purchaseOrders[index];
  },

  receive: async (id, userId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    const index = db.purchaseOrders.findIndex(po => po.id === parseInt(id));

    if (index === -1) throw new Error('Purchase Order tidak ditemukan');
    if (db.purchaseOrders[index].status !== 'Approved') {
      throw new Error('Hanya PO berstatus Approved yang dapat diterima (Receive).');
    }

    const userName = getUserName(db, userId);

    db.purchaseOrders[index].status = 'Received';
    db.purchaseOrders[index].timeline.push({
      status: 'Received',
      timestamp: new Date().toISOString(),
      note: `Barang telah diterima di cabang oleh ${userName}`
    });

    saveDB(db);
    return db.purchaseOrders[index];
  },

  cancel: async (id, userId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    const index = db.purchaseOrders.findIndex(po => po.id === parseInt(id));

    if (index === -1) throw new Error('Purchase Order tidak ditemukan');
    const currentStatus = db.purchaseOrders[index].status;
    if (currentStatus !== 'Draft' && currentStatus !== 'Submitted') {
      throw new Error('Hanya PO berstatus Draft atau Submitted yang dapat dibatalkan (Cancel).');
    }

    const userName = getUserName(db, userId);

    db.purchaseOrders[index].status = 'Cancelled';
    db.purchaseOrders[index].timeline.push({
      status: 'Cancelled',
      timestamp: new Date().toISOString(),
      note: `PO dibatalkan oleh ${userName}`
    });

    saveDB(db);
    return db.purchaseOrders[index];
  }
};
