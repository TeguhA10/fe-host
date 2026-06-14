import React, { useEffect, useState } from 'react';
import { positionService } from '../../../services/positionService';
import { Plus, Edit2, Trash2, Shield, ShieldAlert, Loader, AlertCircle } from 'lucide-react';
import { getDB } from '../../../data/db';

export default function PositionTree() {
  const [treeData, setTreeData] = useState([]);
  const [flatPositions, setFlatPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal / Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [formData, setFormData] = useState({ name: '', code: '', parentId: '' });

  const fetchPositions = async () => {
    try {
      setLoading(true);
      setError('');
      const tree = await positionService.getTree();
      const flat = await positionService.getAll();
      setTreeData(tree);
      setFlatPositions(flat);
    } catch (err) {
      setError(err.message || 'Gagal memuat struktur jabatan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  const handleOpenAdd = (parentPositionId = '') => {
    setFormData({ name: '', code: '', parentId: parentPositionId });
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (position) => {
    setSelectedPosition(position);
    setFormData({ name: position.name, code: position.code, parentId: position.parentId || '' });
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus jabatan ini?')) return;
    try {
      setError('');
      await positionService.delete(id);
      fetchPositions();
    } catch (err) {
      setError(err.message || 'Gagal menghapus jabatan.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) return setError('Nama jabatan wajib diisi.');
    if (!formData.code.trim()) return setError('Kode jabatan wajib diisi.');

    try {
      if (modalMode === 'create') {
        await positionService.create(formData);
      } else {
        await positionService.update(selectedPosition.id, formData);
      }
      setIsModalOpen(false);
      fetchPositions();
    } catch (err) {
      setError(err.message || 'Gagal menyimpan data jabatan.');
    }
  };

  // Count employees in position
  const db = getDB();
  const getEmployeeCount = (positionId) => {
    return db.employees.filter(emp => emp.positionId === positionId && emp.status === 'Active').length;
  };

  // Recursive Position Node Component
  const PositionNode = ({ node }) => {
    const [collapsed, setCollapsed] = useState(false);
    const hasChildren = node.children && node.children.length > 0;
    const empCount = getEmployeeCount(node.id);

    return (
      <div className="relative mt-4">
        {/* Position card layout */}
        <div className="flex items-center justify-between p-3.5 bg-white border border-slate-205/75 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setCollapsed(!collapsed)}
              className="text-slate-400 hover:text-indigo-600 transition-colors p-1"
            >
              {hasChildren ? (
                collapsed ? <ShieldAlert size={18} className="text-indigo-400" /> : <Shield size={18} className="text-indigo-650" />
              ) : (
                <Shield size={18} className="text-slate-350" />
              )}
            </button>
            <div>
              <span className="font-semibold text-slate-805 text-xs sm:text-sm">{node.name}</span>
              <span className="ml-2 inline-flex items-center rounded bg-slate-50 px-1.5 py-0.5 text-[9px] font-bold text-slate-500 ring-1 ring-inset ring-slate-500/10 uppercase">
                {node.code}
              </span>
              {empCount > 0 && (
                <span className="ml-2 inline-flex items-center rounded-full bg-indigo-50 px-1.5 py-0.5 text-[9px] font-semibold text-indigo-650 ring-1 ring-inset ring-indigo-600/15">
                  {empCount} Karyawan Aktif
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => handleOpenAdd(node.id)}
              className="p-1.5 text-slate-450 hover:text-indigo-605 hover:bg-indigo-50 rounded-lg transition-all"
              title="Tambah Bawahan Jabatan"
            >
              <Plus size={14} />
            </button>
            <button
              onClick={() => handleOpenEdit(node)}
              className="p-1.5 text-slate-450 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
              title="Ubah Jabatan"
            >
              <Edit2 size={13} />
            </button>
            <button
              onClick={() => handleDelete(node.id)}
              className="p-1.5 text-slate-455 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
              title="Hapus Jabatan"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Child Node Container */}
        {!collapsed && hasChildren && (
          <div className="pl-6 border-l border-slate-200 ml-5 space-y-1">
            {node.children.map(child => (
              <PositionNode key={child.id} node={child} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Struktur Jabatan</h1>
          <p className="text-xs text-slate-500 mt-0.5">Hirarki dan bagan pelaporan atasan-bawahan PT. Anyar Retail Group</p>
        </div>
        <button
          onClick={() => handleOpenAdd('')}
          className="inline-flex items-center justify-center space-x-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/15 hover:bg-indigo-500 transition-all duration-150 self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>Tambah Jabatan Puncak</span>
        </button>
      </div>

      {error && (
        <div className="flex items-start space-x-2 rounded-xl bg-rose-50 border border-rose-100 p-3.5 text-xs text-rose-600">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span className="font-semibold leading-relaxed">{error}</span>
        </div>
      )}

      {/* Tree list */}
      <div className="bg-slate-50/50 rounded-2xl border border-slate-200/70 p-6">
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader className="animate-spin text-indigo-500" size={24} />
          </div>
        ) : treeData.length === 0 ? (
          <div className="text-center py-12 text-slate-400 font-medium text-xs">
            Belum ada jabatan terdaftar. Klik "Tambah Jabatan Puncak" untuk memulai.
          </div>
        ) : (
          <div className="space-y-2 max-w-4xl">
            {treeData.map(rootPos => (
              <PositionNode key={rootPos.id} node={rootPos} />
            ))}
          </div>
        )}
      </div>

      {/* Position Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <h3 className="text-sm font-bold text-slate-800 mb-4">
              {modalMode === 'create' ? 'Tambah Jabatan' : 'Ubah Jabatan'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-2">Nama Jabatan</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="cth: Purchasing Supervisor"
                  className="block w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-2">Kode Jabatan</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="cth: P-SUP"
                  className="block w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              {modalMode === 'create' && formData.parentId && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-2">Atasan Langsung (Parent)</label>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-600">
                    {flatPositions.find(p => p.id === parseInt(formData.parentId))?.name || 'Root'}
                  </div>
                </div>
              )}

              {modalMode === 'edit' && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-2">Atasan Langsung (Parent)</label>
                  <select
                    value={formData.parentId}
                    onChange={(e) => setFormData(prev => ({ ...prev, parentId: e.target.value }))}
                    className="block w-full rounded-xl border border-slate-200 px-2 py-2 text-xs text-slate-705"
                  >
                    <option value="">Tidak ada (Jabatan Puncak)</option>
                    {flatPositions
                      .filter(p => p.id !== selectedPosition.id) // Avoid self-reference
                      .map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                  </select>
                </div>
              )}

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
                  className="rounded-lg bg-indigo-650 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-650/10"
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
