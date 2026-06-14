import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { employeeService } from '../../../services/employeeService';
import { ChevronLeft, Edit, Calendar, Mail, MapPin, Briefcase, ArrowUp, ArrowDown } from 'lucide-react';
import { formatDate } from '../../../utils/format';

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [orgTree, setOrgTree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        setLoading(true);
        setError('');
        const [empData, treeData] = await Promise.all([
          employeeService.getById(id),
          employeeService.getOrgTree(id)
        ]);
        setEmployee(empData);
        setOrgTree(treeData);
      } catch (err) {
        setError(err.message || 'Gagal memuat profil karyawan');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center max-w-lg mx-auto shadow-sm">
        <p className="text-sm font-semibold text-rose-600">{error || 'Karyawan tidak ditemukan.'}</p>
        <Link 
          to="/hris/employees" 
          className="mt-4 inline-flex items-center text-xs font-semibold text-indigo-600 hover:underline"
        >
          Kembali ke Daftar Karyawan
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Detail actions topbar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/hris/employees')}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-600 hover:text-indigo-655"
        >
          <ChevronLeft size={16} />
          <span>Kembali</span>
        </button>
        <Link
          to={`/hris/employees/${employee.id}/edit`}
          className="inline-flex items-center justify-center space-x-2 rounded-xl bg-white border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all duration-150"
        >
          <Edit size={14} className="text-slate-400" />
          <span>Ubah Profil</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Avatar & Basic Personal Info */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col items-center text-center">
          <img 
            src={employee.photo} 
            alt={employee.name} 
            className="h-32 w-32 rounded-full object-cover ring-4 ring-indigo-50 shadow-md"
          />
          <h2 className="text-lg font-bold text-slate-800 mt-4">{employee.name}</h2>
          <p className="text-xs font-medium text-slate-400">{employee.positionName}</p>
          
          <span className={`mt-3 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
            employee.status === 'aktif' 
              ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' 
              : 'bg-slate-100 text-slate-700 ring-slate-650/10'
          }`}>
            {employee.status === 'aktif' ? 'Aktif' : 'Non-Aktif'}
          </span>

          <div className="w-full border-t border-slate-150 mt-6 pt-6 space-y-4 text-left">
            <div className="flex items-center space-x-3 text-xs text-slate-600">
              <Mail className="text-slate-400 shrink-0" size={15} />
              <span className="truncate">{employee.email}</span>
            </div>
            <div className="flex items-start space-x-3 text-xs text-slate-600">
              <MapPin className="text-slate-400 shrink-0 mt-0.5" size={15} />
              <span className="leading-relaxed">{employee.alamat || '-'}</span>
            </div>
            <div className="flex items-center space-x-3 text-xs text-slate-605">
              <Briefcase className="text-slate-400 shrink-0" size={15} />
              <span>{employee.branchName}</span>
            </div>
          </div>
        </div>

        {/* Middle Column: Detailed Job & Contract details */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Job Details Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center">
              <Briefcase className="mr-2 text-indigo-500" size={16} />
              <span>Informasi Pekerjaan</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-400 font-semibold uppercase text-[10px]">Jabatan Struktural</p>
                <p className="font-semibold text-slate-850 mt-1">{employee.positionName}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold uppercase text-[10px]">Divisi / Departemen</p>
                <p className="font-semibold text-slate-850 mt-1">{employee.division}</p>
              </div>
              <div className="mt-2">
                <p className="text-slate-400 font-semibold uppercase text-[10px]">Level Posisi</p>
                <p className="font-semibold text-slate-850 mt-1">{employee.level}</p>
              </div>
              <div className="mt-2">
                <p className="text-slate-400 font-semibold uppercase text-[10px]">Cabang Penempatan</p>
                <p className="font-semibold text-slate-850 mt-1">{employee.branchName}</p>
              </div>
            </div>
          </div>

          {/* Contract Details Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center">
              <Calendar className="mr-2 text-indigo-500" size={16} />
              <span>Informasi Kontrak Kerja</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-400 font-semibold uppercase text-[10px]">Tanggal Mulai Kerja</p>
                <p className="font-semibold text-slate-850 mt-1">{formatDate(employee.contractStart)}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold uppercase text-[10px]">Tanggal Kontrak Berakhir</p>
                <p className="font-semibold text-slate-850 mt-1">{formatDate(employee.contractEnd)}</p>
              </div>
            </div>
          </div>

          {/* Org Structure / Hierarchy Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-6">
              Hierarki Organisasi (Organization Tree)
            </h3>

            <div className="space-y-6 relative pl-4 border-l border-indigo-100 ml-2">
              
              {/* 1. Supervisor Chain (Rantai Atasan) */}
              {orgTree && orgTree.supervisor_chain && orgTree.supervisor_chain.length > 0 && (
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 -ml-4 pl-4 flex items-center">
                    <ArrowUp size={12} className="mr-1.5 text-indigo-500" />
                    <span>Rantai Atasan (Supervisor Chain)</span>
                  </p>
                  
                  {orgTree.supervisor_chain.map((node, nodeIdx) => (
                    <div key={nodeIdx} className="relative mb-4">
                      {/* Connector Line/Bullet */}
                      <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border border-indigo-305 bg-white ring-4 ring-indigo-50"></span>
                      
                      <div className="bg-slate-50/60 border border-slate-100 rounded-xl p-3.5 space-y-2 max-w-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-indigo-650">{node.position?.name || 'Position'}</span>
                          <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
                            Level {node.position?.level || '-'} • {node.position?.division || '-'}
                          </span>
                        </div>
                        
                        {node.employees && node.employees.length > 0 ? (
                          <div className="space-y-2">
                            {node.employees.map((emp) => (
                              <Link
                                key={emp.id}
                                to={`/hris/employees/${emp.id}`}
                                className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100 hover:border-indigo-200 transition-all"
                              >
                                <div className="flex items-center space-x-2">
                                  <img 
                                    src={emp.photo || "https://plus.unsplash.com/premium_vector-1682269287900-d96e9a6c188b?auto=format&fit=crop&w=256&h=256&q=80"} 
                                    alt={emp.nama_lengkap} 
                                    className="h-6 w-6 rounded-full object-cover" 
                                  />
                                  <div>
                                    <p className="text-xs font-bold text-slate-800">{emp.nama_lengkap}</p>
                                    <p className="text-[9px] text-slate-550 font-semibold">NIK: {emp.nomor_induk_karyawan} • {emp.branch?.name || '-'}</p>
                                  </div>
                                </div>
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[8px] font-bold ${
                                  emp.status === 'aktif'
                                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
                                    : 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-650/10'
                                }`}>
                                  {emp.status === 'aktif' ? 'Aktif' : 'Non-Aktif'}
                                </span>
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[10px] text-slate-450 italic pl-1">(Posisi Kosong / Belum ada pejabat)</p>
                        )}
                      </div>
                      
                      {/* Arrow connecting to next node */}
                      <div className="flex justify-center w-full max-w-lg mt-2 text-indigo-300">
                        <ArrowDown size={14} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 2. Main Employee Node */}
              {orgTree && orgTree.employee && (
                <div className="relative my-6">
                  {/* Highlight Bullet */}
                  <span className="absolute -left-[23px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-indigo-600 bg-white ring-4 ring-indigo-100 animate-pulse"></span>
                  
                  <div className="bg-indigo-50/45 border-2 border-indigo-500/30 rounded-xl p-4 space-y-2 max-w-lg shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                        Karyawan Utama
                      </span>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold ${
                        orgTree.employee.status === 'aktif'
                          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-605/20'
                          : 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-650/10'
                      }`}>
                        {orgTree.employee.status === 'aktif' ? 'Aktif' : 'Non-Aktif'}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-3 mt-1.5">
                      <img 
                        src={orgTree.employee.photo || "https://plus.unsplash.com/premium_vector-1682269287900-d96e9a6c188b?auto=format&fit=crop&w=256&h=256&q=80"} 
                        alt={orgTree.employee.nama_lengkap} 
                        className="h-9 w-9 rounded-full object-cover ring-2 ring-indigo-200" 
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{orgTree.employee.nama_lengkap}</h4>
                        <p className="text-[10px] text-slate-500 font-bold">NIK: {orgTree.employee.nomor_induk_karyawan}</p>
                        <p className="text-[10px] text-slate-505 font-semibold mt-0.5">
                          {orgTree.employee.position?.name || '-'} • {orgTree.employee.branch?.name || '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Direct Reports (Bawahan Langsung) */}
              <div className="space-y-4 mt-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 -ml-4 pl-4 flex items-center">
                  <ArrowDown size={12} className="mr-1.5 text-indigo-500" />
                  <span>Bawahan Langsung (Direct Reports)</span>
                </p>

                {orgTree && orgTree.direct_reports && orgTree.direct_reports.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
                    {orgTree.direct_reports.map((dr) => (
                      <div key={dr.id} className="relative">
                        {/* Connector Bullet */}
                        <span className="absolute -left-[20px] top-1.5 h-2 w-2 rounded-full border border-indigo-200 bg-white ring-4 ring-indigo-50"></span>
                        
                        <Link
                          to={`/hris/employees/${dr.id}`}
                          className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-indigo-200 bg-slate-50/30 hover:bg-slate-50 transition-all"
                        >
                          <div className="flex items-center space-x-2">
                            <img 
                              src={dr.photo || "https://plus.unsplash.com/premium_vector-1682269287900-d96e9a6c188b?auto=format&fit=crop&w=256&h=256&q=80"} 
                              alt={dr.nama_lengkap} 
                              className="h-7 w-7 rounded-full object-cover" 
                            />
                            <div>
                              <p className="text-xs font-bold text-slate-800">{dr.nama_lengkap}</p>
                              <p className="text-[9px] text-slate-500 font-semibold">NIK: {dr.nomor_induk_karyawan}</p>
                              <p className="text-[9px] text-slate-450 font-bold mt-0.5">{dr.position?.name || '-'} • {dr.branch?.name || '-'}</p>
                            </div>
                          </div>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[8px] font-bold ${
                            dr.status === 'aktif'
                              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
                              : 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-650/10'
                          }`}>
                            {dr.status === 'aktif' ? 'Aktif' : 'Non-Aktif'}
                          </span>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="relative pl-1">
                    <span className="absolute -left-[20px] top-1.5 h-2 w-2 rounded-full border border-indigo-200 bg-white ring-4 ring-indigo-50"></span>
                    <p className="text-xs text-slate-400 font-medium italic">Karyawan ini tidak memiliki bawahan langsung.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
