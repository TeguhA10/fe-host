import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { itemService } from '../../../services/itemService';
import { Search, Plus, Package, Trash2, Edit2, HelpCircle } from 'lucide-react';
import { formatRupiah } from '../../../utils/format';

const CATEGORIES = ['Konsumsi', 'Operasional', 'ATK', 'IT Gadgets', 'Furniture', 'Lain-lain'];

export default function ItemList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [meta, setMeta] = useState({ page: 1, limit: 5, total: 0, totalPages: 1 });

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await itemService.getAll({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        category: categoryFilter,
        status: statusFilter
      });
      // res is { data, meta }
      setItems(res.data || []);
      setMeta(res.meta || { page: 1, limit: itemsPerPage, total: 0, totalPages: 1 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch items when filters, limit, or pages change
  useEffect(() => {
    fetchItems();
  }, [currentPage, itemsPerPage, searchTerm, categoryFilter, statusFilter]);

  // Reset page to 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, statusFilter]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus catalog item "${name}"?`)) return;
    try {
      await itemService.delete(id);
      fetchItems();
    } catch (err) {
      alert(err.message || 'Gagal menghapus item.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Katalog Barang (Items)</h1>
          <p className="text-xs text-slate-505 mt-0.5">Kelola SKU produk pengadaan dan penetapan harga beli dasar</p>
        </div>
        <Link
          to="/purchasing/items/new"
          className="inline-flex items-center justify-center space-x-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/15 hover:bg-indigo-500 transition-all duration-150 self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>Tambah Item</span>
        </Link>
      </div>

      {/* Filter panel */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative md:col-span-3">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Cari item berdasarkan SKU / Nama..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-3 py-2 text-xs text-slate-700 placeholder-slate-400 focus:border-indigo-500 focus:bg-white"
            />
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-655 focus:border-indigo-500"
            >
              <option value="">Semua Kategori</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-655 focus:border-indigo-500"
            >
              <option value="">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Non-Aktif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-450">
            <HelpCircle size={40} className="text-slate-300 mb-3" />
            <p className="text-sm font-semibold">Barang tidak ditemukan</p>
            <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian Anda</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-4">SKU / Kode Item</th>
                    <th className="p-4">Nama Barang</th>
                    <th className="p-4">Kategori</th>
                    <th className="p-4">Default Vendor</th>
                    <th className="p-4 text-right">Harga Terakhir</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-650">
                  {items.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/40">
                      <td className="p-4 font-mono font-semibold text-slate-800">{item.sku}</td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2.5">
                          <Package size={15} className="text-slate-400 shrink-0" />
                          <span className="font-semibold text-slate-750">{item.name}</span>
                        </div>
                      </td>
                      <td className="p-4 font-medium text-slate-600">{item.category}</td>
                      <td className="p-4">{item.defaultVendorName}</td>
                      <td className="p-4 text-right font-semibold text-slate-800">{formatRupiah(item.lastPrice)}</td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${item.active
                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
                            : 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-650/10'
                          }`}>
                          {item.active ? 'Aktif' : 'Non-Aktif'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <Link
                            to={`/purchasing/items/${item.id}/edit`}
                            className="p-1.5 text-slate-450 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                            title="Ubah"
                          >
                            <Edit2 size={13} />
                          </Link>
                          <button
                            onClick={() => handleDelete(item.id, item.name)}
                            className="p-1.5 text-slate-450 hover:text-rose-650 hover:bg-rose-50 rounded-lg transition-all"
                            title="Hapus"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
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
                  dari <span className="font-semibold text-slate-700">{meta.total}</span> item
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
