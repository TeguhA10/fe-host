import { apiClient } from '../lib/apiClient';
import { positionService } from './positionService';

const mapEmployee = (emp) => {
  if (!emp) return null;

  const levels = { 1: 'Director', 2: 'Manager', 3: 'Supervisor', 4: 'Staff' };
  const mappedLevel = levels[emp.position?.level] || emp.level || 'Staff';

  const divisionName = emp.position?.division || '-';

  return {
    id: emp.id,
    user_id: emp.user_id,
    name: emp.nama_lengkap,
    nama_lengkap: emp.nama_lengkap,
    email: emp.user?.email || emp.email || '',
    phone: emp.alamat || '',
    alamat: emp.alamat || '',
    branchId: emp.branch_id,
    branch_id: emp.branch_id,
    branchName: emp.branch?.name || '-',
    division: divisionName,
    positionId: emp.position_id,
    position_id: emp.position_id,
    positionName: emp.position?.name || '-',
    level: mappedLevel,
    status: emp.status || 'aktif',
    photo: emp.photo || "https://plus.unsplash.com/premium_vector-1682269287900-d96e9a6c188b?auto=format&fit=crop&w=256&h=256&q=80",
    contractStart: emp.tanggal_mulai_kontrak,
    contractEnd: emp.tanggal_akhir_kontrak,
    tanggal_gabung: emp.tanggal_gabung || emp.tanggal_mulai_kontrak,
    tanggal_mulai_kontrak: emp.tanggal_mulai_kontrak,
    tanggal_akhir_kontrak: emp.tanggal_akhir_kontrak,
    supervisorId: null
  };
};

const attachSupervisors = (employees, positions) => {
  return employees.map(emp => {
    const currentPos = positions.find(p => p.id === emp.positionId);
    const parentPosId = currentPos ? currentPos.parentId : null;
    let supervisorId = null;
    if (parentPosId) {
      const supervisor = employees.find(e => e.positionId === parentPosId);
      supervisorId = supervisor ? supervisor.id : null;
    }
    return { ...emp, supervisorId };
  });
};

export const employeeService = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.branchId) query.append('branch_id', params.branchId);

    if (params.status) {
      query.append('status', params.status);
    }
    if (params.division) query.append('division', params.division);

    if (params.level) {
      const levelMap = { 'Director': 1, 'Manager': 2, 'Supervisor': 3, 'Staff': 4 };
      query.append('level', levelMap[params.level] || params.level);
    }
    if (params.search) query.append('search', params.search);

    const res = await apiClient.get(`/api/employee/employees?${query.toString()}`);

    const rawEmployees = res.data || [];
    const meta = res.meta || { page: 1, limit: 10, total: rawEmployees.length, total_pages: 1 };

    const positions = await positionService.getAll();
    const mapped = rawEmployees.map(mapEmployee);
    const withSupervisors = attachSupervisors(mapped, positions);

    if (params.page || params.limit || params.search || params.branchId || params.status || params.division || params.level) {
      return {
        data: withSupervisors,
        meta: {
          page: meta.page,
          limit: meta.limit,
          total: meta.total,
          totalPages: meta.total_pages
        }
      };
    }
    return withSupervisors;
  },

  getById: async (id) => {
    const res = await apiClient.get(`/api/employee/employees/${id}`);
    const emp = res.data || res;
    const mappedSingle = mapEmployee(emp);

    // Calculate supervisorId via flat list
    const allEmps = await employeeService.getAll();
    const found = allEmps.find(e => e.id === parseInt(id));
    return found || mappedSingle;
  },

  getOrgTree: async (id) => {
    const res = await apiClient.get(`/api/employee/employees/${id}/org-tree`);
    return res.data || res;
  },

  create: async (employeeData) => {
    const payload = {
      user_id: parseInt(employeeData.user_id),
      nama_lengkap: employeeData.nama_lengkap,
      nomor_induk_karyawan: employeeData.nomor_induk_karyawan,
      alamat: employeeData.alamat,
      branch_id: parseInt(employeeData.branch_id),
      position_id: parseInt(employeeData.position_id),
      tanggal_gabung: employeeData.tanggal_gabung,
      tanggal_mulai_kontrak: employeeData.tanggal_mulai_kontrak,
      tanggal_akhir_kontrak: employeeData.tanggal_akhir_kontrak || null,
      status: employeeData.status
    };

    const res = await apiClient.post('/api/employee/employees', payload);
    return mapEmployee(res.data || res);
  },

  update: async (id, employeeData) => {
    const payload = {
      user_id: parseInt(employeeData.user_id),
      nama_lengkap: employeeData.nama_lengkap,
      nomor_induk_karyawan: employeeData.nomor_induk_karyawan,
      alamat: employeeData.alamat,
      branch_id: parseInt(employeeData.branch_id),
      position_id: parseInt(employeeData.position_id),
      tanggal_gabung: employeeData.tanggal_gabung,
      tanggal_mulai_kontrak: employeeData.tanggal_mulai_kontrak,
      tanggal_akhir_kontrak: employeeData.tanggal_akhir_kontrak || null,
      status: employeeData.status
    };

    const res = await apiClient.put(`/api/employee/employees/${id}`, payload);
    return mapEmployee(res.data || res);
  },

  delete: async (id) => {
    await apiClient.delete(`/api/employee/employees/${id}`);
    return true;
  }
};
