import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { employeeService } from '../../../services/employeeService';
import { branchService } from '../../../services/branchService';
import { positionService } from '../../../services/positionService';
import { Search, Plus, Eye, Trash2, Edit, ArrowUpDown, HelpCircle, Calendar } from 'lucide-react';
import { formatDate } from '../../../utils/format';

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [meta, setMeta] = useState({ page: 1, limit: 5, total: 0, totalPages: 1 });

  // Sorting State
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await employeeService.getAll({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        branchId: selectedBranch,
        division: selectedDivision,
        level: selectedLevel,
        status: selectedStatus
      });
      setEmployees(res.data || []);
      setMeta(res.meta || { page: 1, limit: itemsPerPage, total: 0, totalPages: 1 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load branches & divisions options once on mount
  useEffect(() => {
    const loadFiltersData = async () => {
      try {
        const bData = await branchService.getAll();
        setBranches(bData);
        
        const pData = await positionService.getAll();
        const uniqueDivisions = [...new Set(pData.map(p => p.division).filter(Boolean))];
        setDivisions(uniqueDivisions);
      } catch (e) {
        console.error(e);
      }
    };
    loadFiltersData();
  }, []);

  // Fetch employees when filters, limit, or pages change
  useEffect(() => {
    fetchEmployees();
  }, [currentPage, itemsPerPage, searchTerm, selectedBranch, selectedDivision, selectedLevel, selectedStatus]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedBranch, selectedDivision, selectedLevel, selectedStatus]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await employeeService.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetchEmployees();
    } catch (err) {
      alert(err.message || 'Gagal menghapus karyawan');
    }
  };

  const handleSort = (field) => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortField(field);
    setSortOrder(isAsc ? 'desc' : 'asc');
  };

  // Apply sorting locally on current page results
  const sortedEmployees = [...employees].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (sortField === 'branch') {
      aValue = a.branchName;
      bValue = b.branchName;
    } else if (sortField === 'division') {
      aValue = a.division;
      bValue = b.division;
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const levelOptions = ['Director', 'Manager', 'Supervisor', 'Staff'];
  const statusOptions = ['aktif', 'nonaktif'];

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Manajemen Karyawan</h1>
          <p className="text-xs text-slate-500 mt-0.5">Kelola berkas profil data dan status kontrak karyawan</p>
        </div>
        <Link
          to="/hris/employees/new"
          className="inline-flex items-center justify-center space-x-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/15 hover:bg-indigo-500 transition-all duration-150 self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>Tambah Karyawan</span>
        </Link>
      </div>

      {/* Advanced Filters Panel */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative md:col-span-2">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Cari karyawan berdasarkan nama / email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-3 py-2 text-xs text-slate-700 placeholder-slate-400 focus:border-indigo-500 focus:bg-white transition-all-fast"
            />
          </div>

          {/* Branch Filter */}
          <div>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-600 focus:border-indigo-500 focus:bg-white"
            >
              <option value="">Semua Cabang</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Division Filter */}
          <div>
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-600 focus:border-indigo-500 focus:bg-white"
            >
              <option value="">Semua Divisi</option>
              {divisions.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-600 focus:border-indigo-500 focus:bg-white"
            >
              <option value="">Semua Status</option>
              {statusOptions.map(st => (
                <option key={st} value={st}>{st === 'aktif' ? 'Aktif' : 'Non-Aktif'}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
          </div>
        ) : sortedEmployees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <HelpCircle size={40} className="text-slate-300 mb-3" />
            <p className="text-sm font-semibold">Karyawan tidak ditemukan</p>
            <p className="text-xs text-slate-400 mt-1">Coba sesuaikan pencarian atau filter Anda</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">
                    <th className="p-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('name')}>
                      <div className="flex items-center space-x-1">
                        <span>Nama Karyawan</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('branch')}>
                      <div className="flex items-center space-x-1">
                        <span>Cabang</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('division')}>
                      <div className="flex items-center space-x-1">
                        <span>Divisi & Jabatan</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th className="p-4">Level</th>
                    <th className="p-4">Kontrak Berakhir</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-650">
                  {sortedEmployees.map(emp => (
                    <tr key={emp.id} className="hover:bg-slate-50/40">
                      {/* Name / Contact details */}
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={emp.photo}
                            alt={emp.name}
                            className="h-9 w-9 rounded-full object-cover ring-2 ring-slate-100"
                          />
                          <div>
                            <p className="font-semibold text-slate-800">{emp.name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{emp.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Branch details */}
                      <td className="p-4 font-medium">{emp.branchName}</td>

                      {/* Division details */}
                      <td className="p-4">
                        <p className="font-medium text-slate-700">{emp.division}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{emp.positionName}</p>
                      </td>

                      {/* Job level */}
                      <td className="p-4">
                        <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-606 ring-1 ring-inset ring-slate-500/10">
                          {emp.level}
                        </span>
                      </td>

                      {/* Contract Date */}
                      <td className="p-4 font-semibold text-slate-700">{formatDate(emp.contractEnd)}</td>

                      {/* Status Badges */}
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${emp.status === 'aktif'
                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
                            : 'bg-slate-100 text-slate-750 ring-1 ring-inset ring-slate-650/10'
                          }`}>
                          {emp.status === 'aktif' ? 'Aktif' : 'Non-Aktif'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <Link
                            to={`/hris/employees/${emp.id}`}
                            className="p-1.5 text-slate-450 hover:text-indigo-650 hover:bg-indigo-50 rounded-lg transition-all"
                            title="Detail"
                          >
                            <Eye size={14} />
                          </Link>
                          <Link
                            to={`/hris/employees/${emp.id}/edit`}
                            className="p-1.5 text-slate-455 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                            title="Ubah"
                          >
                            <Edit size={14} />
                          </Link>
                          <button
                            onClick={() => setDeleteTarget(emp)}
                            className="p-1.5 text-slate-455 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            title="Hapus"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {meta.total > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 px-6 py-4 bg-slate-50/30">
                <div className="flex items-center space-x-2 text-xs text-slate-500">
                  <span>Tampilkan</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(parseInt(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="rounded-lg border border-slate-200 px-2 py-1 bg-white text-slate-750 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span>data per halaman</span>
                </div>

                <div className="text-xs text-slate-500 font-medium">
                  Menampilkan <span className="font-semibold text-slate-700">{(meta.page - 1) * meta.limit + 1}</span> hingga{' '}
                  <span className="font-semibold text-slate-700">
                    {Math.min(meta.page * meta.limit, meta.total)}
                  </span>{' '}
                  dari <span className="font-semibold text-slate-700">{meta.total}</span> karyawan
                </div>

                {meta.totalPages > 1 && (
                  <div className="flex space-x-1">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                      disabled={meta.page === 1}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                    >
                      Sebelumnya
                    </button>
                    {[...Array(meta.totalPages)].map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentPage(idx + 1)}
                        className={`rounded-lg px-3 py-1 text-xs font-semibold ${meta.page === idx + 1
                            ? 'bg-indigo-650 text-white shadow-sm'
                            : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(p => Math.min(p + 1, meta.totalPages))}
                      disabled={meta.page === meta.totalPages}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                    >
                      Selanjutnya
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Custom Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setDeleteTarget(null)}></div>
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <h3 className="text-base font-bold text-slate-800">Hapus Data Karyawan</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Apakah Anda yakin ingin menghapus data karyawan <span className="font-bold text-slate-700">{deleteTarget.name}</span>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-505 shadow-lg shadow-rose-600/10"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
