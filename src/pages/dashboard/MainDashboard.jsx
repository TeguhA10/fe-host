import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { employeeService } from '../../services/employeeService';
import { branchService } from '../../services/branchService';
import { vendorService } from '../../services/vendorService';
import { purchaseOrderService } from '../../services/purchaseOrderService';
import { Users, ShoppingBag, Store, FileCheck, ArrowRight, ShieldCheck } from 'lucide-react';
import { formatRupiah } from '../../utils/format';

export default function MainDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeEmployees: 0,
    totalBranches: 0,
    activeVendors: 0,
    totalPoValue: 0,
    pendingPos: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const [empRes, branchList, vendorRes, poRes] = await Promise.all([
          employeeService.getAll({ limit: 1, status: 'Active' }),
          branchService.getAll(),
          vendorService.getAll({ limit: 1, status: 'active' }),
          purchaseOrderService.getAll({ limit: 1000 })
        ]);

        const activeEmps = empRes.meta?.total || 0;
        const totalBranches = branchList.length;
        const activeVendors = vendorRes.meta?.total || 0;
        
        const poList = poRes.data || poRes || [];
        const pending = poList.filter(po => po.status === 'Submitted').length;
        const totalVal = poList
          .filter(po => po.status !== 'Cancelled' && po.status !== 'Rejected')
          .reduce((sum, po) => sum + po.totalAmount, 0);

        setStats({
          activeEmployees: activeEmps,
          totalBranches: totalBranches,
          activeVendors: activeVendors,
          totalPoValue: totalVal,
          pendingPos: pending
        });
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const cardStyle = "bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 flex items-center space-x-4";

  return (
    <div className="space-y-8">
      {/* Welcome banner card */}
      <div className="relative overflow-hidden rounded-3xl bg-indigo-900 text-white p-8 md:p-10 shadow-xl shadow-indigo-950/15">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_40%)]"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-indigo-850 px-3 py-1 rounded-full text-xs font-semibold text-indigo-200 mb-4 border border-indigo-750">
            <ShieldCheck size={14} />
            <span>Sistem ERP Terintegrasi</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Selamat Datang, {user?.name}!
          </h1>
          <p className="mt-3 text-sm md:text-base text-indigo-200 leading-relaxed">
            Aplikasi ini mendemonstrasikan sistem Enterprise Resource Planning (ERP) untuk PT. Anyar Retail Group.
            Gunakan panel navigasi kiri atau tombol di bawah untuk menjelajah modul HRIS dan Purchasing.
          </p>
        </div>
      </div>

      {/* Global High-Level KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={cardStyle}>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Users size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Karyawan Aktif</p>
            <p className="text-2xl font-bold text-slate-800">{loading ? '...' : stats.activeEmployees}</p>
          </div>
        </div>

        <div className={cardStyle}>
          <div className="p-3 bg-emerald-50 text-emerald-655 rounded-xl">
            <Store size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Cabang</p>
            <p className="text-2xl font-bold text-slate-800">{loading ? '...' : stats.totalBranches}</p>
          </div>
        </div>

        <div className={cardStyle}>
          <div className="p-3 bg-amber-50 text-amber-605 rounded-xl">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vendor Aktif</p>
            <p className="text-2xl font-bold text-slate-800">{loading ? '...' : stats.activeVendors}</p>
          </div>
        </div>

        <div className={cardStyle}>
          <div className="p-3 bg-rose-50 text-rose-500 rounded-xl">
            <FileCheck size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nilai Transaksi PO</p>
            <p className="text-base font-bold text-slate-800 truncate" title={formatRupiah(stats.totalPoValue)}>
              {loading ? '...' : formatRupiah(stats.totalPoValue)}
            </p>
          </div>
        </div>
      </div>

      {/* Modules Redirection Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* HRIS module quick entry card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <div className="inline-flex p-4 bg-indigo-50 text-indigo-600 rounded-2xl mb-6">
              <Users size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Human Resource Information System (HRIS)</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Kelola seluruh data kepegawaian perusahaan secara terpusat. Dilengkapi dengan bagan organisasi untuk cabang dan jabatan, kontrak karyawan aktif, monitoring masa berlaku kontrak, dan manajemen otorisasi pengguna.
            </p>
          </div>
          <Link
            to="/hris"
            className="inline-flex items-center justify-center space-x-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/10 hover:bg-indigo-500 transition-all duration-150 self-start"
          >
            <span>Buka Dashboard HRIS</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Purchasing module quick entry card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <div className="inline-flex p-4 bg-amber-50 text-amber-600 rounded-2xl mb-6">
              <ShoppingBag size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Purchasing & Procurement</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Kelola alur pengadaan barang dan inventaris perusahaan. Dilengkapi dengan pengelolaan data vendor, katalog barang lengkap dengan pencatatan harga beli terakhir, form pengajuan Purchase Order dinamis, serta workflow approval yang terintegrasi dengan peran pengguna.
            </p>
          </div>
          <Link
            to="/purchasing"
            className="inline-flex items-center justify-center space-x-2 rounded-xl bg-amber-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-600/10 hover:bg-amber-500 transition-all duration-150 self-start"
          >
            <span>Buka Dashboard Purchasing</span>
            <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </div>
  );
}
