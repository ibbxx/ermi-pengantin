'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ShoppingBag, User, Settings } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Beranda', href: '/' },
    { name: 'Sewa Baju', href: '/dresses' },
    { name: 'Jasa Makeup', href: '/makeup' },
    { name: 'Dekorasi', href: '/decor' },
    { name: 'Paket Wedding', href: '/packages' },
  ];

  const isActive = (path: string) => pathname === path;

  // Render Navbar for Admin routes differently or hide it
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled
          ? 'bg-ivory/90 backdrop-blur-md shadow-sm border-b border-gold-light/20 py-3'
          : 'bg-transparent py-5'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-serif font-bold tracking-wide text-charcoal">
              Elika<span className="text-gold font-normal font-sans ml-1">&</span>
              <span className="text-gold"> Wedding</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm tracking-wide transition-colors duration-200 ${isActive(item.href)
                    ? 'text-gold-dark font-medium border-b-2 border-gold-dark/80 pb-1'
                    : 'text-charcoal-light hover:text-gold-dark pb-1'
                  }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/account"
              className="p-2 text-charcoal hover:text-gold transition-colors"
              title="Dashboard Pelanggan"
            >
              <User className="h-5 w-5" />
            </Link>
            <Link
              href="/admin"
              className="p-2 text-charcoal hover:text-gold transition-colors"
              title="Dashboard Admin"
            >
              <Settings className="h-5 w-5" />
            </Link>
            <Link
              href="/booking"
              className="px-5 py-2 text-xs uppercase tracking-wider font-semibold bg-gold hover:bg-gold-dark text-white rounded-full transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Booking Sekarang
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-3">
            <Link
              href="/account"
              className="p-2 text-charcoal hover:text-gold transition-colors"
            >
              <User className="h-5 w-5" />
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-charcoal hover:text-gold-dark focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div
        className={`md:hidden fixed inset-y-0 right-0 max-w-xs w-full bg-ivory shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="flex justify-between items-center p-5 border-b border-gold-light/20">
          <span className="text-xl font-serif font-bold text-charcoal">Menu</span>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-md text-charcoal hover:text-gold-dark focus:outline-none"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="flex flex-col px-6 py-6 space-y-4">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`text-base font-medium py-2 border-b border-gray-100 ${isActive(item.href) ? 'text-gold-dark' : 'text-charcoal hover:text-gold-dark'
                }`}
            >
              {item.name}
            </Link>
          ))}
          <div className="pt-4 flex flex-col space-y-3">
            <Link
              href="/account"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-2 py-2 text-charcoal"
            >
              <User className="h-5 w-5 text-gold-dark" />
              <span>Dashboard Pelanggan</span>
            </Link>
            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-2 py-2 text-charcoal"
            >
              <Settings className="h-5 w-5 text-gold-dark" />
              <span>Dashboard Admin</span>
            </Link>
            <Link
              href="/booking"
              onClick={() => setIsOpen(false)}
              className="w-full text-center px-5 py-3 text-sm uppercase tracking-wider font-semibold bg-gold hover:bg-gold-dark text-white rounded-full transition-all duration-300 shadow-md"
            >
              Booking Sekarang
            </Link>
          </div>
        </div>
      </div>

      {/* Backdrop when drawer is open */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
        />
      )}
    </nav>
  );
}
