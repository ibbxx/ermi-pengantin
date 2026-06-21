'use client';

import { use, useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertOctagon, FileText, ArrowRight, MessageSquare } from 'lucide-react';
import { Booking } from '@/types';

function FailedPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams?.get('bookingId') || '';

  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (!bookingId) return;

    const savedBookingsStr = localStorage.getItem('elika_bookings');
    if (savedBookingsStr) {
      try {
        const bookingsList: Booking[] = JSON.parse(savedBookingsStr);
        const foundBooking = bookingsList.find((b) => b.id === bookingId);
        if (foundBooking) {
          setBooking(foundBooking);
        }
      } catch (err) {
        console.error(err);
      }
    }
  }, [bookingId]);

  const handleWhatsAppNotify = () => {
    if (!booking) return;
    const text = encodeURIComponent(`Halo Admin Elika, pembayaran saya untuk Invoice ${booking.invoiceNumber} gagal. Mohon dipandu cara bayar alternatif.`);
    window.open(`https://wa.me/6281234567890?text=${text}`, '_blank');
  };

  if (!booking) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4 space-y-4">
        <AlertOctagon className="h-16 w-16 text-red-500 mx-auto" />
        <h2 className="text-2xl font-serif font-bold text-charcoal">Pembayaran Gagal</h2>
        <p className="text-xs text-stone-500">Mohon maaf, transaksi pembayaran Anda tidak berhasil diselesaikan. Silakan coba kembali.</p>
        <Link href="/booking" className="w-full block py-3 bg-gold hover:bg-gold-dark text-white rounded-xl text-xs uppercase tracking-wider font-semibold transition-all">
          Kembali ke Booking
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-16 px-4 space-y-8">
      
      {/* Visual Indicator */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-sm border border-red-100">
          <AlertOctagon className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-charcoal">Transaksi Gagal</h1>
        <p className="text-xs text-stone-500">
          Mohon maaf, pembayaran untuk nomor Invoice <span className="font-bold text-charcoal">{booking.invoiceNumber}</span> ditolak atau gagal diproses.
        </p>
      </div>

      {/* Invoice Detail Card */}
      <div className="bg-white p-6 rounded-3xl border border-gold-light/20 shadow-md space-y-6 text-xs text-stone-600">
        <h3 className="font-serif font-bold text-base text-charcoal border-b border-gold-light/10 pb-3 flex items-center gap-1.5">
          <FileText className="h-4.5 w-4.5 text-gold-dark" /> Detail Booking
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-stone-400 block text-[10px] uppercase">Nama Pelanggan</span>
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
            <span className="text-stone-400 block text-[10px] uppercase">Metode Gagal</span>
            <span className="font-bold text-charcoal uppercase">{booking.paymentMethod.replace('_', ' ')}</span>
          </div>
          <div className="col-span-2 border-t border-gold-light/10 pt-4 flex justify-between items-center text-sm">
            <span className="font-bold text-charcoal">Jumlah Tagihan Gagal:</span>
            <span className="text-lg font-black text-red-600">
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
          <span>Ulangi Pembayaran</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
        <button
          onClick={handleWhatsAppNotify}
          className="flex-1 py-3.5 border border-stone-200 hover:border-gold hover:text-gold text-stone-700 text-center rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
        >
          <MessageSquare className="h-4.5 w-4.5 text-emerald-600" />
          <span>Hubungi Bantuan Butik</span>
        </button>
      </div>

    </div>
  );
}

export default function FailedPage() {
  return (
    <Suspense fallback={
      <div className="max-w-md mx-auto text-center py-20 px-4 text-xs text-stone-500">
        Memuat invoice gagal...
      </div>
    }>
      <FailedPageContent />
    </Suspense>
  );
}
