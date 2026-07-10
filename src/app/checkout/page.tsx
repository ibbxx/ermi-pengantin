'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CreditCard, Landmark, QrCode, AlertCircle, Copy, Check, ArrowRight, ShieldAlert } from 'lucide-react';
import { Booking } from '@/types';
import { db } from '@/data/db';
import EmptyState from '@/components/ui/EmptyState';

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams?.get('bookingId') || '';

  const [booking, setBooking] = useState<Booking | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  // Retrieve booking from database
  useEffect(() => {
    if (!bookingId) return;
    db.getBookingById(bookingId).then((foundBooking) => {
      if (foundBooking) {
        setBooking(foundBooking);
      }
    }).catch(console.error);
  }, [bookingId]);

  const paymentSteps = useMemo(() => {
    if (!booking) return null;

    const method = booking.paymentMethod;
    if (method === 'va_bca') {
      return {
        title: 'Virtual Account BCA',
        accountNumber: '8273000812345678',
        steps: [
          'Buka aplikasi BCA Mobile / KlikBCA / ATM BCA.',
          'Pilih menu "Transfer" -> "BCA Virtual Account".',
          'Masukkan nomor virtual account di atas.',
          'Pastikan nama penerima adalah "ELIKA ATELIER WEDDING" dan nominal tagihan sesuai.',
          'Masukkan PIN Anda dan simpan bukti transfer.'
        ]
      };
    }
    if (method === 'va_mandiri') {
      return {
        title: 'Virtual Account Mandiri',
        accountNumber: '896081234567890',
        steps: [
          'Buka aplikasi Livin\' by Mandiri / ATM Mandiri.',
          'Pilih menu "Bayar" -> "Multi Payment" / "Penyedia Jasa".',
          'Masukkan kode instansi "70012" (Elika Wedding).',
          'Masukkan nomor virtual account di atas.',
          'Periksa detail tagihan, masukkan PIN, dan selesaikan transaksi.'
        ]
      };
    }
    if (method === 'gopay') {
      return {
        title: 'QRIS Gopay / ShopeePay / OVO',
        accountNumber: 'Elika Wedding QRIS',
        steps: [
          'Pindai kode QRIS di butik atau layar ini menggunakan aplikasi e-wallet Anda.',
          'Masukkan nominal pembayaran persis sesuai tagihan.',
          'Klik bayar, masukkan PIN e-wallet Anda, dan transaksi selesai secara instan.'
        ]
      };
    }
    return {
      title: 'Kartu Kredit (Visa/Mastercard)',
      accountNumber: 'Simulasi Kartu Kredit',
      steps: [
        'Masukkan nomor kartu kredit 16 digit pada panel simulasi.',
        'Masukkan tanggal kedaluwarsa kartu dan kode keamanan CVV.',
        'Transaksi akan diproses secara real-time dan terotentikasi 3D Secure.'
      ]
    };
  }, [booking]);

  const handleCopy = () => {
    if (!paymentSteps) return;
    navigator.clipboard.writeText(paymentSteps.accountNumber);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const amountToPay = useMemo(() => {
    if (!booking) return 0;
    // Strip Currency formatting to get clean numbers
    const cleanNum = (str: string) => Number(str.replace(/[^0-9]/g, ''));
    
    if (booking.paymentType === 'dp') {
      return cleanNum(booking.depositRequired);
    }
    return cleanNum(booking.totalAmount);
  }, [booking]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Simulate Payment Success
  const handlePaySuccess = () => {
    if (!booking) return;
    setIsPaying(true);

    const updatedBooking: Booking = {
      ...booking,
      paymentStatus: 'paid' as const,
      bookingStatus: 'paid' as const // confirms booking
    };

    db.saveBooking(updatedBooking)
      .then(() => {
        setIsPaying(false);
        router.push(`/payment/success?bookingId=${booking.id}`);
      })
      .catch((err) => {
        console.error(err);
        setIsPaying(false);
        alert('Gagal memperbarui status pembayaran.');
      });
  };

  // Simulate Payment Failed
  const handlePayFailed = () => {
    if (!booking) return;
    setIsPaying(true);

    const updatedBooking: Booking = {
      ...booking,
      paymentStatus: 'failed' as const,
      bookingStatus: 'cancelled' as const
    };

    db.saveBooking(updatedBooking)
      .then(() => {
        setIsPaying(false);
        router.push(`/payment/failed?bookingId=${booking.id}`);
      })
      .catch((err) => {
        console.error(err);
        setIsPaying(false);
        alert('Gagal memperbarui status pembayaran.');
      });
  };

  // Simulate Payment Pending
  const handlePayPending = () => {
    if (!booking) return;
    router.push(`/payment/pending?bookingId=${booking.id}`);
  };

  if (!bookingId || !booking) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <EmptyState
          title="Checkout Tidak Valid"
          description="Maaf, ID booking tidak ditemukan. Silakan isi ulang formulir pemesanan."
          actionText="Kembali ke Booking"
          onAction={() => router.push('/booking')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Title */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="text-3xl font-serif font-bold text-charcoal">Pembayaran Aman</h1>
        <p className="text-xs text-stone-muted">
          Reservasi Anda telah terdaftar dengan nomor invoice <span className="font-bold text-charcoal">{booking.invoiceNumber}</span>. Silakan selesaikan pembayaran.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Payment details & QR/VA instructions */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-gold-light/20 shadow-sm space-y-6">
          <h3 className="font-serif font-bold text-lg text-charcoal pb-2 border-b border-gold-light/10">
            Instruksi Transfer Dana
          </h3>

          {/* Payment Method specific display */}
          <div className="bg-ivory p-6 rounded-2xl border border-gold-light/10 flex flex-col items-center text-center space-y-4">
            
            {/* Visual Icons */}
            {booking.paymentMethod === 'gopay' ? (
              <>
                <QrCode className="h-12 w-12 text-emerald-600" />
                <span className="text-xs font-bold text-charcoal">PINDAI KODE QRIS DI BAWAH INI</span>
                {/* QR Code Placeholder */}
                <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm">
                  <div className="w-40 h-40 bg-stone-100 flex items-center justify-center border border-dashed border-stone-300">
                    <span className="text-[10px] text-stone-400 font-bold uppercase">ELIKA QRIS CODE</span>
                  </div>
                </div>
              </>
            ) : booking.paymentMethod === 'credit_card' ? (
              <>
                <CreditCard className="h-12 w-12 text-gold-dark" />
                <span className="text-xs font-bold text-charcoal">INTEGRASI KARTU KREDIT SECURE</span>
                <p className="text-[11px] text-stone-500 max-w-md">
                  Menggunakan enkripsi 256-bit standar PCI-DSS. Pembayaran kartu Anda aman, cepat, dan terverifikasi instan.
                </p>
              </>
            ) : (
              <>
                <Landmark className="h-12 w-12 text-gold-dark" />
                <span className="text-xs font-bold text-stone-500 uppercase">NOMOR REKENING VIRTUAL ACCOUNT</span>
                
                <div className="flex items-center space-x-3 bg-white py-3 px-6 rounded-xl border border-stone-200">
                  <span className="text-lg font-mono font-extrabold text-charcoal tracking-wider">
                    {paymentSteps?.accountNumber}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors"
                    title="Salin Nomor VA"
                  >
                    {copiedText ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                {copiedText && <span className="text-[10px] text-emerald-600 font-bold">Nomor Virtual Account Tersalin!</span>}
              </>
            )}

            <div className="text-xs text-stone-500">
              Jumlah Transfer: <span className="text-lg font-bold text-gold-dark">{formatPrice(amountToPay)}</span>
            </div>
          </div>

          {/* Payment Steps */}
          {paymentSteps && (
            <div className="space-y-3">
              <h4 className="font-semibold text-charcoal text-xs">Langkah Pembayaran {paymentSteps.title}:</h4>
              <ol className="list-decimal pl-5 space-y-2 text-xs text-stone-600">
                {paymentSteps.steps.map((step, idx) => (
                  <li key={idx} className="leading-relaxed">{step}</li>
                ))}
              </ol>
            </div>
          )}

          {/* Simulated Gateway action buttons */}
          <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-5 space-y-4">
            <h4 className="font-serif font-bold text-sm text-amber-800 flex items-center gap-1.5">
              <AlertCircle className="h-4.5 w-4.5 text-amber-600" /> Simulasi Payment Gateway
            </h4>
            <p className="text-[11px] text-amber-700/80 leading-normal">
              Tombol di bawah ini menyimulasikan respon dari API gerbang pembayaran pihak ketiga (seperti Midtrans/Xendit) ketika pembayaran sukses, pending, atau gagal.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={handlePaySuccess}
                disabled={isPaying}
                className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs tracking-wider transition-colors shadow-sm flex justify-center items-center gap-1.5"
              >
                {isPaying ? 'Memproses...' : 'Simulasi Bayar Sukses'}
              </button>
              <button
                onClick={handlePayPending}
                disabled={isPaying}
                className="py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold text-xs tracking-wider transition-colors shadow-sm flex justify-center items-center"
              >
                Simulasi Bayar Pending
              </button>
              <button
                onClick={handlePayFailed}
                disabled={isPaying}
                className="py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-xs tracking-wider transition-colors shadow-sm flex justify-center items-center"
              >
                Simulasi Bayar Gagal
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Order Invoices summary */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-gold-light/20 shadow-sm space-y-5 text-xs">
          <h3 className="font-serif font-bold text-base text-charcoal border-b border-gold-light/10 pb-3">
            Rincian Invoice
          </h3>

          {/* Details Customer */}
          <div className="space-y-1.5 text-stone-600 border-b border-gold-light/10 pb-3">
            <p className="flex justify-between">
              <span>Nama Klien:</span>
              <span className="font-bold text-charcoal">{booking.customerName}</span>
            </p>
            <p className="flex justify-between">
              <span>WhatsApp:</span>
              <span className="font-bold text-charcoal">{booking.customerWhatsApp}</span>
            </p>
            <p className="flex justify-between">
              <span>Tanggal Event:</span>
              <span className="font-bold text-charcoal">{booking.eventDate}</span>
            </p>
            <p className="flex flex-col">
              <span className="mb-0.5">Lokasi Venue:</span>
              <span className="font-bold text-charcoal leading-relaxed">{booking.eventLocation}</span>
            </p>
          </div>

          {/* Services breakdown */}
          <div className="space-y-3.5 border-b border-gold-light/10 pb-3 max-h-40 overflow-y-auto">
            {booking.servicesSelected.dresses?.map((d) => (
              <div key={d.id}>
                <div className="flex justify-between font-bold text-charcoal">
                  <span>Sewa Gaun: {d.name}</span>
                  <span>{formatPrice(d.price)}</span>
                </div>
                <span className="text-[10px] text-stone-500">Ukuran: {d.size} • Warna: {d.color}</span>
              </div>
            ))}

            {booking.servicesSelected.makeup && (
              <div>
                <div className="flex justify-between font-bold text-charcoal">
                  <span>MUA: {booking.servicesSelected.makeup.name}</span>
                  <span>{formatPrice(booking.servicesSelected.makeup.price)}</span>
                </div>
              </div>
            )}

            {booking.servicesSelected.decor && (
              <div>
                <div className="flex justify-between font-bold text-charcoal">
                  <span>Dekorasi: {booking.servicesSelected.decor.name}</span>
                  <span>{formatPrice(booking.servicesSelected.decor.price)}</span>
                </div>
              </div>
            )}

            {booking.servicesSelected.weddingPackage && (
              <div>
                <div className="flex justify-between font-bold text-charcoal">
                  <span>Paket: {booking.servicesSelected.weddingPackage.name}</span>
                  <span>{formatPrice(booking.servicesSelected.weddingPackage.price)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Cost Summary */}
          <div className="space-y-2 border-b border-gold-light/10 pb-3 text-stone-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-bold text-charcoal">{booking.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Biaya Pengantaran:</span>
              <span className="font-bold text-charcoal">{booking.additionalFees}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-charcoal pt-1.5 border-t border-dashed border-gold-light/10">
              <span>Total Estimasi:</span>
              <span className="text-gold-dark">{booking.totalAmount}</span>
            </div>
          </div>

          {/* Billing Type Details */}
          <div className="bg-ivory p-3.5 rounded-xl space-y-1.5 text-[11px] text-stone-600">
            <div className="flex justify-between">
              <span>Metode Pembayaran:</span>
              <span className="font-bold text-charcoal uppercase">{booking.paymentType === 'dp' ? 'Uang Muka (DP)' : 'Lunas'}</span>
            </div>
            <div className="flex justify-between font-bold text-charcoal text-xs border-t border-dashed border-gold-light/15 pt-1.5">
              <span>Jumlah Harus Dibayar:</span>
              <span className="text-emerald-700">{formatPrice(amountToPay)}</span>
            </div>
          </div>

          {/* Security stamp */}
          <div className="flex justify-center items-center gap-1.5 text-[10px] text-stone-400">
            <ShieldAlert className="h-4 w-4 text-gold-dark" />
            <span>Reservasi diamankan oleh sistem enkripsi.</span>
          </div>

        </div>

      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-xs text-stone-500">
        Loading parameter checkout...
      </div>
    }>
      <CheckoutPageContent />
    </Suspense>
  );
}
