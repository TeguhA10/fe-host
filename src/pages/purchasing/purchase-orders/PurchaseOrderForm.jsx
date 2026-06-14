import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { purchaseOrderService } from '../../../services/purchaseOrderService';
import { branchService } from '../../../services/branchService';
import { vendorService } from '../../../services/vendorService';
import { itemService } from '../../../services/itemService';
import { ChevronLeft, Plus, Trash2, Save, Loader, AlertCircle } from 'lucide-react';
import { formatRupiah } from '../../../utils/format';

export default function PurchaseOrderForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditMode = !!id;

  const [branches, setBranches] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // PO Header Form State
  const [branchId, setBranchId] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [catatan, setCatatan] = useState('');

  // Dynamic line items State
  const [poLines, setPoLines] = useState([{ itemId: '', qty: 1, price: 0, subtotal: 0 }]);

  useEffect(() => {
    const loadDependencies = async () => {
      try {
        setLoading(true);
        setError('');

        const bData = await branchService.getAll();
        const vData = await vendorService.getAll();
        const iData = await itemService.getAll();

        setBranches(bData);
        setVendors(vData.filter(v => v.active)); // Load active vendors only
        setItems(iData.filter(item => item.active)); // Load active catalog items only

        // Set default branch mapping to user's branch if user is not superadmin
        if (user && user.roleId !== 'superadmin') {
          setBranchId(user.branchId.toString());
        }

        if (isEditMode) {
          const po = await purchaseOrderService.getById(id);
          if (po.status !== 'Draft') {
            throw new Error('Hanya Purchase Order Draft yang dapat diubah.');
          }
          setBranchId(po.branchId.toString());
          setVendorId(po.vendorId.toString());
          setCatatan(po.catatan || '');

          const lines = po.items.map(poi => ({
            itemId: poi.itemId.toString(),
            qty: poi.qty,
            price: poi.price,
            subtotal: poi.subtotal
          }));
          setPoLines(lines);
        }
      } catch (err) {
        setError(err.message || 'Gagal memuat form Purchase Order.');
      } finally {
        setLoading(false);
      }
    };
    loadDependencies();
  }, [id, isEditMode, user]);

  const handleAddLine = () => {
    setPoLines(prev => [...prev, { itemId: '', qty: 1, price: 0, subtotal: 0 }]);
  };

  const handleRemoveLine = (index) => {
    if (poLines.length === 1) {
      setError('Purchase Order harus memiliki minimal 1 baris item.');
      return;
    }
    setPoLines(prev => prev.filter((_, i) => i !== index));
  };

  const handleLineChange = (index, field, value) => {
    setError('');
    const updatedLines = [...poLines];

    if (field === 'itemId') {
      updatedLines[index].itemId = value;
      // Pre-fill last price from item catalog
      const itemDetails = items.find(item => item.id === parseInt(value));
      if (itemDetails) {
        updatedLines[index].price = itemDetails.lastPrice;
      }
    } else if (field === 'qty') {
      updatedLines[index].qty = Math.max(1, parseInt(value) || 0);
    } else if (field === 'price') {
      updatedLines[index].price = Math.max(0, parseFloat(value) || 0);
    }

    // Recalculate row subtotal
    updatedLines[index].subtotal = updatedLines[index].qty * updatedLines[index].price;
    setPoLines(updatedLines);
  };

  // Filter items that belong to the default vendor (optional filter suggestion helper)
  const getFilteredItemsForVendor = () => {
    if (!vendorId) return items;
    return items.filter(i => i.defaultVendorId === parseInt(vendorId));
  };

  const calculateGrandTotal = () => {
    return poLines.reduce((sum, line) => sum + line.subtotal, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!branchId) return setError('Pilih Cabang Peminta terlebih dahulu.');
    if (!vendorId) return setError('Pilih Vendor Supplier terlebih dahulu.');

    // Check lines validation
    for (let i = 0; i < poLines.length; i++) {
      const line = poLines[i];
      if (!line.itemId) return setError(`Baris ke-${i + 1}: Pilih item barang terlebih dahulu.`);
      if (line.qty <= 0) return setError(`Baris ke-${i + 1}: Kuantitas barang minimal 1.`);
      if (line.price <= 0) return setError(`Baris ke-${i + 1}: Harga barang harus lebih dari Rp 0.`);
    }

    setSubmitting(true);
    try {
      const payload = {
        branchId,
        vendorId,
        catatan,
        items: poLines
      };

      if (isEditMode) {
        await purchaseOrderService.update(id, payload, user.id);
        navigate(`/purchasing/purchase-orders/${id}`);
      } else {
        const po = await purchaseOrderService.create(payload, user.id);
        navigate(`/purchasing/purchase-orders/${po.id}`);
      }
    } catch (err) {
      setError(err.message || 'Gagal menyimpan Purchase Order.');
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

  const grandTotal = calculateGrandTotal();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header navigasi */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(isEditMode ? `/purchasing/purchase-orders/${id}` : '/purchasing/purchase-orders')}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-655 hover:text-indigo-650"
        >
          <ChevronLeft size={16} />
          <span>Batal</span>
        </button>
        <h1 className="text-lg font-bold text-slate-800">
          {isEditMode ? `Ubah Purchase Order #${id}` : 'Buat Purchase Order Baru'}
        </h1>
      </div>

      {error && (
        <div className="flex items-start space-x-2 rounded-xl bg-rose-50 border border-rose-100 p-3.5 text-xs text-rose-600">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span className="font-semibold leading-relaxed">{error}</span>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">

          {/* Header Metadata fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-b border-slate-100 pb-6">
            {/* Branch Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Cabang Peminta</label>
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                disabled={user?.roleId !== 'superadmin'} // Restrict to user's branch
                className="block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-705 focus:border-indigo-500 disabled:bg-slate-50 disabled:opacity-75"
              >
                <option value="">Pilih Cabang</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            {/* Vendor Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Vendor Supplier</label>
              <select
                value={vendorId}
                onChange={(e) => {
                  setVendorId(e.target.value);
                  // Optional reset lines if vendor changes
                  setPoLines([{ itemId: '', qty: 1, price: 0, subtotal: 0 }]);
                }}
                className="block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-705 focus:border-indigo-500"
              >
                <option value="">Pilih Vendor Supplier</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>{v.name} ({v.code})</option>
                ))}
              </select>
            </div>

            {/* PO Notes */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-2">Catatan / Keterangan PO (Opsional)</label>
              <textarea
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Keterangan tambahan mengenai PO, instruksi pengiriman, dll..."
                rows={3}
                className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:ring-indigo-500 bg-white placeholder-slate-400"
              />
            </div>
          </div>

          {/* Dynamic Order items list */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Item Barang Purchase Order</h3>
              <button
                type="button"
                onClick={handleAddLine}
                disabled={!vendorId}
                className="inline-flex items-center justify-center space-x-1 px-3 py-2 rounded-lg border border-slate-200 hover:border-indigo-200 text-[10px] font-bold text-slate-600 hover:text-indigo-650 disabled:opacity-50 transition-colors"
              >
                <Plus size={12} />
                <span>Tambah Baris</span>
              </button>
            </div>

            {!vendorId ? (
              <div className="text-center py-8 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium text-slate-450">
                Pilih vendor supplier terlebih dahulu untuk mulai menambahkan barang.
              </div>
            ) : (
              <div className="space-y-3">
                {poLines.map((line, index) => (
                  <div key={index} className="flex flex-col md:flex-row md:items-end gap-3 p-3 bg-slate-50/50 rounded-xl border border-slate-150">

                    {/* Item dropdown selection */}
                    <div className="flex-1 min-w-0">
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1.5 md:hidden">Pilih Barang</label>
                      <select
                        value={line.itemId}
                        onChange={(e) => handleLineChange(index, 'itemId', e.target.value)}
                        className="block w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs text-slate-705 focus:bg-white"
                      >
                        <option value="">Pilih Item Barang</option>
                        {getFilteredItemsForVendor().map(item => (
                          <option key={item.id} value={item.id}>
                            [{item.sku}] {item.name} - {formatRupiah(item.lastPrice)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quantity */}
                    <div className="w-full md:w-24 shrink-0">
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1.5">Qty</label>
                      <input
                        type="number"
                        value={line.qty}
                        onChange={(e) => handleLineChange(index, 'qty', e.target.value)}
                        className="block w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-850 focus:bg-white"
                      />
                    </div>

                    {/* Unit Price */}
                    <div className="w-full md:w-40 shrink-0">
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1.5">Harga Satuan (Rp)</label>
                      <input
                        type="number"
                        value={line.price}
                        onChange={(e) => handleLineChange(index, 'price', e.target.value)}
                        className="block w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-850 focus:bg-white"
                      />
                    </div>

                    {/* Subtotal preview */}
                    <div className="w-full md:w-40 shrink-0">
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1.5">Subtotal</label>
                      <div className="p-2 bg-slate-100/80 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 text-right">
                        {formatRupiah(line.subtotal)}
                      </div>
                    </div>

                    {/* Remove row button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveLine(index)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 self-end md:self-auto"
                      title="Hapus Baris"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Grand total calculations */}
          <div className="flex justify-end border-t border-slate-100 pt-6">
            <div className="w-full md:w-80 text-right space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Nilai Purchase Order</span>
              <p className="text-3xl font-extrabold text-slate-800">{formatRupiah(grandTotal)}</p>
            </div>
          </div>
        </div>

        {/* Action triggers */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate(isEditMode ? `/purchasing/purchase-orders/${id}` : '/purchasing/purchase-orders')}
            disabled={submitting}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-semibold text-slate-655 hover:bg-slate-50 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center space-x-2 rounded-xl bg-indigo-500 px-5 py-3 text-xs font-semibold text-white shadow-lg shadow-indigo-600/15 hover:bg-indigo-500 disabled:opacity-50 transition-all duration-150"
          >
            {submitting ? (
              <>
                <Loader className="animate-spin" size={14} />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>Simpan Draft PO</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
