'use client';

import { useState } from 'react';
import { User, Lock, Eye, EyeOff, ShieldAlert, KeyRound } from 'lucide-react';

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

    // Simulate simple network delay
    setTimeout(() => {
      if (username.trim().toLowerCase() === 'admin' && password === 'admin123') {
        localStorage.setItem('elika_admin_logged_in', 'true');
        onLoginSuccess();
      } else {
        setError('Username atau password yang Anda masukkan salah.');
        setIsLoading(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 -mt-20">
      
      {/* Main Card */}
      <div className="w-full max-w-sm bg-white border border-stone-200/80 rounded-2xl p-6 md:p-8 shadow-md space-y-6">
        
        {/* Top Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex p-2.5 bg-gold/10 border border-gold-light/20 rounded-xl text-gold-dark mb-1">
            <KeyRound className="h-5 w-5 text-gold-dark" />
          </div>
          <h1 className="text-xl md:text-2xl font-serif font-bold text-charcoal">
            Elika<span className="text-gold font-normal font-sans ml-1">&</span>
            <span className="text-gold"> Atelier</span>
          </h1>
          <p className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold">Admin Panel Login</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex gap-2 items-center bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs">
            <ShieldAlert className="h-4 w-4 text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-charcoal block">Username</label>
            <div className="relative">
              <input
                type="text"
                required
                disabled={isLoading}
                placeholder="Masukkan username..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 text-charcoal rounded-xl py-2 px-3 pl-9 text-xs focus:outline-none focus:border-gold focus:bg-white transition-all placeholder-stone-400"
              />
              <User className="h-4 w-4 text-stone-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-charcoal block">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                disabled={isLoading}
                placeholder="Masukkan password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 text-charcoal rounded-xl py-2 px-3 pl-9 pr-9 text-xs focus:outline-none focus:border-gold focus:bg-white transition-all placeholder-stone-400"
              />
              <Lock className="h-4 w-4 text-stone-400 absolute left-3 top-2.5" />
              <button
                type="button"
                tabIndex={-1}
                disabled={isLoading}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2 p-1 text-stone-400 hover:text-charcoal transition-colors"
              >
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-gold hover:bg-gold-dark text-white font-bold rounded-xl uppercase tracking-wider text-xs transition-all duration-300 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
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
              <span>Masuk Ke Panel</span>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
