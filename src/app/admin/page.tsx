'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { DollarSign, ClipboardList, Users, Sparkles, AlertCircle, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { Booking } from '@/types';
import { useBookings } from '@/data/db';

export default function AdminDashboardOverview() {
  const [bookings] = useBookings();

  // Compute stats from the bookings loaded from Supabase.
  const stats = useMemo(() => {
    const cleanNum = (str: string) => Number(str.replace(/[^0-9]/g, ''));
    
    // Revenue: sum of paid bookings (either DP or Full payment depending on status)
    let totalRevenue = 0;
    let pendingPayments = 0;
    let activeBookingsCount = 0;
    
    bookings.forEach((b) => {
      const isPaid = b.paymentStatus === 'paid';
      const cleanTotal = cleanNum(b.totalAmount);
      const cleanDp = cleanNum(b.depositRequired);

      if (isPaid) {
        // If paid and type is full, count full amount. If paid and DP, count DP.
        totalRevenue += b.paymentType === 'full' ? cleanTotal : cleanDp;
        // Remaining payment
        if (b.paymentType === 'dp') {
          pendingPayments += (cleanTotal - cleanDp);
        }
      } else {
        pendingPayments += b.paymentType === 'full' ? cleanTotal : cleanDp;
      }

      if (b.bookingStatus !== 'completed' && b.bookingStatus !== 'cancelled') {
        activeBookingsCount++;
      }
    });

    return {
      totalRevenue,
      pendingPayments,
      activeBookingsCount,
      totalBookings: bookings.length
    };
  }, [bookings]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusLabel = (status: Booking['bookingStatus']) => {
    const maps = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      paid: 'Lunas/DP',
      fitting: 'Fitting',
      ready: 'Ready',
      completed: 'Selesai',
      cancelled: 'Batal'
    };
    return maps[status] || status;
  };

  return (
    <div className="space-y-8">
      
      {/* Welcome & Quick Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-charcoal">Ringkasan Operasional Butik</h1>
          <p className="text-xs text-stone-500">Laporan omzet keuangan, jadwal acara aktif, dan pesanan fitting baju masuk.</p>
        </div>
        <div className="text-xs text-stone-400 italic font-semibold">
          Update terakhir: Hari ini, {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-gold-light/10 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-stone-400 uppercase block font-bold">Total Omzet (DP/Lunas)</span>
            <span className="text-lg font-black text-charcoal">{formatPrice(stats.totalRevenue)}</span>
          </div>
        </div>

        {/* Pending Receivables */}
        <div className="bg-white p-6 rounded-2xl border border-gold-light/10 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-stone-400 uppercase block font-bold">Tagihan Belum Lunas</span>
            <span className="text-lg font-black text-charcoal">{formatPrice(stats.pendingPayments)}</span>
          </div>
        </div>

        {/* Active Bookings */}
        <div className="bg-white p-6 rounded-2xl border border-gold-light/10 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
            <ClipboardList className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-stone-400 uppercase block font-bold">Jadwal Event Aktif</span>
            <span className="text-lg font-black text-charcoal">{stats.activeBookingsCount} Reservasi</span>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="bg-white p-6 rounded-2xl border border-gold-light/10 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-stone-400 uppercase block font-bold">Total Klien Masuk</span>
            <span className="text-lg font-black text-charcoal">{stats.totalBookings} Pengantin</span>
          </div>
        </div>

      </div>

      {/* Main Grid: Recent Bookings & Agenda */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Recent Bookings Table */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gold-light/20 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-gold-light/10">
            <h3 className="font-serif font-bold text-base text-charcoal">Daftar Booking Terbaru</h3>
            <Link
              href="/admin/bookings"
              className="text-[10px] uppercase font-bold tracking-wider text-gold hover:text-gold-dark"
            >
              Lihat Semua
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gold-light/10 font-bold text-stone-500 uppercase text-[10px]">
                  <th className="py-3 pr-4">Invoice</th>
                  <th className="py-3 px-4">Nama Pelanggan</th>
                  <th className="py-3 px-4">Tanggal Event</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 pl-4 text-right">Total Biaya</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-light/10">
                {bookings.slice(0, 5).map((item) => (
                  <tr key={item.id} className="hover:bg-ivory-light/30">
                    <td className="py-3 pr-4 font-bold text-charcoal">{item.invoiceNumber}</td>
                    <td className="py-3 px-4 font-semibold text-charcoal-light">{item.customerName}</td>
                    <td className="py-3 px-4 text-stone-500">{item.eventDate}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        item.bookingStatus === 'confirmed' || item.bookingStatus === 'paid'
                          ? 'bg-emerald-50 text-emerald-700'
                          : item.bookingStatus === 'pending'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-stone-50 text-stone-600'
                      }`}>
                        {getStatusLabel(item.bookingStatus)}
                      </span>
                    </td>
                    <td className="py-3 pl-4 text-right font-bold text-gold-dark">{item.totalAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Quick Agenda / Status Calendar */}
        <div className="bg-white p-6 rounded-2xl border border-gold-light/20 shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-base text-charcoal pb-2 border-b border-gold-light/10 flex items-center gap-1.5">
            <ClipboardList className="h-4.5 w-4.5 text-gold-dark" /> Agenda Kegiatan Butik
          </h3>
          
          <div className="space-y-3.5 max-h-80 overflow-y-auto">
            {bookings.filter((b) => b.bookingStatus === 'fitting' || b.bookingStatus === 'confirmed' || b.bookingStatus === 'pending').map((b) => (
              <div key={b.id} className="p-3 rounded-xl border border-gold-light/10 bg-ivory-light text-[11px] space-y-1">
                <div className="flex justify-between font-bold text-charcoal">
                  <span>Fitting / Pengantaran</span>
                  <span className="text-gold-dark uppercase text-[9px]">{b.bookingStatus}</span>
                </div>
                <p className="text-stone-600">Pelanggan: <span className="font-semibold text-charcoal">{b.customerName}</span></p>
                <p className="text-stone-500 flex items-center gap-1">
                  <Clock className="h-3 w-3 text-gold-dark" />
                  <span>Hari Acara: {b.eventDate}</span>
                </p>
              </div>
            ))}
            {bookings.length === 0 && (
              <p className="text-stone-400 italic text-center py-8">Tidak ada agenda tertunda.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
