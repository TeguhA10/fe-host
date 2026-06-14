import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Lock, Mail, AlertCircle, Loader } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Path redirect target (default to dashboard)
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validations
    if (!email) {
      setError('Email wajib diisi.');
      return;
    }
    if (!password) {
      setError('Password wajib diisi.');
      return;
    }
    if (password.length < 6) {
      setError('Password minimal harus 6 karakter.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login gagal. Hubungi administrator.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="w-full">
      {/* Login Card Panel */}
      <div className="glass-panel rounded-2xl shadow-2xl p-8 border border-white/20">

        {/* Company Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white shadow-xl shadow-indigo-600/30 text-xl tracking-wider">
            AR
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-800">
            Selamat Datang Kembali
          </h2>
          <p className="mt-2 text-xs text-slate-500 font-medium">
            Masuk ke portal ERP Anyar Retail Group
          </p>
        </div>

        {/* Error Alert Dialog */}
        {error && (
          <div className="mb-6 flex items-start space-x-2 rounded-xl bg-rose-50 border border-rose-100 p-3.5 text-xs text-rose-600">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span className="font-semibold leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email input field */}
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-slate-600 mb-2">
              Alamat Email
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Mail size={16} />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@anyar.co.id"
                disabled={loading}
                className="block w-full rounded-xl border border-slate-200 bg-white/50 pl-10 pr-3 py-3 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50 transition-all-fast"
              />
            </div>
          </div>

          {/* Password input field */}
          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-slate-600 mb-2">
              Kata Sandi
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Lock size={16} />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                className="block w-full rounded-xl border border-slate-200 bg-white/50 pl-10 pr-10 py-3 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50 transition-all-fast"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>


          {/* Login Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 transition-all duration-150"
          >
            {loading ? (
              <>
                <Loader className="mr-2 animate-spin" size={16} />
                <span>Menghubungkan...</span>
              </>
            ) : (
              <span>Masuk Sekarang</span>
            )}
          </button>
        </form>

        {/* Credentials Sandbox Helper */}
        <div className="mt-6 border-t border-slate-200/60 pt-4">
          <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider text-center mb-2">
            Informasi Kredensial Demo
          </p>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-[10px] text-slate-600 space-y-2">
            <div>
              <p className="font-semibold text-slate-800">Super Admin</p>
              <p className="font-mono">Email: admin@example.com</p>
              <p className="font-mono">Password: password123</p>
            </div>

            <div className="border-t border-slate-200 pt-2">
              <p className="font-semibold text-slate-800">
                Password Akun Lainnya
              </p>
              <p className="font-mono">password123!</p>
            </div>

            <div className="border-t border-slate-200 pt-2">
              <p className="font-semibold text-slate-800">Daftar Akun Lain:</p>
              <div className="font-mono space-y-1 mt-1">
                <p>• hrd@example.com → Admin HRD</p>
                <p>• purchasing@anyar.co.id → Admin Purchasing</p>
                <p>• branch@anyar.co.id → Admin Cabang</p>
                <p>• rizky.firmansyah@anyar.co.id → Staff Purchasing</p>
                <p>• siti.nurhaliza@anyar.co.id → Karyawan</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
