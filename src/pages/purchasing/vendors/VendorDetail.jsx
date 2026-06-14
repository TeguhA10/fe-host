import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { vendorService } from '../../../services/vendorService';
import { ChevronLeft, Edit2, Store, Phone, Mail, MapPin, FileText, Calendar } from 'lucide-react';
import { formatRupiah, formatDate } from '../../../utils/format';
import StatusBadge from '../../../components/badges/StatusBadge';

export default function VendorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        setLoading(true);
        const data = await vendorService.getById(id);
        setVendor(data);
      } catch (err) {
        setError(err.message || 'Gagal memuat profil vendor.');
      } finally {
        setLoading(false);
      }
    };
    fetchVendorData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-lg mx-auto shadow-sm">
        <p className="text-sm font-semibold text-rose-600">{error || 'Vendor tidak ditemukan.'}</p>
        <Link 
          to="/purchasing/vendors" 
          className="mt-4 inline-flex items-center text-xs font-semibold text-indigo-650 hover:underline"
        >
          Kembali ke Daftar Vendor
        </Link>
      </div>
    );
  }



  return (
    <div className="space-y-6">
      {/* Action Top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/purchasing/vendors')}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-605 hover:text-indigo-650"
        >
          <ChevronLeft size={16} />
          <span>Kembali</span>
        </button>
        <Link
          to={`/purchasing/vendors/${vendor.id}/edit`}
          className="inline-flex items-center justify-center space-x-2 rounded-xl bg-white border border-slate-202 px-4 py-2 text-xs font-semibold text-slate-705 hover:bg-slate-50 transition-all duration-150"
        >
          <Edit2 size={14} className="text-slate-400" />
          <span>Ubah Vendor</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Card: Basic profile Info */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shadow-sm mb-4">
            <Store size={36} />
          </div>
          <h2 className="text-base font-bold text-slate-800 text-center">{vendor.name}</h2>
          <p className="text-[10px] font-mono text-slate-450 mt-1 uppercase tracking-wider">{vendor.code}</p>

          <span className={`mt-3 inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ring-1 ring-inset ${
            vendor.active 
              ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' 
              : 'bg-slate-100 text-slate-700 ring-slate-650/10'
          }`}>
            {vendor.active ? 'Aktif' : 'Non-Aktif'}
          </span>

          <div className="w-full border-t border-slate-100 mt-6 pt-6 space-y-4 text-xs text-slate-600">
            <div className="flex items-center space-x-3">
              <Phone className="text-slate-400 shrink-0" size={15} />
              <span>{vendor.contact}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="text-slate-400 shrink-0" size={15} />
              <span className="font-mono">{vendor.email}</span>
            </div>
            <div className="flex items-start space-x-3">
              <MapPin className="text-slate-400 shrink-0 mt-0.5" size={15} />
              <span className="leading-relaxed">{vendor.address}</span>
            </div>
          </div>
        </div>

        {/* Right Card: PO History logs */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-6 flex items-center">
              <FileText className="mr-2 text-indigo-500" size={16} />
              <span>Riwayat Transaksi Purchase Order</span>
            </h3>

            {vendor.poHistory.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-xs font-medium">
                Belum ada transaksi PO terdaftar untuk vendor ini.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="pb-3">Nomor PO</th>
                      <th className="pb-3">Tanggal</th>
                      <th className="pb-3">Cabang</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-650">
                    {vendor.poHistory.map(po => (
                      <tr key={po.id} className="hover:bg-slate-50/50">
                        <td className="py-3">
                          <Link 
                            to={`/purchasing/purchase-orders/${po.id}`}
                            className="font-mono font-semibold text-indigo-600 hover:text-indigo-850 hover:underline"
                          >
                            {po.poNumber}
                          </Link>
                        </td>
                        <td className="py-3 text-slate-500">
                          <div className="flex items-center space-x-1.5">
                            <Calendar size={13} className="text-slate-400" />
                            <span>{formatDate(po.createdAt)}</span>
                          </div>
                        </td>
                        <td className="py-3">{po.branchName}</td>
                        <td className="py-3"><StatusBadge status={po.status} /></td>
                        <td className="py-3 text-right font-semibold text-slate-800">{formatRupiah(po.totalAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
