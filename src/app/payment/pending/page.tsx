'use client';

import { use, useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Clock, FileText, ArrowRight, MessageSquare, AlertTriangle } from 'lucide-react';
import { Booking } from '@/types';
import { db } from '@/data/db';

function PendingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams?.get('bookingId') || '';

  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (!bookingId) return;
    db.getBookingById(bookingId).then((foundBooking) => {
      if (foundBooking) {
        setBooking(foundBooking);
      }
    }).catch(console.error);
  }, [bookingId]);

  const handleWhatsAppNotify = () => {
    if (!booking) return;
    const text = encodeURIComponent(`Halo Admin Elika, saya ingin konfirmasi status pembayaran pending untuk Invoice ${booking.invoiceNumber}.`);
    window.open(`https://wa.me/6281234567890?text=${text}`, '_blank');
  };

  if (!booking) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4 space-y-4">
        <Clock className="h-16 w-16 text-amber-500 mx-auto animate-pulse" />
        <h2 className="text-2xl font-serif font-bold text-charcoal">Pembayaran Tertunda</h2>
        <p className="text-xs text-stone-500">Menunggu pembayaran transfer Anda. Silakan selesaikan pembayaran sesuai instruksi di halaman checkout.</p>
        <Link href="/account" className="w-full block py-3 bg-gold hover:bg-gold-dark text-white rounded-xl text-xs uppercase tracking-wider font-semibold transition-all">
          Lihat Dashboard Saya
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-16 px-4 space-y-8">

      {/* Visual Indicator */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-sm border border-amber-100 animate-pulse">
          <Clock className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-charcoal">Menunggu Pembayaran</h1>
        <p className="text-xs text-stone-500">
          Silakan selesaikan transfer untuk mengamankan pesanan dengan Invoice <span className="font-bold text-charcoal">{booking.invoiceNumber}</span>.
        </p>
      </div>

      {/* Warning Box */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 flex items-start gap-2 max-w-lg mx-auto">
        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Penting: Amankan Jadwal Anda</p>
          <p className="leading-relaxed text-[11px] text-amber-700/90">
            Jadwal sewa gaun atau jasa pernikahan Anda belum terpesan permanen sebelum kami memverifikasi pembayaran Anda. Transaksi pending akan kedaluwarsa otomatis dalam 24 jam.
          </p>
        </div>
      </div>

      {/* Invoice Detail Card */}
      <div className="bg-white p-6 rounded-3xl border border-gold-light/20 shadow-md space-y-6 text-xs text-stone-600">
        <h3 className="font-serif font-bold text-base text-charcoal border-b border-gold-light/10 pb-3 flex items-center gap-1.5">
          <FileText className="h-4.5 w-4.5 text-gold-dark" /> Rincian Tagihan Pending
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-stone-400 block text-[10px] uppercase">Nama Klien</span>
            <span className="font-bold text-charcoal">{booking.customerName}</span>
          </div>
          <div>
            <span className="text-stone-400 block text-[10px] uppercase">Nomor Invoice</span>
            <span className="font-bold text-charcoal">{booking.invoiceNumber}</span>
          </div>
          <div>
            <span className="text-stone-400 block text-[10px] uppercase">Tanggal Pernikahan</span>
            <span className="font-bold text-charcoal">{booking.eventDate}</span>
          </div>
          <div>
            <span className="text-stone-400 block text-[10px] uppercase">Metode Transfer</span>
            <span className="font-bold text-charcoal uppercase">{booking.paymentMethod.replace('_', ' ')}</span>
          </div>
          <div className="col-span-2 border-t border-gold-light/10 pt-4 flex justify-between items-center text-sm">
            <span className="font-bold text-charcoal">Jumlah Tagihan Pembayaran:</span>
            <span className="text-lg font-black text-amber-600">
              {booking.paymentType === 'dp' ? booking.depositRequired : booking.totalAmount}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href={`/checkout?bookingId=${booking.id}`}
          className="flex-1 py-3.5 bg-gold hover:bg-gold-dark text-white text-center rounded-xl text-xs uppercase tracking-wider font-semibold transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-1.5"
        >
          <span>Instruksi Bayar Ulang</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
        <button
          onClick={handleWhatsAppNotify}
          className="flex-1 py-3.5 border border-stone-200 hover:border-gold hover:text-gold text-stone-700 text-center rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
        >
          <MessageSquare className="h-4.5 w-4.5 text-emerald-600" />
          <span>Tanya Status Verifikasi</span>
        </button>
      </div>

    </div>
  );
}

export default function PendingPage() {
  return (
    <Suspense fallback={
      <div className="max-w-md mx-auto text-center py-20 px-4 text-xs text-stone-500">
        Memuat invoice pending...
      </div>
    }>
      <PendingPageContent />
    </Suspense>
  );
}
