import { apiClient } from '../lib/apiClient';

const parseContact = (contact) => {
  if (!contact) return { contact_person: '-', phone: '-' };
  const match = contact.match(/(.*?)\s*\((.*?)\)/);
  if (match) {
    return {
      contact_person: match[1].trim(),
      phone: match[2].trim()
    };
  }
  return {
    contact_person: contact,
    phone: '-'
  };
};

const mapVendor = (v) => {
  if (!v) return null;
  return {
    id: v.id,
    name: v.name,
    code: v.code,
    contact: v.phone ? `${v.contact_person} (${v.phone})` : v.contact_person,
    email: v.email,
    address: v.address,
    npwp: v.npwp,
    paymentTermDays: v.payment_term_days,
    active: v.is_active
  };
};

export const vendorService = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.search) query.append('search', params.search);
    if (params.status) {
      query.append('is_active', params.status === 'active' ? '1' : '0');
    }

    const res = await apiClient.get(`/api/purchasing/vendors?${query.toString()}`);
    const rawVendors = res.data || [];
    const meta = res.meta || { page: 1, limit: 10, total: rawVendors.length, total_pages: 1 };
    const mapped = rawVendors.map(mapVendor);

    if (params.page || params.limit || params.search || params.status) {
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
    const res = await apiClient.get(`/api/purchasing/vendors/${id}`);
    const vendor = res.data || res;
    
    // Fetch purchase history
    let poHistory = [];
    try {
      const historyRes = await apiClient.get(`/api/purchasing/vendors/${id}/purchase-history`);
      const rawHistory = Array.isArray(historyRes) ? historyRes : (historyRes.data || []);
      poHistory = rawHistory.map(po => ({
        id: po.id,
        poNumber: po.po_number,
        createdAt: po.created_at || po.tanggal_po,
        totalAmount: parseFloat(po.total_amount),
        status: po.status.charAt(0).toUpperCase() + po.status.slice(1).toLowerCase(),
        branchName: po.branch_name || 'Unknown Branch'
      }));
    } catch (e) {
      console.error('Failed to load purchase history:', e);
    }
    
    const mappedVendor = mapVendor(vendor);
    return {
      ...mappedVendor,
      poHistory
    };
  },

  create: async (vendorData) => {
    const { contact_person, phone } = parseContact(vendorData.contact);
    const payload = {
      name: vendorData.name,
      code: vendorData.code.toUpperCase(),
      contact_person,
      phone,
      email: vendorData.email || 'info@vendor.co.id',
      address: vendorData.address || '-',
      npwp: vendorData.npwp || '00.000.000.0-000.000',
      payment_term_days: vendorData.paymentTermDays ? parseInt(vendorData.paymentTermDays) : 30,
      is_active: vendorData.active !== undefined ? vendorData.active : true
    };

    const res = await apiClient.post('/api/purchasing/vendors', payload);
    return mapVendor(res.data || res);
  },

  update: async (id, vendorData) => {
    const { contact_person, phone } = parseContact(vendorData.contact);
    const payload = {
      name: vendorData.name,
      code: vendorData.code.toUpperCase(),
      contact_person,
      phone,
      email: vendorData.email || 'info@vendor.co.id',
      address: vendorData.address || '-',
      npwp: vendorData.npwp || '00.000.000.0-000.000',
      payment_term_days: vendorData.paymentTermDays ? parseInt(vendorData.paymentTermDays) : 30,
      is_active: vendorData.active !== undefined ? vendorData.active : true
    };

    const res = await apiClient.put(`/api/purchasing/vendors/${id}`, payload);
    return mapVendor(res.data || res);
  },

  delete: async (id) => {
    await apiClient.patch(`/api/purchasing/vendors/${id}/deactivate`);
    return true;
  }
};
