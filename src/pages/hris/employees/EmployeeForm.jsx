import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { employeeService } from '../../../services/employeeService';
import { branchService } from '../../../services/branchService';
import { positionService } from '../../../services/positionService';
import { apiClient } from '../../../lib/apiClient';
import { ChevronLeft, Save, Loader, AlertCircle } from 'lucide-react';

export default function EmployeeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    user_id: '',
    nama_lengkap: '',
    nomor_induk_karyawan: '',
    alamat: '',
    branch_id: '',
    position_id: '',
    tanggal_gabung: '',
    tanggal_mulai_kontrak: '',
    tanggal_akhir_kontrak: '',
    status: 'aktif'
  });

  const [branches, setBranches] = useState([]);
  const [positions, setPositions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadFormDependencies = async () => {
      try {
        setLoading(true);
        setError('');

        const [branchList, positionList, usersRes] = await Promise.all([
          branchService.getAll(),
          positionService.getAll(),
          apiClient.get('/api/auth/users')
        ]);

        setBranches(branchList);
        setPositions(positionList);
        setUsers(Array.isArray(usersRes) ? usersRes : (usersRes.data || []));

        if (isEditMode) {
          const currentEmp = await employeeService.getById(id);
          setFormData({
            user_id: currentEmp.user_id || '',
            nama_lengkap: currentEmp.nama_lengkap || '',
            nomor_induk_karyawan: currentEmp.nomor_induk_karyawan || '',
            alamat: currentEmp.alamat || '',
            branch_id: currentEmp.branch_id || '',
            position_id: currentEmp.position_id || '',
            tanggal_gabung: currentEmp.tanggal_gabung || '',
            tanggal_mulai_kontrak: currentEmp.tanggal_mulai_kontrak || '',
            tanggal_akhir_kontrak: currentEmp.tanggal_akhir_kontrak || '',
            status: currentEmp.status || 'aktif'
          });
        }
      } catch (err) {
        setError(err.message || 'Gagal memuat kelayakan form.');
      } finally {
        setLoading(false);
      }
    };

    loadFormDependencies();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Input Validations
    if (!formData.user_id) return setError('Akun pengguna wajib dipilih.');
    if (!formData.nama_lengkap.trim()) return setError('Nama lengkap karyawan wajib diisi.');
    if (!formData.nomor_induk_karyawan.trim()) return setError('Nomor induk karyawan wajib diisi.');
    if (!formData.alamat.trim()) return setError('Alamat karyawan wajib diisi.');
    if (!formData.branch_id) return setError('Cabang penempatan wajib dipilih.');
    if (!formData.position_id) return setError('Jabatan struktural wajib dipilih.');
    if (!formData.tanggal_gabung) return setError('Tanggal gabung wajib diisi.');
    if (!formData.tanggal_mulai_kontrak) return setError('Tanggal mulai kontrak wajib diisi.');

    // Check contract dates logical order
    if (formData.tanggal_akhir_kontrak && new Date(formData.tanggal_mulai_kontrak) > new Date(formData.tanggal_akhir_kontrak)) {
      return setError('Tanggal mulai kontrak tidak boleh melebihi tanggal akhir kontrak.');
    }

    setSubmitting(true);
    try {
      if (isEditMode) {
        await employeeService.update(id, formData);
      } else {
        await employeeService.create(formData);
      }
      navigate('/hris/employees');
    } catch (err) {
      setError(err.message || 'Gagal menyimpan data karyawan.');
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

  const statusOptions = [
    { value: 'aktif', label: 'Aktif' },
    { value: 'nonaktif', label: 'Non-Aktif' },
    { value: 'kontrak_berakhir', label: 'Kontrak Berakhir' }
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Form Action Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(isEditMode ? `/hris/employees/${id}` : '/hris/employees')}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-655 hover:text-indigo-650"
        >
          <ChevronLeft size={16} />
          <span>Batal</span>
        </button>
        <h1 className="text-lg font-bold text-slate-800">
          {isEditMode ? 'Ubah Data Karyawan' : 'Tambah Karyawan Baru'}
        </h1>
      </div>

      {/* Form Card Layout */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        {error && (
          <div className="mb-6 flex items-start space-x-2 rounded-xl bg-rose-50 border border-rose-100 p-3.5 text-xs text-rose-600">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span className="font-semibold leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* User Account Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Akun Pengguna (User Account)</label>
              <select
                name="user_id"
                value={formData.user_id}
                onChange={handleChange}
                disabled={isEditMode}
                className="block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-700 focus:border-indigo-500 focus:ring-indigo-500 bg-white disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">Pilih Akun User</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>
            </div>

            {/* Nomor Induk Karyawan (NIK) */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Nomor Induk Karyawan (NIK)</label>
              <input
                type="text"
                name="nomor_induk_karyawan"
                value={formData.nomor_induk_karyawan}
                onChange={handleChange}
                placeholder="cth: 2026.01.00001"
                className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-850 focus:border-indigo-500 transition-all-fast"
              />
            </div>

            {/* Full Name */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-2">Nama Lengkap</label>
              <input
                type="text"
                name="nama_lengkap"
                value={formData.nama_lengkap}
                onChange={handleChange}
                placeholder="cth: Teguh Afriyando"
                className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-855 focus:border-indigo-500 transition-all-fast"
              />
            </div>

            {/* Alamat / Tempat Tinggal */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-2">Alamat Karyawan</label>
              <input
                type="text"
                name="alamat"
                value={formData.alamat}
                onChange={handleChange}
                placeholder="cth: Jl. Cihampelas No. 12, Bandung"
                className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-855 focus:border-indigo-500 transition-all-fast"
              />
            </div>

            {/* Branch Placement */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Cabang Penempatan</label>
              <select
                name="branch_id"
                value={formData.branch_id}
                onChange={handleChange}
                className="block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-700 focus:border-indigo-500"
              >
                <option value="">Pilih Cabang</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            {/* Position Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Jabatan Struktural</label>
              <select
                name="position_id"
                value={formData.position_id}
                onChange={handleChange}
                className="block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-700 focus:border-indigo-500"
              >
                <option value="">Pilih Jabatan</option>
                {positions.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                ))}
              </select>
            </div>

            {/* Account Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Status Karyawan</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-700 focus:border-indigo-500"
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Tanggal Gabung */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Tanggal Gabung</label>
              <input
                type="date"
                name="tanggal_gabung"
                value={formData.tanggal_gabung}
                onChange={handleChange}
                className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-850 focus:border-indigo-500"
              />
            </div>

            {/* Tanggal Mulai Kontrak */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Mulai Kontrak Kerja</label>
              <input
                type="date"
                name="tanggal_mulai_kontrak"
                value={formData.tanggal_mulai_kontrak}
                onChange={handleChange}
                className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-850 focus:border-indigo-500"
              />
            </div>

            {/* Tanggal Akhir Kontrak */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Selesai Kontrak Kerja (Opsional)</label>
              <input
                type="date"
                name="tanggal_akhir_kontrak"
                value={formData.tanggal_akhir_kontrak || ''}
                onChange={handleChange}
                className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-850 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate(isEditMode ? `/hris/employees/${id}` : '/hris/employees')}
              disabled={submitting}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-605 hover:bg-slate-50 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center space-x-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/15 hover:bg-indigo-500 disabled:opacity-50 transition-all duration-150"
            >
              {submitting ? (
                <>
                  <Loader className="animate-spin" size={14} />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save size={14} />
                  <span>Simpan Karyawan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
