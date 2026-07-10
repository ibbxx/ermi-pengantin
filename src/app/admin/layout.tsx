'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Sparkles,
  Scissors,
  Layers,
  Award,
  Users,
  CreditCard,
  Image,
  Settings as SettingsIcon,
  LogOut,
  Bell,
  UserCheck
} from 'lucide-react';

import { useState, useEffect } from 'react';
import AdminLoginForm from '@/components/AdminLoginForm';
import { supabase } from '@/lib/supabase';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Check real Supabase auth session instead of localStorage
    supabase.auth.getSession().then(({ data: { session } }) => {
      const hasSession = !!session;
      setIsLoggedIn(hasSession);
      if (hasSession) {
        localStorage.setItem('elika_admin_logged_in', 'true');
      } else {
        localStorage.removeItem('elika_admin_logged_in');
      }
    });

    // Listen for auth state changes (login/logout/token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const hasSession = !!session;
      setIsLoggedIn(hasSession);
      if (hasSession) {
        localStorage.setItem('elika_admin_logged_in', 'true');
      } else {
        localStorage.removeItem('elika_admin_logged_in');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const sidebarLinks = [
    { name: 'Dashboard Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Daftar Booking', href: '/admin/bookings', icon: Calendar },
    { name: 'Koleksi Gaun', href: '/admin/dresses', icon: Scissors },
    { name: 'Layanan Makeup', href: '/admin/makeup', icon: Sparkles },
    { name: 'Tema Dekorasi', href: '/admin/decor', icon: Layers },
    { name: 'Paket Pernikahan', href: '/admin/packages', icon: Award },
    { name: 'Data Klien', href: '/admin/customers', icon: Users },
    { name: 'Daftar Transaksi', href: '/admin/payments', icon: CreditCard },
    { name: 'Galeri Portofolio', href: '/admin/gallery', icon: Image },
    { name: 'Pengaturan Butik', href: '/admin/settings', icon: SettingsIcon },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname?.startsWith(href);
  };

  const handleLogout = async () => {
    if (confirm('Apakah Anda yakin ingin keluar dari panel admin?')) {
      await supabase.auth.signOut();
      localStorage.removeItem('elika_admin_logged_in');
      setIsLoggedIn(false);
      router.push('/');
    }
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center -mt-20">
        <div className="animate-pulse text-stone-500 font-serif text-sm">Memuat Panel Admin...</div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <AdminLoginForm onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row -mt-20">
      
      {/* 1. SIDEBAR (Left panel) */}
      <aside className="w-full md:w-64 bg-charcoal text-stone-300 flex flex-col border-r border-stone-800 flex-shrink-0 z-30 pt-20">
        {/* Brand name */}
        <div className="p-6 border-b border-stone-800">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-serif font-bold tracking-wide text-white">
              Elika<span className="text-gold font-normal font-sans ml-1">&</span>
              <span className="text-gold"> Admin</span>
            </span>
          </Link>
          <span className="text-[10px] text-stone-500 uppercase tracking-widest block mt-1 font-bold">Butik Management</span>
        </div>

        {/* Navigation links */}
        <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  active
                    ? 'bg-gold text-white shadow-md'
                    : 'hover:bg-stone-800 hover:text-white text-stone-400'
                }`}
              >
                <Icon className="h-4.5 w-4.5 flex-shrink-0" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout at bottom */}
        <div className="p-4 border-t border-stone-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all text-left"
          >
            <LogOut className="h-4.5 w-4.5 flex-shrink-0" />
            <span>Keluar Sistem</span>
          </button>
        </div>
      </aside>

      {/* 2. RIGHT CONTAINER: Topbar + Page Content */}
      <div className="flex-grow flex flex-col min-w-0 pt-20">
        {/* Top Header */}
        <header className="bg-white border-b border-stone-200 py-3.5 px-6 flex justify-between items-center shadow-xs">
          <h2 className="text-sm font-bold text-charcoal font-serif">
            {sidebarLinks.find((l) => isActive(l.href))?.name || 'Admin Panel'}
          </h2>
          
          <div className="flex items-center space-x-4">
            {/* Notification alert */}
            <button className="p-2 text-stone-400 hover:text-charcoal transition-colors relative">
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            
            {/* Admin Profile */}
            <div className="flex items-center space-x-2 border-l border-stone-200 pl-4">
              <div className="w-8 h-8 rounded-full bg-champagne text-gold-dark font-bold text-xs flex items-center justify-center">
                AD
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-charcoal leading-none">Amanda Dewina</p>
                <span className="text-[9px] text-stone-400">Super Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-grow p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

    </div>
  );
}
