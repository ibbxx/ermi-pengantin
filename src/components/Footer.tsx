'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, Phone, MapPin, Clock, Heart } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-charcoal text-ivory-light pt-16 pb-8 border-t border-gold-dark/20 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-1 space-y-4">
            <span className="text-2xl font-serif font-bold tracking-wide text-white block">
              Elika<span className="text-gold font-normal font-sans ml-1">&</span>
              <span className="text-gold"> Wedding</span>
            </span>
            <p className="text-stone-300 text-sm leading-relaxed">
              Mewujudkan pernikahan impian Anda dengan koleksi gaun pengantin mewah, riasan flawless yang bertahan sepanjang hari, dan dekorasi pernikahan megah yang tak terlupakan.
            </p>
            <div className="flex space-x-4 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full border border-gold/40 flex items-center justify-center text-stone-300 hover:text-gold hover:border-gold transition-colors"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full border border-gold/40 flex items-center justify-center text-stone-300 hover:text-gold hover:border-gold transition-colors"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-gold font-serif font-semibold text-lg mb-4">Layanan Kami</h3>
            <ul className="space-y-2 text-sm text-stone-300">
              <li>
                <Link href="/dresses" className="hover:text-gold transition-colors">
                  Sewa Baju & Busana
                </Link>
              </li>
              <li>
                <Link href="/makeup" className="hover:text-gold transition-colors">
                  Jasa Makeup Artist (MUA)
                </Link>
              </li>
              <li>
                <Link href="/decor" className="hover:text-gold transition-colors">
                  Dekorasi Pernikahan
                </Link>
              </li>
              <li>
                <Link href="/packages" className="hover:text-gold transition-colors">
                  Paket Wedding Lengkap
                </Link>
              </li>
              <li>
                <Link href="/booking" className="hover:text-gold transition-colors">
                  Formulir Booking
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-gold font-serif font-semibold text-lg mb-4">Hubungi Kami</h3>
            <ul className="space-y-3 text-sm text-stone-300">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
                <span>Jl. Kemang Raya No. 12, Mampang Prapatan, Jakarta Selatan, 12730</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gold flex-shrink-0" />
                <span>+62 812-3456-7890 (Admin)</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gold flex-shrink-0" />
                <span>info@elikawedding.com</span>
              </li>
            </ul>
          </div>

          {/* Jam Operasional */}
          <div>
            <h3 className="text-gold font-serif font-semibold text-lg mb-4">Jam Operasional</h3>
            <ul className="space-y-3 text-sm text-stone-300">
              <li className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Senin - Sabtu</p>
                  <p>09.00 - 18.00 WIB</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Minggu (Dengan Janji Temu)</p>
                  <p>10.00 - 15.00 WIB</p>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-stone-800 text-center text-stone-500 text-xs flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p>© {currentYear} Elika Wedding Organizer & Atelier. Hak Cipta Dilindungi.</p>
          <p className="flex items-center justify-center">
            Dibuat dengan <Heart className="h-3.5 w-3.5 text-gold fill-gold mx-1" /> untuk hari bahagia Anda.
          </p>
        </div>
      </div>
    </footer>
  );
}
