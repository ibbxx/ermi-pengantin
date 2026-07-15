'use client';

import { use, useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Clock, FileText, ArrowRight, MessageSquare, AlertTriangle } from 'lucide-react';
import { Booking } from '@/types';
import { db, useSettings } from '@/data/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Breadcrumb from '@/components/Breadcrumb';

function PendingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams?.get('bookingId') || '';

  const [booking, setBooking] = useState<Booking | null>(null);
  const [settings] = useSettings();

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
    const text = encodeURIComponent(`Halo Admin Ermi Pengantin, saya ingin konfirmasi status pembayaran pending untuk Invoice ${booking.invoiceNumber}.`);
    window.open(`https://wa.me/${settings?.whatsappAdmin || '6281234567890'}?text=${text}`, '_blank');
  };

  if (!booking) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4 space-y-4">
        <Clock className="h-16 w-16 text-amber-500 mx-auto animate-pulse" />
        <h2 className="text-2xl font-serif font-bold text-foreground">Pembayaran Tertunda</h2>
        <p className="text-xs text-muted-foreground">Menunggu pembayaran transfer Anda. Silakan selesaikan pembayaran sesuai instruksi di halaman checkout.</p>
        <Button asChild className="w-full h-11">
          <Link href="/account">Lihat Dashboard Saya</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 space-y-6">
      
      {/* Breadcrumb & Navigation */}
      <Breadcrumb customLastLabel="Tertunda" />
      
      <Separator />

      {/* Visual Indicator */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-sm border border-amber-100 animate-pulse">
          <Clock className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-foreground">Menunggu Pembayaran</h1>
        <p className="text-xs text-muted-foreground">
          Silakan selesaikan transfer untuk mengamankan pesanan dengan Invoice <span className="font-bold text-foreground">{booking.invoiceNumber}</span>.
        </p>
      </div>

      {/* Warning Box */}
      <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-850 flex items-start gap-2 max-w-lg mx-auto leading-relaxed">
        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-foreground">Penting: Amankan Jadwal Anda</p>
          <p className="text-[11px] text-amber-800/90 font-light">
            Jadwal sewa gaun atau jasa pernikahan Anda belum terpesan permanen sebelum kami memverifikasi pembayaran Anda. Transaksi pending akan kedaluwarsa otomatis dalam 24 jam.
          </p>
        </div>
      </div>

      {/* Invoice Detail Card */}
      <Card className="border-border/60 shadow-md">
        <CardContent className="p-6 space-y-6 text-xs text-muted-foreground">
          <h3 className="font-serif font-bold text-base text-foreground border-b pb-3 flex items-center gap-1.5 border-border/40">
            <FileText className="h-4.5 w-4.5 text-primary" /> Rincian Tagihan Pending
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase">Nama Klien</span>
              <span className="font-bold text-foreground">{booking.customerName}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase">Nomor Invoice</span>
              <span className="font-bold text-foreground">{booking.invoiceNumber}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase">Tanggal Pernikahan</span>
              <span className="font-bold text-foreground">{booking.eventDate}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase">Metode Transfer</span>
              <span className="font-bold text-foreground uppercase mt-0.5">
                {booking.paymentMethod === 'tf' ? 'Transfer Bank' : booking.paymentMethod === 'qris' ? 'QRIS' : booking.paymentMethod.replace('_', ' ')}
              </span>
            </div>
            <div className="col-span-2 border-t pt-4 flex justify-between items-center text-sm border-border/40">
              <span className="font-bold text-foreground">Jumlah Tagihan Pembayaran:</span>
              <span className="text-lg font-black text-amber-600">
                {booking.paymentType === 'dp' ? booking.depositRequired : booking.totalAmount}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild size="lg" className="flex-grow h-11 text-xs uppercase tracking-wider font-bold shadow-md hover:shadow-lg">
          <Link href={`/checkout?bookingId=${booking.id}`}>
            <span>Instruksi Bayar Ulang</span>
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
        <Button
          onClick={handleWhatsAppNotify}
          variant="outline"
          size="lg"
          className="flex-grow h-11 text-xs font-semibold"
        >
          <MessageSquare className="h-4.5 w-4.5 text-emerald-600 mr-1.5 shrink-0" />
          <span>Tanya Status Verifikasi</span>
        </Button>
      </div>

    </div>
  );
}

export default function PendingPage() {
  return (
    <Suspense fallback={
      <div className="max-w-md mx-auto text-center py-20 px-4 text-xs text-muted-foreground">
        Memuat invoice pending...
      </div>
    }>
      <PendingPageContent />
    </Suspense>
  );
}
