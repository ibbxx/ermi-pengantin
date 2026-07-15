'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Landmark, QrCode, Copy, Check, ArrowRight, ShieldAlert, FileText, ChevronRight, Sparkles, RefreshCw } from 'lucide-react';
import { Booking } from '@/types';
import { db, useSettings } from '@/data/db';
import { uploadPaymentProof } from '@/lib/storage';
import EmptyState from '@/components/ui/EmptyState';
import Breadcrumb from '@/components/Breadcrumb';
import { useToast } from '@/components/ui/toast-simple';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams?.get('bookingId') || '';

  const [booking, setBooking] = useState<Booking | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [settings] = useSettings();

  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string>('');
  const [uploadError, setUploadError] = useState<string>('');

  // Retrieve booking from database
  useEffect(() => {
    if (!bookingId) return;
    db.getBookingById(bookingId).then((foundBooking) => {
      if (foundBooking) {
        setBooking(foundBooking);
      }
    }).catch(console.error);
  }, [bookingId]);

  const { toast } = useToast();

  const amountToPay = useMemo(() => {
    if (!booking) return 0;
    // Strip Currency formatting to get clean numbers
    const cleanNum = (str: string) => Number(str.replace(/[^0-9]/g, ''));
    
    if (booking.paymentType === 'dp') {
      return cleanNum(booking.depositRequired);
    }
    return cleanNum(booking.totalAmount);
  }, [booking]);

  const paymentSteps = useMemo(() => {
    if (!booking || !settings) return null;

    let method = booking.paymentMethod;
    if (method !== 'tf' && method !== 'qris') {
      method = settings.tfEnabled ? 'tf' : 'qris';
    }

    if (method === 'tf') {
      return {
        title: `Transfer Bank (${settings.tfBankName || 'Bank Transfer'})`,
        accountNumber: settings.tfAccountNumber || '',
        accountHolder: settings.tfAccountHolder || '',
        steps: [
          'Buka aplikasi Mobile Banking / Internet Banking atau ATM terdekat.',
          'Pilih menu transfer ke sesama bank atau transfer antar bank.',
          'Masukkan nomor rekening tujuan di atas.',
          `Pastikan nama pemilik rekening adalah "${settings.tfAccountHolder || ''}" dan nominal transfer sesuai.`,
          'Simpan bukti transfer Anda untuk diunggah di bawah.'
        ]
      };
    }

    return {
      title: 'QRIS Code',
      accountNumber: 'QRIS Code Ermi Pengantin',
      steps: [
        'Pindai/scan kode QRIS di bawah ini menggunakan aplikasi e-wallet (Gopay, OVO, Dana, ShopeePay) atau Mobile Banking.',
        'Masukkan nominal pembayaran sesuai dengan jumlah tagihan di bawah.',
        'Selesaikan transaksi dan simpan screenshot bukti sukses pembayaran.'
      ]
    };
  }, [booking, settings]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleCopy = () => {
    if (!paymentSteps) return;
    navigator.clipboard.writeText(paymentSteps.accountNumber);
    setCopiedText(true);
    toast('Nomor rekening berhasil disalin!', 'success');
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setUploadError('Hanya mendukung file gambar (JPEG, PNG, WEBP).');
        return;
      }
      setProofFile(file);
      setUploadError('');
      const previewUrl = URL.createObjectURL(file);
      setProofPreviewUrl(previewUrl);
    }
  };

  const handleRemoveFile = () => {
    setProofFile(null);
    if (proofPreviewUrl) {
      URL.revokeObjectURL(proofPreviewUrl);
      setProofPreviewUrl('');
    }
  };

  const handlePaySuccess = async () => {
    if (!booking) return;
    if (!proofFile) {
      setUploadError('Harap pilih dan unggah bukti transfer terlebih dahulu.');
      return;
    }

    setIsPaying(true);
    setUploadError('');

    try {
      // Compress and upload payment proof to Supabase storage (auto-compresses under 500 KB)
      const uploadedUrl = await uploadPaymentProof(proofFile);

      const updatedBooking: Booking = {
        ...booking,
        paymentStatus: 'paid' as const,
        bookingStatus: 'paid' as const,
        paymentProof: uploadedUrl
      };

      await db.saveBooking(updatedBooking);
      setIsPaying(false);
      router.push(`/payment/success?bookingId=${booking.id}`);
    } catch (err: any) {
      console.error(err);
      setIsPaying(false);
      setUploadError(err.message || 'Gagal mengunggah bukti pembayaran.');
    }
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col gap-2">
        <Breadcrumb customLastLabel={`Invoice: ${booking.invoiceNumber}`} />
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground sm:text-4xl">Pembayaran Aman</h1>
          <p className="text-xs text-muted-foreground">
            Selesaikan transfer pembayaran untuk mengunci reservasi tanggal Invoice <span className="font-bold text-foreground">{booking.invoiceNumber}</span>.
          </p>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Payment instructions & Upload area */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="font-serif text-lg">Instruksi Transfer Dana</CardTitle>
              <CardDescription>Selesaikan pembayaran mengikuti detail di bawah ini</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Payment Method specific display */}
              <div className="bg-secondary/15 p-6 rounded-2xl border border-border/60 flex flex-col items-center text-center space-y-4">
                
                {(() => {
                  let method = booking.paymentMethod;
                  if (method !== 'tf' && method !== 'qris') {
                    method = settings?.tfEnabled ? 'tf' : 'qris';
                  }

                  if (method === 'qris') {
                    return (
                      <>
                        <QrCode className="h-10 w-10 text-emerald-600" />
                        <span className="text-xs font-bold text-foreground tracking-wide uppercase">Pindai Kode QRIS</span>
                        <div className="bg-background p-3 rounded-2xl border border-border shadow-sm max-w-[200px] w-full">
                          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted/20 flex items-center justify-center">
                            {settings?.qrisImage ? (
                              <Image src={settings.qrisImage} alt="QRIS Code" fill className="object-contain" />
                            ) : (
                              <div className="p-4 text-[10px] text-muted-foreground font-bold uppercase text-center">QRIS Belum Diunggah</div>
                            )}
                          </div>
                        </div>
                      </>
                    );
                  }

                  return (
                    <>
                      <Landmark className="h-10 w-10 text-primary" />
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Rekening Tujuan Transfer</span>
                      
                      <div className="w-full max-w-md space-y-3 bg-background p-4 rounded-xl border border-border text-left text-xs">
                        <div className="flex justify-between border-b pb-2 border-border/40">
                          <span className="text-muted-foreground">Bank Tujuan:</span>
                          <span className="font-bold text-foreground">{settings?.tfBankName}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2 border-border/40 items-center">
                          <span className="text-muted-foreground">Nomor Rekening:</span>
                          <div className="flex items-center space-x-2 font-mono font-extrabold text-foreground text-sm tracking-wider">
                            <span>{settings?.tfAccountNumber}</span>
                            <button
                              onClick={handleCopy}
                              className="p-1 rounded bg-secondary hover:bg-secondary/80 text-foreground transition-colors cursor-pointer border border-border/40"
                              title="Salin Nomor Rekening"
                            >
                              {copiedText ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Atas Nama (A/N):</span>
                          <span className="font-bold text-foreground">{settings?.tfAccountHolder}</span>
                        </div>
                      </div>
                      {copiedText && <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">Nomor Rekening Berhasil Tersalin!</span>}
                    </>
                  );
                })()}

                <div className="text-xs text-muted-foreground">
                  Jumlah Transfer: <span className="text-lg font-bold text-primary block mt-0.5">{formatPrice(amountToPay)}</span>
                </div>
              </div>

              {/* Payment Steps */}
              {paymentSteps && (
                <div className="space-y-3 bg-muted/10 p-4 rounded-2xl border border-border/40">
                  <h4 className="font-bold text-foreground text-xs">Langkah Pembayaran {paymentSteps.title}:</h4>
                  <ol className="list-decimal pl-5 space-y-2 text-xs text-muted-foreground">
                    {paymentSteps.steps.map((step, idx) => (
                      <li key={idx} className="leading-relaxed font-light">{step}</li>
                    ))}
                  </ol>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upload Confirmation area */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="font-serif text-lg">Konfirmasi Pembayaran</CardTitle>
              <CardDescription>Unggah bukti transaksi agar pesanan Anda diverifikasi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-[11px] text-muted-foreground leading-normal font-light">
                Setelah selesai melakukan pembayaran, harap lakukan konfirmasi dengan mengunggah bukti transaksi di bawah ini. Tim kami akan melakukan verifikasi mutasi rekening Anda secara manual dalam kurun waktu 1x24 jam.
              </p>

              {/* Upload Container */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-foreground">
                  Unggah Bukti Transfer / Pembayaran <span className="text-destructive">*</span>
                </label>
                
                {!proofPreviewUrl ? (
                  <div className="border-2 border-dashed border-border rounded-xl p-6 bg-muted/15 hover:bg-muted/30 transition-all flex flex-col items-center justify-center cursor-pointer relative min-h-[120px]">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="text-center space-y-1.5">
                      <span className="text-xs font-bold text-primary block">Pilih File Bukti Bayar</span>
                      <span className="text-[10px] text-muted-foreground block">Mendukung JPEG, PNG, WEBP</span>
                    </div>
                  </div>
                ) : (
                  <div className="relative border border-border rounded-xl p-3 bg-card flex items-center gap-3">
                    <div className="relative w-14 h-18 rounded-lg overflow-hidden border border-border bg-muted flex-shrink-0">
                      <Image
                        src={proofPreviewUrl}
                        alt="Pratinjau Bukti Pembayaran"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{proofFile?.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {proofFile && `${(proofFile.size / 1024).toFixed(1)} KB` || ''}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="xs"
                      onClick={handleRemoveFile}
                      className="flex-shrink-0"
                    >
                      Hapus
                    </Button>
                  </div>
                )}
                {uploadError && (
                  <span className="text-[10px] text-destructive block font-bold">{uploadError}</span>
                )}
              </div>
            </CardContent>
            <CardFooter className="border-t bg-secondary/10 p-4">
              <Button
                onClick={handlePaySuccess}
                disabled={isPaying}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider h-10"
              >
                {isPaying ? (
                  <>
                    <RefreshCw className="size-4 animate-spin mr-1.5" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Check className="size-4 mr-1.5" />
                    Saya Sudah Transfer / Bayar
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* RIGHT COLUMN: Invoice summaries */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-border/60 shadow-lg text-xs">
            <CardHeader className="border-b pb-4">
              <CardTitle className="font-serif text-base">Rincian Invoice</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {/* Details Customer */}
              <div className="space-y-2.5 text-muted-foreground border-b border-border pb-4">
                <p className="flex justify-between">
                  <span>Nama Klien:</span>
                  <span className="font-bold text-foreground">{booking.customerName}</span>
                </p>
                <p className="flex justify-between">
                  <span>WhatsApp Kontak:</span>
                  <span className="font-bold text-foreground">+{booking.customerWhatsApp}</span>
                </p>
                <p className="flex justify-between">
                  <span>Tanggal Acara:</span>
                  <span className="font-bold text-foreground">{booking.eventDate}</span>
                </p>
                <p className="flex flex-col gap-0.5 pt-1">
                  <span>Lokasi Pelaksanaan Acara:</span>
                  <span className="font-bold text-foreground leading-normal">{booking.eventLocation}</span>
                </p>
              </div>

              {/* Services items list */}
              <div className="space-y-3.5 border-b border-border pb-4 max-h-40 overflow-y-auto pr-1">
                {booking.servicesSelected.dresses?.map((d) => (
                  <div key={d.id} className="text-xs">
                    <div className="flex justify-between font-bold text-foreground">
                      <span>Gaun: {d.name}</span>
                      <span>{formatPrice(d.price)}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground block mt-0.5">Ukuran: {d.size} • Warna: {d.color}</span>
                  </div>
                ))}

                {booking.servicesSelected.makeup && (
                  <div>
                    <div className="flex justify-between font-bold text-foreground">
                      <span>MUA: {booking.servicesSelected.makeup.name}</span>
                      <span>{formatPrice(booking.servicesSelected.makeup.price)}</span>
                    </div>
                  </div>
                )}

                {booking.servicesSelected.decor && (
                  <div>
                    <div className="flex justify-between font-bold text-foreground">
                      <span>Dekorasi: {booking.servicesSelected.decor.name}</span>
                      <span>{formatPrice(booking.servicesSelected.decor.price)}</span>
                    </div>
                  </div>
                )}

                {booking.servicesSelected.weddingPackage && (
                  <div>
                    <div className="flex justify-between font-bold text-foreground">
                      <span>Paket: {booking.servicesSelected.weddingPackage.name}</span>
                      <span>{formatPrice(booking.servicesSelected.weddingPackage.price)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Cost summaries */}
              <div className="space-y-2 text-muted-foreground border-b border-border pb-4">
                <div className="flex justify-between">
                  <span>Subtotal Jasa:</span>
                  <span className="font-semibold text-foreground">{booking.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Biaya Pengantaran/Transport:</span>
                  <span className="font-semibold text-foreground">{booking.additionalFees}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-foreground pt-2.5 border-t border-dashed border-border/40">
                  <span>Total Estimasi:</span>
                  <span className="text-primary">{booking.totalAmount}</span>
                </div>
              </div>

              {/* Amount to pay */}
              <div className="bg-secondary/15 p-3.5 rounded-xl space-y-1.5 text-[11px] text-muted-foreground">
                <div className="flex justify-between">
                  <span>Metode Pembayaran:</span>
                  <span className="font-bold text-foreground uppercase">{booking.paymentType === 'dp' ? 'Uang Muka (DP)' : 'Lunas'}</span>
                </div>
                <div className="flex justify-between font-bold text-foreground text-xs border-t border-dashed border-border/40 pt-1.5 mt-1">
                  <span>Jumlah Harus Dibayar:</span>
                  <span className="text-emerald-700 font-extrabold">{formatPrice(amountToPay)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-center border-t py-4 text-[10px] text-muted-foreground flex gap-1.5 items-center">
              <ShieldAlert className="size-4 text-primary shrink-0" />
              <span>Reservasi dilindungi sistem SSL Enkripsi</span>
            </CardFooter>
          </Card>
        </div>

      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-xs text-muted-foreground">
        Loading parameter checkout...
      </div>
    }>
      <CheckoutPageContent />
    </Suspense>
  );
}
