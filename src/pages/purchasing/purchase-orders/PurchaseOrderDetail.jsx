import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { purchaseOrderService } from '../../../services/purchaseOrderService';
import { ChevronLeft, Edit2, Play, CheckCircle2, XCircle, PackageOpen, Ban, Loader, AlertCircle } from 'lucide-react';
import { formatRupiah, formatDate, formatDateTime } from '../../../utils/format';
import StatusBadge from '../../../components/badges/StatusBadge';

export default function PurchaseOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [po, setPo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  // Reject dialog states
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const fetchPoDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await purchaseOrderService.getById(id);
      setPo(data);
    } catch (err) {
      setError(err.message || 'Gagal memuat detail Purchase Order.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoDetails();
  }, [id]);

  const handleAction = async (actionType) => {
    if (!window.confirm(`Apakah Anda yakin ingin mengeksekusi tindakan ${actionType} untuk PO ini?`)) return;
    
    setActionLoading(true);
    setError('');
    try {
      if (actionType === 'Submit') {
        await purchaseOrderService.submit(id, user.id);
      } else if (actionType === 'Approve') {
        await purchaseOrderService.approve(id, user.id);
      } else if (actionType === 'Receive') {
        await purchaseOrderService.receive(id, user.id);
      } else if (actionType === 'Cancel') {
        await purchaseOrderService.cancel(id, user.id);
      }
      fetchPoDetails();
    } catch (err) {
      setError(err.message || `Gagal mengeksekusi tindakan ${actionType}.`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      alert('Alasan penolakan PO wajib diisi.');
      return;
    }

    setActionLoading(true);
    setError('');
    try {
      await purchaseOrderService.reject(id, user.id, rejectReason);
      setIsRejectOpen(false);
      setRejectReason('');
      fetchPoDetails();
    } catch (err) {
      setError(err.message || 'Gagal menolak Purchase Order.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !po) {
    return (
      <div className="bg-white rounded-2xl border border-slate-205 p-8 text-center max-w-lg mx-auto shadow-sm">
        <p className="text-sm font-semibold text-rose-650">{error || 'Purchase Order tidak ditemukan.'}</p>
        <Link 
          to="/purchasing/purchase-orders" 
          className="mt-4 inline-flex items-center text-xs font-semibold text-indigo-650 hover:underline"
        >
          Kembali ke Daftar PO
        </Link>
      </div>
    );
  }

  // Permission / Role Check Helpers
  const isCreator = user?.id === po.creatorId;
  const isSuperadmin = user?.roleId === 'superadmin';
  const isPurchasingAdmin = user?.roleId === 'admin_purchasing';
  const isBranchAdmin = user?.roleId === 'admin_cabang' && user?.branchId === po.branchId;
  const isBranchStaff = user?.roleId === 'staff_purchasing' && user?.branchId === po.branchId;

  return (
    <div className="space-y-6">
      {/* Detail Action Navigation Topbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <button
          onClick={() => navigate('/purchasing/purchase-orders')}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-655 hover:text-indigo-650 self-start"
        >
          <ChevronLeft size={16} />
          <span>Kembali ke Daftar PO</span>
        </button>
        
        {/* Dynamic Contextual Action Buttons */}
        {!actionLoading && (
          <div className="flex flex-wrap gap-2">
            
            {/* 1. DRAFT ACTIONS */}
            {po.status === 'Draft' && (isCreator || isSuperadmin) && (
              <>
                <Link
                  to={`/purchasing/purchase-orders/${po.id}/edit`}
                  className="inline-flex items-center justify-center space-x-1.5 rounded-xl bg-white border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                >
                  <Edit2 size={13} className="text-slate-400" />
                  <span>Ubah Items</span>
                </Link>
                <button
                  onClick={() => handleAction('Submit')}
                  className="inline-flex items-center justify-center space-x-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/10 transition-all"
                >
                  <Play size={13} />
                  <span>Ajukan (Submit)</span>
                </button>
                <button
                  onClick={() => handleAction('Cancel')}
                  className="inline-flex items-center justify-center space-x-1.5 rounded-xl bg-rose-50 border border-rose-100 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100/50 transition-all"
                >
                  <Ban size={13} />
                  <span>Batalkan PO</span>
                </button>
              </>
            )}

            {/* 2. SUBMITTED ACTIONS */}
            {po.status === 'Submitted' && (
              <>
                {/* Approver role actions */}
                {(isPurchasingAdmin || isSuperadmin) && (
                  <>
                    <button
                      onClick={() => handleAction('Approve')}
                      className="inline-flex items-center justify-center space-x-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/10 transition-all"
                    >
                      <CheckCircle2 size={13} />
                      <span>Setujui (Approve)</span>
                    </button>
                    <button
                      onClick={() => setIsRejectOpen(true)}
                      className="inline-flex items-center justify-center space-x-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 shadow-md shadow-rose-600/10 transition-all"
                    >
                      <XCircle size={13} />
                      <span>Tolak (Reject)</span>
                    </button>
                  </>
                )}
                {/* Creator cancellation action */}
                {(isCreator || isSuperadmin) && (
                  <button
                    onClick={() => handleAction('Cancel')}
                    className="inline-flex items-center justify-center space-x-1.5 rounded-xl bg-rose-50 border border-rose-100 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100/50 transition-all"
                  >
                    <Ban size={13} />
                    <span>Batalkan PO</span>
                  </button>
                )}
              </>
            )}

            {/* 3. APPROVED ACTIONS */}
            {po.status === 'Approved' && (isBranchAdmin || isBranchStaff || isSuperadmin) && (
              <button
                onClick={() => handleAction('Receive')}
                className="inline-flex items-center justify-center space-x-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-555 shadow-md shadow-teal-600/10 transition-all"
              >
                <PackageOpen size={14} />
                <span>Terima Barang (Receive)</span>
              </button>
            )}

          </div>
        )}

        {actionLoading && (
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <Loader className="animate-spin" size={14} />
            <span>Mengeksekusi tindakan...</span>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start space-x-2 rounded-xl bg-rose-50 border border-rose-100 p-3.5 text-xs text-rose-600">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span className="font-semibold leading-relaxed">{error}</span>
        </div>
      )}

      {/* Grid: PO Details Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-all">
        
        {/* Left Side: Metadata summary and supplier Cards */}
        <div className="space-y-6">
          {/* Header Metadata Info */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Informasi Dokumen PO</h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-450">Nomor PO:</span>
                <span className="font-mono font-bold text-slate-805">{po.poNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-450">Tanggal Diajukan:</span>
                <span className="font-semibold text-slate-700">{formatDate(po.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-450">Cabang Peminta:</span>
                <span className="font-semibold text-slate-700">{po.branchDetails?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-450">Diajukan Oleh:</span>
                <span className="font-semibold text-slate-700">{po.creatorDetails?.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-455">Status PO:</span>
                <StatusBadge status={po.status} />
              </div>
            </div>
          </div>

          {/* Supplier details card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Detail Vendor Supplier</h3>
            
            <div className="text-xs space-y-2">
              <p className="font-bold text-slate-800 text-sm">{po.vendorDetails?.name}</p>
              <p className="font-mono text-slate-400 text-[10px] uppercase">{po.vendorDetails?.code}</p>
              
              <div className="border-t border-slate-100 pt-2.5 mt-2.5 space-y-2 text-slate-600">
                <p>Narahubung: <span className="font-semibold text-slate-700">{po.vendorDetails?.contact}</span></p>
                <p>Email: <span className="font-mono">{po.vendorDetails?.email}</span></p>
                <p className="leading-relaxed">Alamat: {po.vendorDetails?.address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: PO Items logs & status transition Timeline */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* PO items table listing card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm overflow-hidden">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-5">
              Rincian Item Purchase Order
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3">SKU</th>
                    <th className="pb-3">Deskripsi Barang</th>
                    <th className="pb-3 text-center">Qty</th>
                    <th className="pb-3 text-right">Harga Satuan</th>
                    <th className="pb-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-650">
                  {po.items.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-3 font-mono font-semibold text-slate-800">{item.itemSku}</td>
                      <td className="py-3 font-semibold text-slate-705">{item.itemName}</td>
                      <td className="py-3 text-center font-bold text-slate-700">{item.qty}</td>
                      <td className="py-3 text-right text-slate-600">{formatRupiah(item.price)}</td>
                      <td className="py-3 text-right font-bold text-slate-800">{formatRupiah(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations summaries */}
            <div className="flex justify-end border-t border-slate-100 pt-5 mt-5">
              <div className="w-full md:w-80 text-right space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Nilai PO</span>
                <p className="text-2xl font-extrabold text-slate-800">{formatRupiah(po.totalAmount)}</p>
              </div>
            </div>
          </div>

          {/* Workflow logs Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-6">
              Timeline Perubahan Status (Workflow Log)
            </h3>

            <div className="flow-root pl-4">
              <ul className="-mb-8">
                {po.timeline.map((event, eventIdx) => (
                  <li key={eventIdx}>
                    <div className="relative pb-8">
                      {eventIdx !== po.timeline.length - 1 ? (
                        <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true" />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 border border-slate-200 shadow-sm text-xs font-semibold text-slate-600">
                            {eventIdx + 1}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-xs text-slate-650 font-medium">
                              {event.note}{' '}
                              <span className="font-semibold text-slate-800">
                                ({event.status})
                              </span>
                            </p>
                          </div>
                          <div className="whitespace-nowrap text-right text-[10px] font-semibold text-slate-400">
                            <time dateTime={event.timestamp}>{formatDateTime(event.timestamp)}</time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </div>

      {/* Reject dialog reason input modal */}
      {isRejectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsRejectOpen(false)}></div>
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <h3 className="text-sm font-bold text-slate-850 mb-3">Tolak Purchase Order</h3>
            <p className="text-[11px] text-slate-450 mb-4 leading-relaxed">
              Masukkan alasan penolakan untuk Purchase Order <span className="font-bold text-slate-700">{po.poNumber}</span>. Alasan ini akan tercatat di log timeline PO.
            </p>
            
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-2">Alasan Penolakan</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="cth: Harga satuan terlalu mahal / Alokasi anggaran tidak mencukupi."
                  rows={3}
                  className="block w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder-slate-400"
                />
              </div>

              <div className="mt-6 flex justify-end space-x-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsRejectOpen(false);
                    setRejectReason('');
                  }}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-650 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 shadow-lg shadow-rose-650/15"
                >
                  Tolak PO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
