import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { employeeService } from '../../../services/employeeService';
import { getDB } from '../../../data/db';
import { ChevronLeft, Edit, Calendar, Mail, Phone, MapPin, Briefcase, ArrowUp, ArrowDown } from 'lucide-react';
import { formatDate } from '../../../utils/format';

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [supervisor, setSupervisor] = useState(null);
  const [subordinates, setSubordinates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await employeeService.getById(id);
        setEmployee(data);

        // Fetch related hierarchy
        const db = getDB();
        
        // Supervisor details
        if (data.supervisorId) {
          const sup = db.employees.find(emp => emp.id === data.supervisorId);
          setSupervisor(sup || null);
        } else {
          setSupervisor(null);
        }

        // Subordinates list
        const subs = db.employees.filter(emp => emp.supervisorId === data.id);
        setSubordinates(subs);

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

  const db = getDB();
  const getBranchName = (id) => db.branches.find(b => b.id === id)?.name || '-';
  const getDivisionName = (id) => db.divisions.find(d => d.id === id)?.name || '-';
  const getPositionName = (id) => db.positions.find(p => p.id === id)?.name || '-';

  return (
    <div className="space-y-6">
      {/* Detail actions topbar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/hris/employees')}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-600 hover:text-indigo-650"
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
          <p className="text-xs font-medium text-slate-400">{getPositionName(employee.positionId)}</p>
          
          <span className={`mt-3 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
            employee.status === 'Active' 
              ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' 
              : 'bg-slate-100 text-slate-700 ring-slate-650/10'
          }`}>
            {employee.status === 'Active' ? 'Aktif' : 'Non-Aktif'}
          </span>

          <div className="w-full border-t border-slate-150 mt-6 pt-6 space-y-4 text-left">
            <div className="flex items-center space-x-3 text-xs text-slate-600">
              <Mail className="text-slate-400 shrink-0" size={15} />
              <span className="truncate">{employee.email}</span>
            </div>
            <div className="flex items-center space-x-3 text-xs text-slate-600">
              <Phone className="text-slate-400 shrink-0" size={15} />
              <span>{employee.phone}</span>
            </div>
            <div className="flex items-center space-x-3 text-xs text-slate-605">
              <MapPin className="text-slate-400 shrink-0" size={15} />
              <span>{getBranchName(employee.branchId)}</span>
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
                <p className="font-semibold text-slate-850 mt-1">{getPositionName(employee.positionId)}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold uppercase text-[10px]">Divisi / Departemen</p>
                <p className="font-semibold text-slate-850 mt-1">{getDivisionName(employee.divisionId)}</p>
              </div>
              <div className="mt-2">
                <p className="text-slate-400 font-semibold uppercase text-[10px]">Level Posisi</p>
                <p className="font-semibold text-slate-850 mt-1">{employee.level}</p>
              </div>
              <div className="mt-2">
                <p className="text-slate-400 font-semibold uppercase text-[10px]">Cabang Penempatan</p>
                <p className="font-semibold text-slate-850 mt-1">{getBranchName(employee.branchId)}</p>
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
              Hierarki Organisasi
            </h3>

            <div className="space-y-6">
              {/* Supervisor node */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center">
                  <ArrowUp size={12} className="mr-1.5 text-indigo-500" />
                  <span>Atasan Langsung (Supervisor)</span>
                </p>
                {supervisor ? (
                  <Link 
                    to={`/hris/employees/${supervisor.id}`}
                    className="flex items-center space-x-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/40 hover:bg-slate-50 transition-all max-w-md"
                  >
                    <img src={supervisor.photo} alt={supervisor.name} className="h-8 w-8 rounded-full object-cover" />
                    <div>
                      <p className="text-xs font-semibold text-slate-800">{supervisor.name}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{getPositionName(supervisor.positionId)}</p>
                    </div>
                  </Link>
                ) : (
                  <p className="text-xs text-slate-400 font-medium italic">Karyawan ini tidak memiliki atasan langsung (CEO / Top Level).</p>
                )}
              </div>

              {/* Subordinates nodes */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center">
                  <ArrowDown size={12} className="mr-1.5 text-indigo-500" />
                  <span>Bawahan Langsung (Subordinates)</span>
                </p>
                {subordinates.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {subordinates.map(sub => (
                      <Link 
                        key={sub.id}
                        to={`/hris/employees/${sub.id}`}
                        className="flex items-center space-x-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/40 hover:bg-slate-50 transition-all"
                      >
                        <img src={sub.photo} alt={sub.name} className="h-8 w-8 rounded-full object-cover" />
                        <div>
                          <p className="text-xs font-semibold text-slate-800">{sub.name}</p>
                          <p className="text-[10px] text-slate-500 font-medium">{getPositionName(sub.positionId)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 font-medium italic">Karyawan ini tidak memiliki bawahan langsung.</p>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
