import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { employeeService } from '../../../services/employeeService';
import { branchService } from '../../../services/branchService';
import { positionService } from '../../../services/positionService';
import { getDB } from '../../../data/db';
import { Search, Plus, Filter, Edit, Eye, Trash2, ArrowUpDown, HelpCircle } from 'lucide-react';
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Sorting
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getAll();
      const bData = await branchService.getAll();
      const db = getDB();
      setEmployees(data);
      setBranches(bData);
      setDivisions(db.divisions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

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

  // Helper to resolve branch and position name
  const db = getDB();
  const getBranchName = (id) => db.branches.find(b => b.id === id)?.name || '-';
  const getDivisionName = (id) => db.divisions.find(d => d.id === id)?.name || '-';
  const getPositionName = (id) => db.positions.find(p => p.id === id)?.name || '-';

  // Apply filters
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = selectedBranch ? emp.branchId === parseInt(selectedBranch) : true;
    const matchesDivision = selectedDivision ? emp.divisionId === parseInt(selectedDivision) : true;
    const matchesLevel = selectedLevel ? emp.level === selectedLevel : true;
    const matchesStatus = selectedStatus ? emp.status === selectedStatus : true;

    return matchesSearch && matchesBranch && matchesDivision && matchesLevel && matchesStatus;
  });

  // Apply sorting
  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (sortField === 'branch') {
      aValue = getBranchName(a.branchId);
      bValue = getBranchName(b.branchId);
    } else if (sortField === 'division') {
      aValue = getDivisionName(a.divisionId);
      bValue = getDivisionName(b.divisionId);
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Apply pagination
  const totalPages = Math.ceil(sortedEmployees.length / itemsPerPage);
  const paginatedEmployees = sortedEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1); // Reset page on filter change
  }, [searchTerm, selectedBranch, selectedDivision, selectedLevel, selectedStatus]);

  const levelOptions = ['Director', 'Manager', 'Supervisor', 'Staff'];
  const statusOptions = ['Active', 'Inactive'];

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
          className="inline-flex items-center justify-center space-x-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/15 hover:bg-indigo-500 transition-all duration-150 self-start sm:self-auto"
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
                <option key={d.id} value={d.id}>{d.name}</option>
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
                <option key={st} value={st}>{st === 'Active' ? 'Aktif' : 'Non-Aktif'}</option>
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
        ) : paginatedEmployees.length === 0 ? (
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
                  {paginatedEmployees.map(emp => (
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
                      <td className="p-4 font-medium">{getBranchName(emp.branchId)}</td>

                      {/* Division details */}
                      <td className="p-4">
                        <p className="font-medium text-slate-700">{getDivisionName(emp.divisionId)}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{getPositionName(emp.positionId)}</p>
                      </td>

                      {/* Job level */}
                      <td className="p-4">
                        <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-600 ring-1 ring-inset ring-slate-500/10">
                          {emp.level}
                        </span>
                      </td>

                      {/* Contract Date */}
                      <td className="p-4 font-semibold text-slate-700">{formatDate(emp.contractEnd)}</td>

                      {/* Status Badges */}
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          emp.status === 'Active' 
                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
                            : 'bg-slate-100 text-slate-750 ring-1 ring-inset ring-slate-650/10'
                        }`}>
                          {emp.status === 'Active' ? 'Aktif' : 'Non-Aktif'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <Link 
                            to={`/hris/employees/${emp.id}`}
                            className="p-1.5 text-slate-450 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="Detail"
                          >
                            <Eye size={14} />
                          </Link>
                          <Link 
                            to={`/hris/employees/${emp.id}/edit`}
                            className="p-1.5 text-slate-450 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                            title="Ubah"
                          >
                            <Edit size={14} />
                          </Link>
                          <button 
                            onClick={() => setDeleteTarget(emp)}
                            className="p-1.5 text-slate-450 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
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
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
                <div className="text-xs text-slate-500 font-medium">
                  Menampilkan <span className="font-semibold text-slate-700">{(currentPage - 1) * itemsPerPage + 1}</span> hingga{' '}
                  <span className="font-semibold text-slate-700">
                    {Math.min(currentPage * itemsPerPage, filteredEmployees.length)}
                  </span>{' '}
                  dari <span className="font-semibold text-slate-700">{filteredEmployees.length}</span> karyawan
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                  >
                    Sebelumnya
                  </button>
                  {[...Array(totalPages)].map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPage(idx + 1)}
                      className={`rounded-lg px-3 py-1 text-xs font-semibold ${
                        currentPage === idx + 1
                          ? 'bg-indigo-650 text-white shadow-sm'
                          : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                  >
                    Selanjutnya
                  </button>
                </div>
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
                className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 shadow-lg shadow-rose-600/10"
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
