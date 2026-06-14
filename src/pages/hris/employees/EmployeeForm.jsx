import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { employeeService } from '../../../services/employeeService';
import { branchService } from '../../../services/branchService';
import { positionService } from '../../../services/positionService';
import { getDB } from '../../../data/db';
import { ChevronLeft, Save, Loader, AlertCircle } from 'lucide-react';

export default function EmployeeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    branchId: '',
    divisionId: '',
    positionId: '',
    level: 'Staff',
    status: 'Active',
    contractStart: '',
    contractEnd: '',
    supervisorId: ''
  });

  const [branches, setBranches] = useState([]);
  const [positions, setPositions] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadFormDependencies = async () => {
      try {
        setLoading(true);
        setError('');
        
        const db = getDB();
        setBranches(db.branches || []);
        setPositions(db.positions || []);
        setDivisions(db.divisions || []);
        
        // Load eligible supervisors (exclude self if in edit mode)
        const allEmps = db.employees || [];
        const filteredSups = isEditMode 
          ? allEmps.filter(emp => emp.id !== parseInt(id)) 
          : allEmps;
        setSupervisors(filteredSups);

        if (isEditMode) {
          const currentEmp = await employeeService.getById(id);
          setFormData({
            name: currentEmp.name || '',
            email: currentEmp.email || '',
            phone: currentEmp.phone || '',
            branchId: currentEmp.branchId || '',
            divisionId: currentEmp.divisionId || '',
            positionId: currentEmp.positionId || '',
            level: currentEmp.level || 'Staff',
            status: currentEmp.status || 'Active',
            contractStart: currentEmp.contractStart || '',
            contractEnd: currentEmp.contractEnd || '',
            supervisorId: currentEmp.supervisorId || ''
          });
        }
      } catch (err) {
        setError(err.message || 'Gagal memuat kelayakan form.');
      } finally {
        setLoading(false);
      }
    };

    loadFormDependencies();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Input Validations
    if (!formData.name.trim()) return setError('Nama lengkap karyawan wajib diisi.');
    if (!formData.email.trim()) return setError('Email korporat wajib diisi.');
    if (!formData.phone.trim()) return setError('Nomor telepon/HP wajib diisi.');
    if (!formData.branchId) return setError('Cabang penempatan wajib dipilih.');
    if (!formData.divisionId) return setError('Divisi kerja wajib dipilih.');
    if (!formData.positionId) return setError('Jabatan struktural wajib dipilih.');
    if (!formData.contractStart) return setError('Tanggal awal kontrak wajib diisi.');
    if (!formData.contractEnd) return setError('Tanggal akhir kontrak wajib diisi.');
    
    // Check contract dates logical order
    if (new Date(formData.contractStart) > new Date(formData.contractEnd)) {
      return setError('Tanggal awal kontrak tidak boleh melebihi tanggal akhir kontrak.');
    }

    setSubmitting(true);
    try {
      if (isEditMode) {
        await employeeService.update(id, formData);
      } else {
        await employeeService.create(formData);
      }
      navigate('/hris/employees');
    } catch (err) {
      setError(err.message || 'Gagal menyimpan data karyawan.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  const levelOptions = ['Director', 'Manager', 'Supervisor', 'Staff'];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Form Action Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(isEditMode ? `/hris/employees/${id}` : '/hris/employees')}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-650 hover:text-indigo-650"
        >
          <ChevronLeft size={16} />
          <span>Batal</span>
        </button>
        <h1 className="text-lg font-bold text-slate-800">
          {isEditMode ? 'Ubah Data Karyawan' : 'Tambah Karyawan Baru'}
        </h1>
      </div>

      {/* Form Card Layout */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        {error && (
          <div className="mb-6 flex items-start space-x-2 rounded-xl bg-rose-50 border border-rose-100 p-3.5 text-xs text-rose-600">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span className="font-semibold leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Full Name */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-2">Nama Lengkap</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="cth: Teguh Afriyando"
                className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-850 focus:border-indigo-500 transition-all-fast"
              />
            </div>

            {/* Corporate Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Email Korporat</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="cth: nama@anyar.co.id"
                className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-850 focus:border-indigo-500 transition-all-fast"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Nomor Telepon / HP</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="cth: +62812345678"
                className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-850 focus:border-indigo-500 transition-all-fast"
              />
            </div>

            {/* Branch Placement */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Cabang Penempatan</label>
              <select
                name="branchId"
                value={formData.branchId}
                onChange={handleChange}
                className="block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-700 focus:border-indigo-500"
              >
                <option value="">Pilih Cabang</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            {/* Division Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Divisi</label>
              <select
                name="divisionId"
                value={formData.divisionId}
                onChange={handleChange}
                className="block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-700 focus:border-indigo-500"
              >
                <option value="">Pilih Divisi</option>
                {divisions.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Position Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Jabatan Struktural</label>
              <select
                name="positionId"
                value={formData.positionId}
                onChange={handleChange}
                className="block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-700 focus:border-indigo-500"
              >
                <option value="">Pilih Jabatan</option>
                {positions.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                ))}
              </select>
            </div>

            {/* Position Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Level Jabatan</label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-700 focus:border-indigo-500"
              >
                {levelOptions.map(lvl => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>

            {/* Supervisor (Line Manager) */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Atasan Langsung (Supervisor)</label>
              <select
                name="supervisorId"
                value={formData.supervisorId}
                onChange={handleChange}
                className="block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-700 focus:border-indigo-500"
              >
                <option value="">Tidak Ada Atasan (CEO / Top Level)</option>
                {supervisors.map(sup => (
                  <option key={sup.id} value={sup.id}>{sup.name} - {sup.jobTitle}</option>
                ))}
              </select>
            </div>

            {/* Account Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Status Aktif</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-700 focus:border-indigo-500"
              >
                <option value="Active">Aktif</option>
                <option value="Inactive">Non-Aktif</option>
              </select>
            </div>

            {/* Contract Dates */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Mulai Kontrak Kerja</label>
              <input
                type="date"
                name="contractStart"
                value={formData.contractStart}
                onChange={handleChange}
                className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-850 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Selesai Kontrak Kerja</label>
              <input
                type="date"
                name="contractEnd"
                value={formData.contractEnd}
                onChange={handleChange}
                className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-850 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate(isEditMode ? `/hris/employees/${id}` : '/hris/employees')}
              disabled={submitting}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center space-x-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/15 hover:bg-indigo-500 disabled:opacity-50 transition-all duration-150"
            >
              {submitting ? (
                <>
                  <Loader className="animate-spin" size={14} />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save size={14} />
                  <span>Simpan Karyawan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
