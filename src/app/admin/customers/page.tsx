'use client';

import { useState, useMemo } from 'react';
import { Search, Mail, Phone, MapPin, Clipboard } from 'lucide-react';
import { Booking } from '@/types';
import { useBookings } from '@/data/db';

export default function AdminCustomers() {
  const [bookings] = useBookings();
  const [searchQuery, setSearchQuery] = useState('');

  // Compute unique customers from bookings
  const customers = useMemo(() => {
    const custMap: Record<string, {
      name: string;
      whatsapp: string;
      email: string;
      address: string;
      bookingsCount: number;
    }> = {};

    bookings.forEach((b) => {
      // Use whatsapp or email as key if customerId is default
      const key = b.customerWhatsApp || b.customerEmail;
      if (!custMap[key]) {
        custMap[key] = {
          name: b.customerName,
          whatsapp: b.customerWhatsApp,
          email: b.customerEmail,
          address: b.customerAddress,
          bookingsCount: 0
        };
      }
      custMap[key].bookingsCount++;
    });

    return Object.values(custMap);
  }, [bookings]);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      return c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.whatsapp.includes(searchQuery);
    });
  }, [customers, searchQuery]);

  return (
    <div className="space-y-6 text-xs">
      
      {/* Header controls */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="font-serif font-bold text-base text-charcoal">Database Kontak Pelanggan (Klien)</h2>
          <p className="text-[10px] text-stone-400">Daftar kontak pengantin, email, alamat fitting, dan jumlah riwayat booking mereka.</p>
        </div>
        
        {/* Search */}
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Cari nama/kontak..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 focus:border-gold rounded-xl py-1.5 px-3 pl-8 text-xs focus:outline-none"
          />
          <Search className="h-4 w-4 text-stone-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Grid of customer contacts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredCustomers.map((cust, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 pb-3 border-b border-stone-150">
              <div className="w-10 h-10 rounded-full bg-champagne text-gold-dark font-bold text-sm flex items-center justify-center">
                {cust.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm text-charcoal leading-none">{cust.name}</h3>
                <span className="text-[9px] text-stone-400 mt-1 block font-semibold">{cust.bookingsCount}x Melakukan Booking</span>
              </div>
            </div>

            <div className="space-y-2 text-stone-600">
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>{cust.whatsapp}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gold flex-shrink-0" />
                <span>{cust.email}</span>
              </p>
              <p className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-stone-400 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{cust.address}</span>
              </p>
            </div>

            <div className="pt-2 border-t border-stone-100 flex justify-end">
              <a
                href={`https://wa.me/${cust.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1 shadow-sm"
              >
                <Clipboard className="h-3.5 w-3.5" /> Chat WhatsApp
              </a>
            </div>
          </div>
        ))}

        {filteredCustomers.length === 0 && (
          <div className="col-span-3 py-12 text-center text-stone-400 italic">Tidak ada data pelanggan cocok.</div>
        )}
      </div>

    </div>
  );
}
