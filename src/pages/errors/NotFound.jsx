import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 py-12 text-center">
      <div className="flex flex-col items-center max-w-md">
        
        {/* Error icon circle */}
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 shadow-lg shadow-rose-500/10 mb-6">
          <AlertCircle size={32} />
        </div>

        <h1 className="text-8xl font-black tracking-tight text-slate-800">404</h1>
        <h2 className="mt-4 text-2xl font-bold text-slate-700">Halaman Tidak Ditemukan</h2>
        <p className="mt-3 text-sm text-slate-500 leading-relaxed">
          Mohon maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.
          Pastikan URL yang dimasukkan sudah benar.
        </p>

        {/* Back Link */}
        <Link
          to="/dashboard"
          className="mt-8 inline-flex items-center justify-center space-x-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all duration-150"
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
