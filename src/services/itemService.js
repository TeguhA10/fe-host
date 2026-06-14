import { apiClient } from '../lib/apiClient';

const mapItem = (item) => {
  if (!item) return null;
  const vendorName = item.default_vendor?.name || 'Unknown Vendor';

  return {
    id: item.id,
    name: item.name,
    sku: item.code, // Map backend 'code' to frontend 'sku'
    category: item.category,
    unit: item.unit || 'pcs',
    description: item.description || '',
    active: item.is_active,
    defaultVendorId: item.default_vendor_id,
    defaultVendorName: vendorName,
    lastPrice: parseFloat(item.last_price)
  };
};

export const itemService = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.search) query.append('search', params.search);
    if (params.category) query.append('category', params.category);
    if (params.status) {
      query.append('is_active', params.status === 'active' ? '1' : '0');
    }

    const res = await apiClient.get(`/api/purchasing/items?${query.toString()}`);
    const rawItems = res.data || [];
    const meta = res.meta || { page: 1, limit: 10, total: rawItems.length, total_pages: 1 };
    const mapped = rawItems.map(mapItem);

    if (params.page || params.limit || params.search || params.category || params.status) {
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
    const res = await apiClient.get(`/api/purchasing/items/${id}`);
    const item = res.data || res;
    return mapItem(item);
  },

  create: async (itemData) => {
    const payload = {
      code: itemData.sku.toUpperCase(),
      name: itemData.name,
      description: itemData.description || '',
      category: itemData.category || 'General',
      unit: itemData.unit || 'pcs',
      default_vendor_id: parseInt(itemData.defaultVendorId),
      last_price: parseFloat(itemData.lastPrice) || 0,
      is_active: itemData.active !== undefined ? itemData.active : true
    };

    const res = await apiClient.post('/api/purchasing/items', payload);
    return mapItem(res.data || res);
  },

  update: async (id, itemData) => {
    const payload = {
      code: itemData.sku.toUpperCase(),
      name: itemData.name,
      description: itemData.description || '',
      category: itemData.category || 'General',
      unit: itemData.unit || 'pcs',
      default_vendor_id: parseInt(itemData.defaultVendorId),
      last_price: parseFloat(itemData.lastPrice) || 0,
      is_active: itemData.active !== undefined ? itemData.active : true
    };

    const res = await apiClient.put(`/api/purchasing/items/${id}`, payload);
    return mapItem(res.data || res);
  },

  delete: async (id) => {
    await apiClient.patch(`/api/purchasing/items/${id}/deactivate`);
    return true;
  }
};
