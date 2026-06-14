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

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [meta, setMeta] = useState({ page: 1, limit: 5, total: 0, totalPages: 1 });

  // Load dropdown lists once on mount
  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const [bData, vData] = await Promise.all([
          branchService.getAll(),
          vendorService.getAll() // loads flat list since no pagination params passed
        ]);
        setBranches(bData);
        setVendors(vData);
      } catch (err) {
        console.error('Failed to load filter dropdown data:', err);
      }
    };
    loadDropdowns();
  }, []);

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      const res = await purchaseOrderService.getAll({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        status: statusFilter,
        branchId: branchFilter,
        vendorId: vendorFilter,
        startDate: dateFilter
      });
      // res is { data, meta }
      setPos(res.data || []);
      setMeta(res.meta || { page: 1, limit: itemsPerPage, total: 0, totalPages: 1 });
    } catch (err) {
      console.error('Failed to load purchase orders:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when filters, limit, or pages change
  useEffect(() => {
    fetchPurchaseOrders();
  }, [currentPage, itemsPerPage, searchTerm, statusFilter, branchFilter, vendorFilter, dateFilter]);

  // Reset page to 1 on filter changes
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
          className="inline-flex items-center justify-center space-x-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/15 hover:bg-indigo-500 transition-all duration-150 self-start sm:self-auto"
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
        ) : pos.length === 0 ? (
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
                  {pos.map(po => (
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
                          className="inline-flex items-center justify-center p-1.5 text-slate-455 hover:text-indigo-650 hover:bg-indigo-50 rounded-lg transition-all"
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
                  dari <span className="font-semibold text-slate-700">{meta.total}</span> Purchase Order
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
    </div>
  );
}
