// Central Dummy Database with localStorage persistence

const INITIAL_DB = {
  roles: [
    { id: 'superadmin', name: 'Super Admin', description: 'Access to all HRIS & Purchasing features, and user management.' },
    { id: 'admin_purchasing', name: 'Purchasing Admin', description: 'Review and approve/reject all purchase orders.' },
    { id: 'admin_cabang', name: 'Branch Admin', description: 'Manage branch employees and receive approved POs for the branch.' },
    { id: 'staff_purchasing', name: 'Purchasing Staff', description: 'Create POs and receive approved POs for designated branch.' }
  ],
  users: [
    { id: 1, email: "admin@example.com", password: "password123", name: "Super Admin", roleId: "superadmin", branchId: 1, active: true },
    { id: 2, email: "purchasing@example.com", password: "password123", name: "Rian Hidayat", roleId: "admin_purchasing", branchId: 1, active: true },
    { id: 3, email: "cabang.jkt@example.com", password: "password123", name: "Dewi Lestari", roleId: "admin_cabang", branchId: 2, active: true },
    { id: 4, email: "staff.jkt@example.com", password: "password123", name: "Fikri Ramadhan", roleId: "staff_purchasing", branchId: 2, active: true }
  ],
  branches: [
    { id: 1, name: "Head Office (Pusat)", code: "HO", parentId: null },
    { id: 2, name: "Branch Jakarta", code: "HO-JKT", parentId: 1 },
    { id: 3, name: "Branch Surabaya", code: "HO-SUB", parentId: 1 },
    { id: 4, name: "Branch Bandung", code: "HO-BDO", parentId: 1 },
    { id: 5, name: "Sub-office Tangerang", code: "JKT-TGR", parentId: 2 }
  ],
  divisions: [
    { id: 1, name: "Executive Suite" },
    { id: 2, name: "Human Resources" },
    { id: 3, name: "Purchasing & Logistics" },
    { id: 4, name: "Information Technology" },
    { id: 5, name: "Finance & Accounting" }
  ],
  positions: [
    { id: 1, name: "Chief Executive Officer", code: "CEO", parentId: null },
    { id: 2, name: "HR Director", code: "HRD", parentId: 1 },
    { id: 3, name: "Purchasing Manager", code: "PM", parentId: 1 },
    { id: 4, name: "IT Manager", code: "ITM", parentId: 1 },
    { id: 5, name: "HR Supervisor", code: "HRS", parentId: 2 },
    { id: 6, name: "Purchasing Supervisor", code: "PS", parentId: 3 },
    { id: 7, name: "HR Specialist", code: "HR-SPC", parentId: 5 },
    { id: 8, name: "Purchasing Staff", code: "P-STF", parentId: 6 }
  ],
  employees: [
    {
      id: 1,
      name: "Teguh Afriyando",
      email: "teguh.af@anyar.co.id",
      phone: "+628123456789",
      branchId: 1,
      divisionId: 4,
      positionId: 4,
      status: "Active",
      level: "Manager",
      photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&h=256&q=80",
      jobTitle: "IT Manager",
      contractStart: "2024-01-01",
      contractEnd: "2027-01-01",
      supervisorId: null
    },
    {
      id: 2,
      name: "Siti Rahma",
      email: "siti.rahma@anyar.co.id",
      phone: "+628155566677",
      branchId: 2,
      divisionId: 3,
      positionId: 8,
      status: "Active",
      level: "Staff",
      photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80",
      jobTitle: "Purchasing Staff",
      contractStart: "2025-07-01",
      contractEnd: "2026-06-30", // Ends in ~18 days relative to June 12, 2026
      supervisorId: 1
    },
    {
      id: 3,
      name: "Budi Santoso",
      email: "budi.s@anyar.co.id",
      phone: "+628133344455",
      branchId: 2,
      divisionId: 2,
      positionId: 5,
      status: "Active",
      level: "Supervisor",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80",
      jobTitle: "HR Supervisor",
      contractStart: "2025-05-15",
      contractEnd: "2026-07-10", // Ends in ~28 days
      supervisorId: 1
    },
    {
      id: 4,
      name: "Adi Wijaya",
      email: "adi.w@anyar.co.id",
      phone: "+628166677788",
      branchId: 3,
      divisionId: 2,
      positionId: 7,
      status: "Inactive",
      level: "Staff",
      photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80",
      jobTitle: "HR Specialist (Ex)",
      contractStart: "2024-02-01",
      contractEnd: "2025-02-01",
      supervisorId: 3
    },
    {
      id: 5,
      name: "Dewi Lestari",
      email: "dewi.l@anyar.co.id",
      phone: "+628177788899",
      branchId: 2,
      divisionId: 2,
      positionId: 2,
      status: "Active",
      level: "Manager",
      photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80",
      jobTitle: "HR Director (Jakarta Branch Representative)",
      contractStart: "2023-01-01",
      contractEnd: "2026-12-31",
      supervisorId: 1
    }
  ],
  vendors: [
    { id: 1, name: "PT. Global Stationary", code: "VND001", contact: "Andi (081223344)", email: "sales@globalstationary.co.id", address: "Jl. Sudirman No. 10, Jakarta", active: true },
    { id: 2, name: "CV. Makmur Jaya Abadi", code: "VND002", contact: "Heri (081998877)", email: "info@makmurjaya.com", address: "Jl. Industri Raya No. 45, Bandung", active: true },
    { id: 3, name: "PT. Sentosa Komputindo", code: "VND003", contact: "Lina (081334455)", email: "sales@sentosakomp.com", address: "Kuningan Epicentrum Lt. 5, Jakarta", active: true },
    { id: 4, name: "CV. Mandiri Jaya (Non-Aktif)", code: "VND004", contact: "Toni (081299887)", email: "toni@mandirijaya.com", address: "Jl. Kebon Jeruk No. 8, Jakarta", active: false }
  ],
  items: [
    { id: 1, name: "HVS Paper A4 80gr", sku: "ATK-A480G", category: "Stationary", active: true, defaultVendorId: 1, lastPrice: 48000 },
    { id: 2, name: "MacBook Pro M3 16GB/512GB", sku: "IT-MBP16", category: "IT Hardware", active: true, defaultVendorId: 3, lastPrice: 31000000 },
    { id: 3, name: "Ballpoint Standard AE7 Black", sku: "ATK-BP001", category: "Stationary", active: true, defaultVendorId: 1, lastPrice: 2500 },
    { id: 4, name: "Dell P2422H 24-inch Monitor", sku: "IT-MON24", category: "IT Hardware", active: true, defaultVendorId: 3, lastPrice: 2800000 },
    { id: 5, name: "Office Chair Ergonomic", sku: "FNT-CHR01", category: "Furniture", active: true, defaultVendorId: 2, lastPrice: 1250000 },
    { id: 6, name: "Old Desk Calculator", sku: "ATK-CAL01", category: "Stationary", active: false, defaultVendorId: 2, lastPrice: 150000 }
  ],
  purchaseOrders: [
    {
      id: 1,
      poNumber: "PO-2026-06-0001",
      branchId: 2,
      vendorId: 3,
      totalAmount: 64800000,
      status: "Approved",
      creatorId: 2,
      createdAt: "2026-06-01",
      timeline: [
        { status: "Draft", timestamp: "2026-06-01T09:00:00Z", note: "PO Created by Rian Hidayat" },
        { status: "Submitted", timestamp: "2026-06-01T10:30:00Z", note: "PO Submitted for approval" },
        { status: "Approved", timestamp: "2026-06-02T14:15:00Z", note: "Approved by Purchasing Manager" }
      ],
      items: [
        { id: 1, itemId: 2, qty: 2, price: 31000000, subtotal: 62000000 },
        { id: 2, itemId: 4, qty: 1, price: 2800000, subtotal: 2800000 }
      ]
    },
    {
      id: 2,
      poNumber: "PO-2026-06-0002",
      branchId: 2,
      vendorId: 1,
      totalAmount: 485000,
      status: "Draft",
      creatorId: 4,
      createdAt: "2026-06-10",
      timeline: [
        { status: "Draft", timestamp: "2026-06-10T11:00:00Z", note: "Draft PO created by Fikri Ramadhan" }
      ],
      items: [
        { id: 3, itemId: 1, qty: 10, price: 48000, subtotal: 480000 },
        { id: 4, itemId: 3, qty: 2, price: 2500, subtotal: 5000 }
      ]
    },
    {
      id: 3,
      poNumber: "PO-2026-06-0003",
      branchId: 3,
      vendorId: 2,
      totalAmount: 5000000,
      status: "Submitted",
      creatorId: 3,
      createdAt: "2026-06-11",
      timeline: [
        { status: "Draft", timestamp: "2026-06-11T08:00:00Z", note: "Draft PO created by Dewi Lestari" },
        { status: "Submitted", timestamp: "2026-06-11T09:00:00Z", note: "Submitted to Head Office" }
      ],
      items: [
        { id: 5, itemId: 5, qty: 4, price: 1250000, subtotal: 5000000 }
      ]
    },
    {
      id: 4,
      poNumber: "PO-2026-05-0001",
      branchId: 2,
      vendorId: 3,
      totalAmount: 33800000,
      status: "Received",
      creatorId: 4,
      createdAt: "2026-05-15",
      timeline: [
        { status: "Draft", timestamp: "2026-05-15T09:00:00Z", note: "Draft created" },
        { status: "Submitted", timestamp: "2026-05-15T10:00:00Z", note: "Submitted" },
        { status: "Approved", timestamp: "2026-05-16T11:00:00Z", note: "Approved" },
        { status: "Received", timestamp: "2026-05-20T14:00:00Z", note: "Items received in Jakarta Branch by Dewi Lestari" }
      ],
      items: [
        { id: 6, itemId: 2, qty: 1, price: 31000000, subtotal: 31000000 },
        { id: 7, itemId: 4, qty: 1, price: 2800000, subtotal: 2800000 }
      ]
    },
    {
      id: 5,
      poNumber: "PO-2026-06-0005",
      branchId: 4,
      vendorId: 1,
      totalAmount: 960000,
      status: "Rejected",
      creatorId: 3,
      createdAt: "2026-06-02",
      timeline: [
        { status: "Draft", timestamp: "2026-06-02T14:00:00Z", note: "Created draft" },
        { status: "Submitted", timestamp: "2026-06-02T15:00:00Z", note: "Submitted for review" },
        { status: "Rejected", timestamp: "2026-06-03T10:00:00Z", note: "Insufficient budget details, rejected by Rian Hidayat" }
      ],
      items: [
        { id: 8, itemId: 1, qty: 20, price: 48000, subtotal: 960000 }
      ]
    }
  ]
};

// Initialize Database in localStorage if it doesn't exist
const DB_KEY = 'erp_system_db';

export const getDB = () => {
  const data = localStorage.getItem(DB_KEY);
  if (!data) {
    localStorage.setItem(DB_KEY, JSON.stringify(INITIAL_DB));
    return INITIAL_DB;
  }
  return JSON.parse(data);
};

export const saveDB = (db) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

// Reset helper
export const resetDB = () => {
  localStorage.setItem(DB_KEY, JSON.stringify(INITIAL_DB));
  return INITIAL_DB;
};
