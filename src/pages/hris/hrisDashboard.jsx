import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { employeeService } from '../../services/employeeService';
import { branchService } from '../../services/branchService';
import { Users, Store, GitMerge, FileWarning, Calendar, UserCheck } from 'lucide-react';
import { formatDate } from '../../utils/format';

const DIVISIONS = [
  'Executive Suite',
  'Human Resources',
  'Purchasing & Logistics',
  'Information Technology',
  'Finance & Accounting'
];

export default function HrisDashboard() {
  const [stats, setStats] = useState({
    activeEmployees: 0,
    totalBranches: 0,
    totalDivisions: 0,
    divisionBreakdown: [],
    expiringContracts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const [empRes, branchList] = await Promise.all([
          employeeService.getAll({ limit: 1000 }), // Load full list for aggregates
          branchService.getAll()
        ]);

        const empList = empRes.data || empRes || [];
        const active = empList.filter(e => e.status === 'aktif');
        const branchCount = branchList.length;
        const divisionCount = DIVISIONS.length;
        
        const breakdown = DIVISIONS.map((divName, idx) => {
          const count = active.filter(e => e.division.toLowerCase() === divName.toLowerCase()).length;
          return {
            id: idx + 1,
            name: divName,
            count
          };
        }).sort((a, b) => b.count - a.count);

        // Expiring contracts within 30 days
        const today = new Date('2026-06-12');
        const thirtyDaysLater = new Date(today);
        thirtyDaysLater.setDate(today.getDate() + 30);

        const expiring = active.filter(emp => {
          if (!emp.contractEnd) return false;
          const end = new Date(emp.contractEnd);
          return end >= today && end <= thirtyDaysLater;
        }).map(emp => {
          const end = new Date(emp.contractEnd);
          const diffTime = Math.abs(end - today);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Correct days calculation
          
          return {
            ...emp,
            daysLeft: diffDays
          };
        }).sort((a, b) => a.daysLeft - b.daysLeft);

        setStats({
          activeEmployees: active.length,
          totalBranches: branchCount,
          totalDivisions: divisionCount,
          divisionBreakdown: breakdown,
          expiringContracts: expiring
        });
      } catch (err) {
        console.error('Failed to load HRIS dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const totalActiveEmps = stats.activeEmployees;

  return (
    <div className="space-y-8">
      {/* Page Title & Headers */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard HRIS</h1>
        <p className="text-sm text-slate-500 mt-1">Status dan overview kepegawaian PT. Anyar Retail Group</p>
      </div>

      {/* Stats KPI Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/85 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Karyawan Aktif</p>
            <p className="text-3xl font-extrabold text-slate-800 mt-1">{loading ? '...' : stats.activeEmployees}</p>
          </div>
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Users size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/85 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jumlah Cabang</p>
            <p className="text-3xl font-extrabold text-slate-800 mt-1">{loading ? '...' : stats.totalBranches}</p>
          </div>
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Store size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/85 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jumlah Divisi</p>
            <p className="text-3xl font-extrabold text-slate-800 mt-1">{loading ? '...' : stats.totalDivisions}</p>
          </div>
          <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl">
            <GitMerge size={24} />
          </div>
        </div>
      </div>

      {/* Grid for division breakdown & expiring contracts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Division distribution */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-800 mb-6 flex items-center">
            <UserCheck className="mr-2 text-indigo-500" size={18} />
            <span>Karyawan per Divisi</span>
          </h2>
          
          <div className="space-y-4">
            {loading ? (
              <div className="text-xs text-slate-400">Memuat breakdown divisi...</div>
            ) : stats.divisionBreakdown.map((div) => {
              const percentage = totalActiveEmps > 0 ? (div.count / totalActiveEmps) * 100 : 0;
              return (
                <div key={div.id} className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-650">{div.name}</span>
                    <span className="text-slate-500">{div.count} Karyawan</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expiring contracts list */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-800 mb-6 flex items-center">
            <FileWarning className="mr-2 text-amber-500" size={18} />
            <span>Kontrak Berakhir (30 Hari)</span>
          </h2>

          {loading ? (
            <div className="text-xs text-slate-400">Memuat info kontrak...</div>
          ) : stats.expiringContracts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Calendar size={36} className="text-slate-300 mb-2" />
              <p className="text-xs font-medium">Tidak ada kontrak yang berakhir dalam 30 hari ke depan.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.expiringContracts.map((emp) => (
                <div 
                  key={emp.id} 
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all duration-150"
                >
                  <div className="flex items-center space-x-3">
                    <img 
                      src={emp.photo} 
                      alt={emp.name} 
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-indigo-50"
                    />
                    <div>
                      <Link 
                        to={`/hris/employees/${emp.id}`}
                        className="text-sm font-semibold text-slate-800 hover:text-indigo-650 hover:underline"
                      >
                        {emp.name}
                      </Link>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {emp.positionName} • {emp.branchName}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-bold ${
                      emp.daysLeft <= 15 
                        ? 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/10' 
                        : 'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-600/10'
                    }`}>
                      {emp.daysLeft} hari lagi
                    </span>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1">
                      {formatDate(emp.contractEnd)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
