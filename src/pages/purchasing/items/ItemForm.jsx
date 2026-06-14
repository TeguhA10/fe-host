import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { itemService } from '../../../services/itemService';
import { vendorService } from '../../../services/vendorService';
import { ChevronLeft, Save, Loader, AlertCircle } from 'lucide-react';

export default function ItemForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Stationary',
    defaultVendorId: '',
    lastPrice: '',
    active: true
  });

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        setLoading(true);
        // Load active vendors only
        const allVendors = await vendorService.getAll();
        const activeVendors = allVendors.filter(v => v.active);
        setVendors(activeVendors);

        if (isEditMode) {
          const currentItem = await itemService.getById(id);
          setFormData({
            name: currentItem.name || '',
            sku: currentItem.sku || '',
            category: currentItem.category || 'Stationary',
            defaultVendorId: currentItem.defaultVendorId || '',
            lastPrice: currentItem.lastPrice || '',
            active: currentItem.active
          });
        } else if (activeVendors.length > 0) {
          setFormData(prev => ({ ...prev, defaultVendorId: activeVendors[0].id }));
        }
      } catch (err) {
        setError(err.message || 'Gagal memuat detail barang.');
      } finally {
        setLoading(false);
      }
    };
    fetchDependencies();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) return setError('Nama barang wajib diisi.');
    if (!formData.sku.trim()) return setError('SKU barang wajib diisi.');
    if (!formData.defaultVendorId) return setError('Default vendor wajib dipilih.');
    if (!formData.lastPrice || parseFloat(formData.lastPrice) <= 0) {
      return setError('Harga dasar barang wajib diisi dengan angka positif.');
    }

    setSubmitting(true);
    try {
      if (isEditMode) {
        await itemService.update(id, formData);
      } else {
        await itemService.create(formData);
      }
      navigate('/purchasing/items');
    } catch (err) {
      setError(err.message || 'Gagal menyimpan item katalog.');
    } finally {
      setSubmitting(false);
    }
  };

  const categories = ['Stationary', 'IT Hardware', 'IT Software', 'Furniture', 'Pantry & Cleaning', 'Office Supplies'];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/purchasing/items')}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-655 hover:text-indigo-650"
        >
          <ChevronLeft size={16} />
          <span>Batal</span>
        </button>
        <h1 className="text-lg font-bold text-slate-800">
          {isEditMode ? 'Ubah Item Katalog' : 'Tambah Item Baru'}
        </h1>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        {error && (
          <div className="mb-6 flex items-start space-x-2 rounded-xl bg-rose-50 border border-rose-100 p-3.5 text-xs text-rose-600">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span className="font-semibold leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Item SKU */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Kode SKU</label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                placeholder="cth: ATK-A480G"
                disabled={isEditMode}
                className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-850 focus:border-indigo-500 disabled:opacity-50 disabled:bg-slate-50 font-mono"
              />
            </div>

            {/* Item Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-605 mb-2">Nama Barang</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="cth: Kertas HVS A4 80gr"
                className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-850 focus:border-indigo-500"
              />
            </div>

            {/* Category selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Kategori Barang</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-705 focus:border-indigo-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Default Supplier */}
            <div>
              <label className="block text-xs font-semibold text-slate-650 mb-2">Supplier Utama (Default Vendor)</label>
              {vendors.length === 0 ? (
                <div className="text-xs text-rose-500 font-semibold p-2.5 bg-rose-50 rounded-xl border border-rose-100">
                  Belum ada vendor aktif terdaftar! Tambahkan vendor aktif terlebih dahulu.
                </div>
              ) : (
                <select
                  name="defaultVendorId"
                  value={formData.defaultVendorId}
                  onChange={handleChange}
                  className="block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-705 focus:border-indigo-500"
                >
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>{v.name} ({v.code})</option>
                  ))}
                </select>
              )}
            </div>

            {/* Reference Price */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Harga Beli Terakhir / Dasar</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-xs font-bold text-slate-400">Rp</span>
                <input
                  type="number"
                  name="lastPrice"
                  value={formData.lastPrice}
                  onChange={handleChange}
                  placeholder="50000"
                  className="block w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 text-xs text-slate-850 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Active Status Check */}
            <div className="col-span-2">
              <label className="flex items-center space-x-2 text-xs text-slate-600 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span>Katalog Item Aktif</span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/purchasing/items')}
              disabled={submitting}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting || vendors.length === 0}
              className="inline-flex items-center justify-center space-x-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/15 hover:bg-indigo-500 disabled:opacity-50 transition-all duration-150"
            >
              {submitting ? (
                <>
                  <Loader className="animate-spin" size={14} />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save size={14} />
                  <span>Simpan Item</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
