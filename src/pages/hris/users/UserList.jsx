import React, { useEffect, useState } from 'react';
import { userService } from '../../../services/userService';
import { branchService } from '../../../services/branchService';
import { useAuth } from '../../../contexts/AuthContext';
import { Plus, Edit2, Shield, Power, User, Store, Loader, AlertCircle } from 'lucide-react';

const ROLES = [
  { id: 'superadmin', name: 'Super Admin' },
  { id: 'admin_hrd', name: 'Admin HRD' },
  { id: 'admin_purchasing', name: 'Admin Purchasing' },
  { id: 'admin_cabang', name: 'Admin Cabang' },
  { id: 'staff_purchasing', name: 'Staff Purchasing' },
  { id: 'karyawan', name: 'Karyawan' }
];

export default function UserList() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState(ROLES);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    roleId: 'staff_purchasing',
    branchId: ''
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await userService.getAll();
      const branchList = await branchService.getAll();
      setUsers(data);
      setBranches(branchList);
    } catch (err) {
      setError(err.message || 'Gagal memuat daftar pengguna.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenAdd = () => {
    setFormData({ name: '', email: '', password: '', roleId: 'staff_purchasing', branchId: branches[0]?.id || '' });
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Keep password blank unless changing
      roleId: user.roleId,
      branchId: user.branchId || ''
    });
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleToggleActive = async (id) => {
    try {
      setError('');
      await userService.toggleActive(id, currentUser?.id);
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Gagal mengubah status aktif user.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) return setError('Nama lengkap wajib diisi.');
    if (!formData.email.trim()) return setError('Email wajib diisi.');
    if (modalMode === 'create' && !formData.password.trim()) return setError('Kata sandi wajib diisi.');
    if (!formData.branchId) return setError('Cabang wajib dipilih.');

    try {
      if (modalMode === 'create') {
        await userService.create(formData);
      } else {
        await userService.update(selectedUser.id, formData);
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Gagal menyimpan data pengguna.');
    }
  };

  const getRoleName = (roleId) => roles.find(r => r.id === roleId)?.name || roleId;
  const getBranchName = (branchId) => branches.find(b => b.id === branchId)?.name || '-';

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Manajemen Pengguna (User Accounts)</h1>
          <p className="text-xs text-slate-500 mt-0.5">Kelola hak akses sistem, pembagian kantor cabang, dan status akun login</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center space-x-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/15 hover:bg-indigo-500 transition-all duration-150 self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>Tambah Akun Baru</span>
        </button>
      </div>

      {error && (
        <div className="flex items-start space-x-2 rounded-xl bg-rose-50 border border-rose-100 p-3.5 text-xs text-rose-600">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span className="font-semibold leading-relaxed">{error}</span>
        </div>
      )}

      {/* Grid of Users Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex h-32 items-center justify-center">
            <Loader className="animate-spin text-indigo-500" size={24} />
          </div>
        ) : users.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-400 font-medium text-xs">
            Belum ada akun pengguna terdaftar.
          </div>
        ) : (
          users.map(u => (
            <div
              key={u.id}
              className={`bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all duration-200 space-y-4 relative ${!u.active ? 'border-slate-100 opacity-60 bg-slate-50/50' : 'border-slate-200/80'
                }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2.5 rounded-xl ${u.roleId === 'superadmin' ? 'bg-purple-50 text-purple-650' : 'bg-indigo-50 text-indigo-650'
                    }`}>
                    <User size={18} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 text-xs sm:text-sm">{u.name}</h3>
                    <p className="text-[10px] text-slate-400 font-semibold">{u.email}</p>
                  </div>
                </div>

                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold ring-1 ring-inset ${u.active
                    ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                    : 'bg-slate-100 text-slate-600 ring-slate-500/10'
                  }`}>
                  {u.active ? 'Aktif' : 'Non-Aktif'}
                </span>
              </div>

              {/* Account properties */}
              <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                <div className="flex items-center text-slate-600 space-x-2">
                  <Shield size={13} className="text-slate-400" />
                  <span className="font-semibold">{getRoleName(u.roleId)}</span>
                </div>
                <div className="flex items-center text-slate-650 space-x-2">
                  <Store size={13} className="text-slate-400" />
                  <span>{getBranchName(u.branchId)}</span>
                </div>
              </div>

              {/* Card Actions */}
              <div className="flex items-center justify-end border-t border-slate-100 pt-3 space-x-2">
                <button
                  onClick={() => handleToggleActive(u.id)}
                  className={`inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${u.active
                      ? 'border-rose-100 text-rose-600 hover:bg-rose-50'
                      : 'border-emerald-100 text-emerald-600 hover:bg-emerald-50'
                    }`}
                  title={u.active ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                >
                  <Power size={11} />
                  <span>{u.active ? 'Matikan' : 'Aktifkan'}</span>
                </button>
                <button
                  onClick={() => handleOpenEdit(u)}
                  className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-650 hover:bg-slate-50 hover:border-slate-305 text-[10px] font-semibold"
                >
                  <Edit2 size={11} />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <h3 className="text-sm font-bold text-slate-800 mb-4">
              {modalMode === 'create' ? 'Tambah Akun User' : 'Ubah Akun User'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-2">Nama Lengkap</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="cth: Rian Hidayat"
                  className="block w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-2">Email Login</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="cth: rian@example.com"
                  className="block w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-455 uppercase mb-2">
                  {modalMode === 'create' ? 'Kata Sandi' : 'Kata Sandi Baru (Kosongkan jika tidak diubah)'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="••••••••"
                  className="block w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-2">Peran Otoritas (Role)</label>
                <select
                  value={formData.roleId}
                  onChange={(e) => setFormData(prev => ({ ...prev, roleId: e.target.value }))}
                  className="block w-full rounded-xl border border-slate-200 px-2 py-2 text-xs text-slate-705"
                >
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-2">Kantor Cabang</label>
                <select
                  value={formData.branchId}
                  onChange={(e) => setFormData(prev => ({ ...prev, branchId: e.target.value }))}
                  className="block w-full rounded-xl border border-slate-200 px-2 py-2 text-xs text-slate-705"
                >
                  <option value="">Pilih Cabang</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="mt-6 flex justify-end space-x-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-650 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-500 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-650/10"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
