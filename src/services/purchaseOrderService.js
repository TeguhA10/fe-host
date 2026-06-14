import { apiClient } from '../lib/apiClient';

const mapPO = (po, creator = null) => {
  if (!po) return null;

  const statusMap = {
    draft: 'Draft',
    submitted: 'Submitted',
    approved: 'Approved',
    rejected: 'Rejected',
    received: 'Received',
    cancelled: 'Cancelled'
  };
  const mappedStatus = statusMap[po.status] || po.status;

  const formattedItems = (po.items || []).map(poi => {
    const qty = parseFloat(poi.quantity);
    const price = parseFloat(poi.unit_price);
    return {
      id: poi.id,
      itemId: poi.item_id,
      qty,
      price,
      subtotal: qty * price,
      itemName: poi.item_name || poi.item?.name || 'Unknown Item',
      itemSku: poi.item?.code || 'N/A',
      itemCategory: poi.item?.category || 'N/A'
    };
  });

  const timeline = [];
  const createdAt = po.created_at || po.tanggal_po || new Date().toISOString();
  
  timeline.push({
    status: 'Draft',
    timestamp: createdAt,
    note: `Draft PO dibuat.`
  });

  if (po.status !== 'draft') {
    timeline.push({
      status: 'Submitted',
      timestamp: po.updated_at || createdAt,
      note: `PO diajukan untuk review.`
    });
  }

  if (po.status === 'approved' || po.status === 'received') {
    timeline.push({
      status: 'Approved',
      timestamp: po.approved_at || po.updated_at || createdAt,
      note: `PO disetujui oleh User #${po.approved_by || 'Admin'}.`
    });
  }

  if (po.status === 'rejected') {
    timeline.push({
      status: 'Rejected',
      timestamp: po.approved_at || po.updated_at || createdAt,
      note: `PO ditolak oleh User #${po.approved_by || 'Admin'}. Alasan: ${po.rejection_reason || 'Tidak ada alasan'}`
    });
  }

  if (po.status === 'received') {
    timeline.push({
      status: 'Received',
      timestamp: po.tanggal_pengiriman || po.updated_at || createdAt,
      note: `Barang telah diterima di cabang.`
    });
  }

  if (po.status === 'cancelled') {
    timeline.push({
      status: 'Cancelled',
      timestamp: po.updated_at || createdAt,
      note: `PO dibatalkan.`
    });
  }

  const creatorName = creator ? creator.name : `User #${po.requested_by}`;

  return {
    id: po.id,
    poNumber: po.po_number,
    branchId: po.branch_id,
    branchName: po.branch_name || 'Unknown Branch',
    vendorId: po.vendor_id,
    vendorName: po.vendor?.name || 'Unknown Vendor',
    totalAmount: parseFloat(po.total_amount) || 0,
    status: mappedStatus,
    creatorId: po.requested_by,
    creatorName: creatorName,
    createdAt: po.created_at ? po.created_at.split('T')[0] : (po.tanggal_po || ''),
    items: formattedItems,
    timeline,
    vendorDetails: po.vendor ? {
      id: po.vendor.id,
      name: po.vendor.name,
      code: po.vendor.code,
      contact: po.vendor.phone ? `${po.vendor.contact_person} (${po.vendor.phone})` : po.vendor.contact_person,
      email: po.vendor.email,
      address: po.vendor.address
    } : null,
    branchDetails: { name: po.branch_name, code: po.branch_code },
    creatorDetails: creator || { name: creatorName },
    tanggalPengiriman: po.tanggal_pengiriman || po.tanggal_delivery || po.delivery_date || '',
    catatan: po.catatan || po.notes || po.note || '-'
  };
};

export const purchaseOrderService = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.search) query.append('search', params.search);
    
    if (params.status) {
      const statusMap = {
        'Draft': 'draft',
        'Submitted': 'submitted',
        'Approved': 'approved',
        'Rejected': 'rejected',
        'Received': 'received',
        'Cancelled': 'cancelled'
      };
      query.append('status', statusMap[params.status] || params.status);
    }
    
    if (params.branchId) query.append('branch_id', params.branchId);
    if (params.vendorId) query.append('vendor_id', params.vendorId);
    if (params.startDate) query.append('start_date', params.startDate);
    if (params.endDate) query.append('end_date', params.endDate);

    const res = await apiClient.get(`/api/purchasing/purchase-orders?${query.toString()}`);
    const rawPOs = res.data || [];
    const meta = res.meta || { page: 1, limit: 10, total: rawPOs.length, total_pages: 1 };

    // Fetch users for mapping creator name
    let users = [];
    try {
      const usersRes = await apiClient.get('/api/auth/users');
      users = usersRes.data || usersRes || [];
    } catch (e) {
      console.error('Failed to load users for PO mapping:', e);
    }

    const mapped = rawPOs.map(po => {
      const creator = users.find(u => u.id === po.requested_by);
      return mapPO(po, creator);
    });

    if (params.page || params.limit || params.search || params.status || params.branchId || params.vendorId || params.startDate || params.endDate) {
      return {
        data: mapped,
        meta: {
          page: meta.page,
          limit: meta.limit,
          total: meta.total,
          totalPages: meta.total_pages
        }
      };
    }
    return mapped;
  },

  getById: async (id) => {
    const res = await apiClient.get(`/api/purchasing/purchase-orders/${id}`);
    const po = res.data || res;
    
    let creator = null;
    try {
      const userRes = await apiClient.get(`/api/auth/users/${po.requested_by}`);
      creator = userRes.data || userRes;
    } catch (e) {
      console.error(`Failed to load creator user #${po.requested_by}:`, e);
    }
    
    return mapPO(po, creator);
  },

  create: async (poData, creatorId) => {
    // Step 1: Create PO Header (Draft status)
    const headerPayload = {
      branch_id: parseInt(poData.branchId) || 1,
      vendor_id: parseInt(poData.vendorId),
      tanggal_po: poData.tanggal_po || new Date().toISOString().split('T')[0],
      tanggal_dibutuhkan: poData.tanggal_dibutuhkan || null,
      catatan: poData.catatan || ''
    };
    const res = await apiClient.post('/api/purchasing/purchase-orders', headerPayload);
    const createdPo = res.data || res;

    // Step 2: Set items list sequentially
    const itemsPayload = {
      items: (poData.items || []).map(item => ({
        item_id: parseInt(item.itemId),
        quantity: parseFloat(item.qty),
        unit_price: parseFloat(item.price),
        notes: item.notes || ''
      }))
    };
    const itemsRes = await apiClient.put(`/api/purchasing/purchase-orders/${createdPo.id}/items`, itemsPayload);
    
    return purchaseOrderService.getById(createdPo.id);
  },

  update: async (id, poData, userId) => {
    // Call PUT updateItems directly to save/re-submit PO items list
    const itemsPayload = {
      items: (poData.items || []).map(item => ({
        item_id: parseInt(item.itemId),
        quantity: parseFloat(item.qty),
        unit_price: parseFloat(item.price),
        notes: item.notes || ''
      }))
    };
    const res = await apiClient.put(`/api/purchasing/purchase-orders/${id}/items`, itemsPayload);
    
    return purchaseOrderService.getById(id);
  },

  submit: async (id, userId) => {
    const res = await apiClient.patch(`/api/purchasing/purchase-orders/${id}/submit`);
    return purchaseOrderService.getById(id);
  },

  approve: async (id, userId) => {
    const res = await apiClient.patch(`/api/purchasing/purchase-orders/${id}/approve`);
    return purchaseOrderService.getById(id);
  },

  reject: async (id, userId, reason) => {
    const res = await apiClient.patch(`/api/purchasing/purchase-orders/${id}/reject`, {
      rejection_reason: reason
    });
    return purchaseOrderService.getById(id);
  },

  receive: async (id, userId, tanggalPengiriman) => {
    const res = await apiClient.patch(`/api/purchasing/purchase-orders/${id}/receive`, {
      tanggal_pengiriman: tanggalPengiriman || new Date().toISOString().split('T')[0]
    });
    return purchaseOrderService.getById(id);
  },

  cancel: async (id, userId) => {
    const res = await apiClient.patch(`/api/purchasing/purchase-orders/${id}/cancel`);
    return purchaseOrderService.getById(id);
  }
};
