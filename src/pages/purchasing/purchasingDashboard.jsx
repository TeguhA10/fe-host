import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { purchaseOrderService } from '../../services/purchaseOrderService';
import { FileText, FileClock, CircleDollarSign, Plus, Eye } from 'lucide-react';
import { formatRupiah, formatDate } from '../../utils/format';
import StatusBadge from '../../components/badges/StatusBadge';

export default function PurchasingDashboard() {
  const [stats, setStats] = useState({
    totalCount: 0,
    pendingCount: 0,
    totalValue: 0,
    statusCounts: {},
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const pos = await purchaseOrderService.getAll();
        
        // Count for current month (June 2026 in our mock universe)
        const currentMonthPos = pos.filter(po => po.createdAt.startsWith('2026-06'));
        const totalCount = currentMonthPos.length;
        
        const pendingCount = pos.filter(po => po.status === 'Submitted').length;
        
        // Sum total active spend (Approved + Received + Submitted)
        const totalValue = pos
          .filter(po => ['Approved', 'Received', 'Submitted'].includes(po.status))
          .reduce((sum, po) => sum + po.totalAmount, 0);

        // Status groupings
        const statusCounts = pos.reduce((acc, po) => {
          acc[po.status] = (acc[po.status] || 0) + 1;
          return acc;
        }, {});

        // Recent POs (limit to 5)
        const recentOrders = [...pos]
          .sort((a, b) => b.id - a.id)
          .slice(0, 5);

        setStats({
          totalCount,
          pendingCount,
          totalValue,
          statusCounts,
          recentOrders
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  // Define status items for breakdown view
  const statusLabels = [
    { key: 'Draft', color: 'bg-slate-400' },
    { key: 'Submitted', color: 'bg-blue-500' },
    { key: 'Approved', color: 'bg-emerald-500' },
    { key: 'Rejected', color: 'bg-rose-500' },
    { key: 'Received', color: 'bg-teal-500' },
    { key: 'Cancelled', color: 'bg-neutral-600' }
  ];

  return (
    <div className="space-y-8">
      {/* Module Title and Header Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard Purchasing</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola pengadaan barang dan Purchase Order</p>
        </div>
        <Link
          to="/purchasing/purchase-orders/new"
          className="inline-flex items-center justify-center space-x-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/15 hover:bg-indigo-500 transition-all duration-150 self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>Buat PO Baru</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/85 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PO Bulan Ini (Juni)</p>
            <p className="text-3xl font-extrabold text-slate-800 mt-1">{stats.totalCount}</p>
          </div>
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
            <FileText size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/85 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Menunggu Persetujuan</p>
            <p className="text-3xl font-extrabold text-slate-800 mt-1">{stats.pendingCount}</p>
          </div>
          <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl">
            <FileClock size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/85 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Nilai Pengadaan Aktif</p>
            <p className="text-xl font-extrabold text-slate-800 mt-1 truncate" title={formatRupiah(stats.totalValue)}>
              {formatRupiah(stats.totalValue)}
            </p>
          </div>
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
            <CircleDollarSign size={24} />
          </div>
        </div>
      </div>

      {/* Status Breakdown & Recent PO List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Status Breakdown Panel */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800 mb-6">Status Pengadaan PO</h2>
            <div className="space-y-4">
              {statusLabels.map(({ key, color }) => {
                const count = stats.statusCounts[key] || 0;
                return (
                  <div key={key} className="flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center space-x-2.5">
                      <span className={`h-2.5 w-2.5 rounded-full ${color}`}></span>
                      <span className="text-slate-650">{key}</span>
                    </div>
                    <span className="text-slate-850 px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-md">
                      {count} PO
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Purchase Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-slate-800">Daftar Purchase Order Terbaru</h2>
            <Link to="/purchasing/purchase-orders" className="text-xs font-semibold text-indigo-600 hover:text-indigo-850">
              Lihat Semua PO
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3">Nomor PO</th>
                  <th className="pb-3">Cabang</th>
                  <th className="pb-3">Vendor</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Total Amount</th>
                  <th className="pb-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-650">
                {stats.recentOrders.map(po => (
                  <tr key={po.id} className="hover:bg-slate-50/50">
                    <td className="py-3 font-mono font-semibold text-slate-800">{po.poNumber}</td>
                    <td className="py-3">{po.branchName}</td>
                    <td className="py-3 truncate max-w-[120px]" title={po.vendorName}>{po.vendorName}</td>
                    <td className="py-3"><StatusBadge status={po.status} /></td>
                    <td className="py-3 text-right font-semibold text-slate-800">{formatRupiah(po.totalAmount)}</td>
                    <td className="py-3 text-center">
                      <Link 
                        to={`/purchasing/purchase-orders/${po.id}`}
                        className="inline-flex items-center justify-center p-1.5 text-slate-400 hover:text-indigo-650 hover:bg-indigo-50 rounded-lg transition-all"
                      >
                        <Eye size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
