'use client';

import { useState } from 'react';
import { User, Lock, Eye, EyeOff, ShieldAlert, Sparkles, KeyRound } from 'lucide-react';

interface AdminLoginFormProps {
  onLoginSuccess: () => void;
}

export default function AdminLoginForm({ onLoginSuccess }: AdminLoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network latency for a premium feel
    setTimeout(() => {
      if (username.trim().toLowerCase() === 'admin' && password === 'admin123') {
        localStorage.setItem('elika_admin_logged_in', 'true');
        onLoginSuccess();
      } else {
        setError('Username atau password yang Anda masukkan salah.');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#111111] bg-gradient-to-tr from-charcoal via-stone-900 to-[#1c1917] flex items-center justify-center px-4 -mt-20">
      
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gold-light/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card */}
      <div className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-2xl space-y-8 relative overflow-hidden">
        
        {/* Top Header */}
        <div className="text-center space-y-2 relative">
          <div className="inline-flex p-3.5 bg-gold/10 border border-gold/20 rounded-2xl text-gold-dark mb-2 shadow-inner">
            <KeyRound className="h-6 w-6 text-gold" />
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-wide">
            Elika<span className="text-gold font-normal font-sans ml-1">&</span>
            <span className="text-gold"> Atelier</span>
          </h1>
          <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">Admin Portal Login</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex gap-2 items-center bg-red-500/10 border border-red-500/20 text-red-300 p-4 rounded-2xl text-xs animate-shake">
            <ShieldAlert className="h-4.5 w-4.5 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-300 block">Username</label>
            <div className="relative">
              <input
                type="text"
                required
                disabled={isLoading}
                placeholder="Masukkan username admin..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/5 border border-white/10 focus:border-gold hover:border-white/20 text-white rounded-xl py-2.5 px-3 pl-10 text-xs focus:outline-none focus:ring-1 focus:ring-gold/30 transition-all placeholder-stone-500"
              />
              <User className="h-4 w-4 text-stone-400 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-300 block">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                disabled={isLoading}
                placeholder="Masukkan password admin..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 focus:border-gold hover:border-white/20 text-white rounded-xl py-2.5 px-3 pl-10 pr-10 text-xs focus:outline-none focus:ring-1 focus:ring-gold/30 transition-all placeholder-stone-500"
              />
              <Lock className="h-4 w-4 text-stone-400 absolute left-3.5 top-3" />
              <button
                type="button"
                tabIndex={-1}
                disabled={isLoading}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 p-1 text-stone-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gold hover:bg-gold-dark text-[#111111] hover:text-white font-bold rounded-xl uppercase tracking-wider text-xs transition-all duration-300 shadow-md flex items-center justify-center gap-1.5 relative overflow-hidden cursor-pointer"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Masuk...</span>
              </>
            ) : (
              <>
                <span>Masuk Ke Panel</span>
              </>
            )}
          </button>
        </form>

        {/* Credentials Helper Card */}
        <div className="bg-gold/5 border border-gold/10 p-4 rounded-2xl text-[10px] text-stone-300 leading-normal flex items-start gap-2.5">
          <Sparkles className="h-4 w-4 text-gold flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold text-gold">Informasi Kredensial Demo</p>
            <p className="text-stone-400">Silakan gunakan akun berikut untuk masuk:</p>
            <div className="flex gap-4 mt-1 font-mono text-[9px] bg-[#111111]/30 p-1.5 rounded-lg border border-white/5">
              <span>Username: <strong className="text-white">admin</strong></span>
              <span>Password: <strong className="text-white">admin123</strong></span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
