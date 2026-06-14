import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { vendorService } from '../../../services/vendorService';
import { ChevronLeft, Save, Loader, AlertCircle } from 'lucide-react';

export default function VendorForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    contact: '',
    email: '',
    address: '',
    active: true
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVendor = async () => {
      if (!isEditMode) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await vendorService.getById(id);
        setFormData({
          name: data.name || '',
          code: data.code || '',
          contact: data.contact || '',
          email: data.email || '',
          address: data.address || '',
          active: data.active
        });
      } catch (err) {
        setError(err.message || 'Gagal memuat detail vendor.');
      } finally {
        setLoading(false);
      }
    };
    fetchVendor();
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

    if (!formData.name.trim()) return setError('Nama vendor wajib diisi.');
    if (!formData.code.trim()) return setError('Kode vendor wajib diisi.');
    if (!formData.contact.trim()) return setError('Narahubung vendor wajib diisi.');
    if (!formData.email.trim()) return setError('Email vendor wajib diisi.');
    if (!formData.address.trim()) return setError('Alamat vendor wajib diisi.');

    setSubmitting(true);
    try {
      if (isEditMode) {
        await vendorService.update(id, formData);
      } else {
        await vendorService.create(formData);
      }
      navigate('/purchasing/vendors');
    } catch (err) {
      setError(err.message || 'Gagal menyimpan vendor.');
    } finally {
      setSubmitting(false);
    }
  };

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
          onClick={() => navigate(isEditMode ? `/purchasing/vendors/${id}` : '/purchasing/vendors')}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-650 hover:text-indigo-650"
        >
          <ChevronLeft size={16} />
          <span>Batal</span>
        </button>
        <h1 className="text-lg font-bold text-slate-800">
          {isEditMode ? 'Ubah Data Vendor' : 'Tambah Vendor Baru'}
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
            {/* Vendor Code */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Kode Vendor</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="cth: VND001"
                disabled={isEditMode} // Usually vendor codes are read-only once created
                className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-850 focus:border-indigo-500 disabled:opacity-50 disabled:bg-slate-50"
              />
            </div>

            {/* Vendor Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Nama Vendor</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="cth: PT. Global Stationary"
                className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-850 focus:border-indigo-500"
              />
            </div>

            {/* Contact Person */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Narahubung (Contact Person)</label>
              <input
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                placeholder="cth: Andi (081234567)"
                className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-850 focus:border-indigo-500"
              />
            </div>

            {/* Vendor Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Email Vendor</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="cth: sales@vendor.co.id"
                className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-850 focus:border-indigo-500 font-mono"
              />
            </div>

            {/* Address */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-2">Alamat Lengkap</label>
              <textarea
                name="address"
                rows={3}
                value={formData.address}
                onChange={handleChange}
                placeholder="cth: Jl. Industri Raya No. 45, Jakarta"
                className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-850 focus:border-indigo-500"
              />
            </div>

            {/* Active Switch */}
            <div className="col-span-2">
              <label className="flex items-center space-x-2 text-xs text-slate-600 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span>Vendor Kemitraan Aktif</span>
              </label>
            </div>
          </div>

          {/* Form buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate(isEditMode ? `/purchasing/vendors/${id}` : '/purchasing/vendors')}
              disabled={submitting}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
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
                  <span>Simpan Vendor</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
