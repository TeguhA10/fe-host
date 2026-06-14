import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { purchaseOrderService } from '../../../services/purchaseOrderService';
import { branchService } from '../../../services/branchService';
import { vendorService } from '../../../services/vendorService';
import { Search, Plus, Calendar, Eye, HelpCircle } from 'lucide-react';
import { formatRupiah, formatDate } from '../../../utils/format';
import StatusBadge from '../../../components/badges/StatusBadge';

export default function PurchaseOrderList() {
  const [pos, setPos] = useState([]);
  const [branches, setBranches] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [vendorFilter, setVendorFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchData = async () => {
    try {
      setLoading(true);
      const poData = await purchaseOrderService.getAll();
      const bData = await branchService.getAll();
      const vData = await vendorService.getAll();
      setPos(poData);
      setBranches(bData);
      setVendors(vData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter Logic
  const filteredPos = pos.filter(po => {
    const matchesSearch = po.poNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' ? true : po.status === statusFilter;
    const matchesBranch = branchFilter === '' ? true : po.branchId === parseInt(branchFilter);
    const matchesVendor = vendorFilter === '' ? true : po.vendorId === parseInt(vendorFilter);
    const matchesDate = dateFilter === '' ? true : po.createdAt === dateFilter;

    return matchesSearch && matchesStatus && matchesBranch && matchesVendor && matchesDate;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredPos.length / itemsPerPage);
  const paginatedPos = filteredPos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, branchFilter, vendorFilter, dateFilter]);

  const statusOptions = ['Draft', 'Submitted', 'Approved', 'Rejected', 'Received', 'Cancelled'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Daftar Purchase Order (PO)</h1>
          <p className="text-xs text-slate-500 mt-0.5">Kelola, tinjau status, dan setujui transaksi pengadaan barang</p>
        </div>
        <Link
          to="/purchasing/purchase-orders/new"
          className="inline-flex items-center justify-center space-x-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/15 hover:bg-indigo-500 transition-all duration-150 self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>Buat PO Baru</span>
        </Link>
      </div>

      {/* Advanced Filter Panel */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Search by PO number */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search size={14} />
            </div>
            <input
              type="text"
              placeholder="Cari nomor PO..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-2 text-xs text-slate-700 placeholder-slate-400 focus:border-indigo-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-655 focus:border-indigo-500"
            >
              <option value="">Semua Status</option>
              {statusOptions.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Branch Filter */}
          <div>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-655 focus:border-indigo-500"
            >
              <option value="">Semua Cabang</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Vendor Filter */}
          <div>
            <select
              value={vendorFilter}
              onChange={(e) => setVendorFilter(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-655 focus:border-indigo-500"
            >
              <option value="">Semua Vendor</option>
              {vendors.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="relative">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs text-slate-655 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* PO Table grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
          </div>
        ) : paginatedPos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-450">
            <HelpCircle size={40} className="text-slate-300 mb-3" />
            <p className="text-sm font-semibold">Purchase Order tidak ditemukan</p>
            <p className="text-xs text-slate-400 mt-1">Coba bersihkan atau ubah filter pencarian Anda</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-4">Nomor PO</th>
                    <th className="p-4">Tanggal Pengajuan</th>
                    <th className="p-4">Cabang Peminta</th>
                    <th className="p-4">Vendor Supplier</th>
                    <th className="p-4">Pembuat PO</th>
                    <th className="p-4 text-right">Total Nilai</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-650">
                  {paginatedPos.map(po => (
                    <tr key={po.id} className="hover:bg-slate-50/40">
                      <td className="p-4 font-mono font-semibold text-slate-800">{po.poNumber}</td>
                      <td className="p-4 font-medium text-slate-550">
                        <div className="flex items-center space-x-1.5">
                          <Calendar size={13} className="text-slate-400" />
                          <span>{formatDate(po.createdAt)}</span>
                        </div>
                      </td>
                      <td className="p-4">{po.branchName}</td>
                      <td className="p-4 font-semibold text-slate-700 truncate max-w-[140px]" title={po.vendorName}>
                        {po.vendorName}
                      </td>
                      <td className="p-4">{po.creatorName}</td>
                      <td className="p-4 text-right font-semibold text-slate-800">{formatRupiah(po.totalAmount)}</td>
                      <td className="p-4 text-center">
                        <StatusBadge status={po.status} />
                      </td>
                      <td className="p-4 text-center">
                        <Link
                          to={`/purchasing/purchase-orders/${po.id}`}
                          className="inline-flex items-center justify-center p-1.5 text-slate-450 hover:text-indigo-650 hover:bg-indigo-50 rounded-lg transition-all"
                          title="Detail Purchase Order"
                        >
                          <Eye size={14} />
                        </Link>
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
                    {Math.min(currentPage * itemsPerPage, filteredPos.length)}
                  </span>{' '}
                  dari <span className="font-semibold text-slate-700">{filteredPos.length}</span> Purchase Order
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-605 hover:bg-slate-50 disabled:opacity-40"
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
                    className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-605 hover:bg-slate-50 disabled:opacity-40"
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
