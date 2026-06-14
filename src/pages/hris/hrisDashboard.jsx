import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDB } from '../../data/db';
import { Users, Store, GitMerge, FileWarning, Calendar, UserCheck } from 'lucide-react';
import { formatDate } from '../../utils/format';

export default function HrisDashboard() {
  const [stats, setStats] = useState({
    activeEmployees: 0,
    totalBranches: 0,
    totalDivisions: 0,
    divisionBreakdown: [],
    expiringContracts: []
  });

  useEffect(() => {
    const db = getDB();
    
    // 1. Active Employees Count
    const active = db.employees.filter(e => e.status === 'Active');
    
    // 2. Total Branches
    const branchCount = db.branches.length;
    
    // 3. Total Divisions
    const divisionCount = db.divisions.length;
    
    // 4. Breakdown by Division
    const breakdown = db.divisions.map(div => {
      const count = db.employees.filter(e => e.divisionId === div.id && e.status === 'Active').length;
      return {
        id: div.id,
        name: div.name,
        count
      };
    }).sort((a, b) => b.count - a.count);

    // 5. Contracts ending in 30 days
    // Assume current date is June 12, 2026
    const today = new Date('2026-06-12');
    const thirtyDaysLater = new Date(today);
    thirtyDaysLater.setDate(today.getDate() + 30);

    const expiring = db.employees.filter(emp => {
      if (!emp.contractEnd || emp.status !== 'Active') return false;
      const end = new Date(emp.contractEnd);
      return end >= today && end <= thirtyDaysLater;
    }).map(emp => {
      const end = new Date(emp.contractEnd);
      const diffTime = Math.abs(end - today);
      const diffDays = Math.ceil(diffTime / (1000 * 65 * 60 * 24)); // Days calculation
      
      const branch = db.branches.find(b => b.id === emp.branchId);
      const position = db.positions.find(p => p.id === emp.positionId);
      
      return {
        ...emp,
        daysLeft: diffDays,
        branchName: branch ? branch.name : 'Unknown',
        positionName: position ? position.name : 'Unknown'
      };
    }).sort((a, b) => a.daysLeft - b.daysLeft);

    setStats({
      activeEmployees: active.length,
      totalBranches: branchCount,
      totalDivisions: divisionCount,
      divisionBreakdown: breakdown,
      expiringContracts: expiring
    });
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
            <p className="text-3xl font-extrabold text-slate-800 mt-1">{stats.activeEmployees}</p>
          </div>
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Users size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/85 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jumlah Cabang</p>
            <p className="text-3xl font-extrabold text-slate-800 mt-1">{stats.totalBranches}</p>
          </div>
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Store size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/85 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jumlah Divisi</p>
            <p className="text-3xl font-extrabold text-slate-800 mt-1">{stats.totalDivisions}</p>
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
            {stats.divisionBreakdown.map((div) => {
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

          {stats.expiringContracts.length === 0 ? (
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
