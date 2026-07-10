'use client';

import { use, useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Calendar, FileText, ArrowRight, MessageSquare } from 'lucide-react';
import { Booking } from '@/types';
import { db } from '@/data/db';

function SuccessPageContent() {
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
    const text = encodeURIComponent(`Halo Admin Elika, saya telah menyelesaikan pembayaran untuk Invoice ${booking.invoiceNumber} atas nama ${booking.customerName}. Mohon verifikasi.`);
    window.open(`https://wa.me/6281234567890?text=${text}`, '_blank');
  };

  if (!booking) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4 space-y-4">
        <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto" />
        <h2 className="text-2xl font-serif font-bold text-charcoal">Pembayaran Berhasil!</h2>
        <p className="text-xs text-stone-500">Reservasi Anda telah terkonfirmasi. Silakan buka dashboard untuk memantau status pesanan.</p>
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
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm border border-emerald-100">
          <CheckCircle className="h-10 w-10 fill-emerald-50" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-charcoal">Pembayaran Berhasil!</h1>
        <p className="text-xs text-stone-500">
          Uang muka/pelunasan untuk Invoice <span className="font-bold text-charcoal">{booking.invoiceNumber}</span> telah kami terima.
        </p>
      </div>

      {/* Invoice Detail Card */}
      <div className="bg-white p-6 rounded-3xl border border-gold-light/20 shadow-md space-y-6 text-xs text-stone-600">
        <h3 className="font-serif font-bold text-base text-charcoal border-b border-gold-light/10 pb-3 flex items-center gap-1.5">
          <FileText className="h-4.5 w-4.5 text-gold-dark" /> Rincian Transaksi
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
            <span className="text-stone-400 block text-[10px] uppercase">Tanggal Acara</span>
            <span className="font-bold text-charcoal">{booking.eventDate}</span>
          </div>
          <div>
            <span className="text-stone-400 block text-[10px] uppercase">Metode Bayar</span>
            <span className="font-bold text-charcoal uppercase">{booking.paymentMethod.replace('_', ' ')}</span>
          </div>
          <div className="col-span-2 border-t border-gold-light/10 pt-4 flex justify-between items-center text-sm">
            <span className="font-bold text-charcoal">Jumlah yang Dibayarkan:</span>
            <span className="text-lg font-black text-emerald-700">
              {booking.paymentType === 'dp' ? booking.depositRequired : booking.totalAmount}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/account"
          className="flex-1 py-3.5 bg-gold hover:bg-gold-dark text-white text-center rounded-xl text-xs uppercase tracking-wider font-semibold transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-1.5"
        >
          <span>Buka Dashboard Saya</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
        <button
          onClick={handleWhatsAppNotify}
          className="flex-1 py-3.5 border border-stone-200 hover:border-gold hover:text-gold text-stone-700 text-center rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
        >
          <MessageSquare className="h-4.5 w-4.5 text-emerald-600" />
          <span>Kirim Bukti via WhatsApp</span>
        </button>
      </div>

    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="max-w-md mx-auto text-center py-20 px-4 text-xs text-stone-500">
        Memuat invoice sukses...
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}
