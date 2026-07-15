'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, 
  ShoppingBag, 
  FileText, 
  Calendar, 
  MessageSquare, 
  Search, 
  Clock, 
  CheckCircle2, 
  Phone, 
  MapPin, 
  Info,
  ChevronRight,
  RefreshCw,
  LogOut
} from 'lucide-react';
import { Booking } from '@/types';
import { supabase } from '@/lib/supabase';
import { useSettings } from '@/data/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Breadcrumb from '@/components/Breadcrumb';

// Simple mapping helper for row mapping since mapBookingFromDb isn't exported
function mapRowToBooking(row: any): Booking {
  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
    customerId: row.customer_id,
    customerName: row.customer_name,
    customerWhatsApp: row.customer_whatsapp,
    customerEmail: row.customer_email,
    customerAddress: row.customer_address,
    eventDate: row.event_date,
    eventLocation: row.event_location,
    eventType: row.event_type as any,
    servicesSelected: row.services_selected || {},
    notes: row.notes || '',
    subtotal: row.subtotal,
    additionalFees: row.additional_fees,
    depositRequired: row.deposit_required,
    totalAmount: row.total_amount,
    paymentType: row.payment_type as any,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status as any,
    bookingStatus: row.booking_status as any,
    paymentProof: row.payment_proof || undefined,
    createdAt: row.created_at
  };
}

export default function CustomerDashboard() {
  const router = useRouter();
  const [settings] = useSettings();

  // Search form state
  const [invoiceInput, setInvoiceInput] = useState('');
  const [whatsappInput, setWhatsappInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active booking loaded state
  const [booking, setBooking] = useState<Booking | null>(null);

  // Load search from session/localStorage
  useEffect(() => {
    const savedInvoice = localStorage.getItem('ermi_lookup_invoice');
    const savedWhatsapp = localStorage.getItem('ermi_lookup_whatsapp');
    if (savedInvoice && savedWhatsapp) {
      setInvoiceInput(savedInvoice);
      setWhatsappInput(savedWhatsapp);
      performLookup(savedInvoice, savedWhatsapp);
    }
  }, []);

  const performLookup = async (invoice: string, phone: string) => {
    if (!invoice.trim() || !phone.trim()) {
      setErrorMsg('Harap isi nomor invoice dan nomor WhatsApp Anda.');
      return;
    }

    setIsSearching(true);
    setErrorMsg(null);

    // Clean inputs
    const cleanInvoice = invoice.trim().toUpperCase();
    const cleanPhone = phone.trim().replace(/[^0-9]/g, '');

    try {
      // Look up in supabase
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('invoice_number', cleanInvoice)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setErrorMsg('Invoice tidak ditemukan. Silakan periksa kembali nomor invoice Anda.');
        setBooking(null);
      } else {
        const foundBooking = mapRowToBooking(data);
        
        // Match phone numbers (checking suffixes or exact match)
        const dbPhone = foundBooking.customerWhatsApp.replace(/[^0-9]/g, '');
        
        // Match if one contains another or ends with the same last 8 digits
        const match = dbPhone === cleanPhone || 
                      dbPhone.endsWith(cleanPhone) || 
                      cleanPhone.endsWith(dbPhone) ||
                      (dbPhone.length >= 8 && cleanPhone.length >= 8 && dbPhone.slice(-8) === cleanPhone.slice(-8));

        if (!match) {
          setErrorMsg('Nomor WhatsApp tidak cocok dengan data pemesanan invoice ini.');
          setBooking(null);
        } else {
          // Success! Save session
          localStorage.setItem('ermi_lookup_invoice', cleanInvoice);
          localStorage.setItem('ermi_lookup_whatsapp', foundBooking.customerWhatsApp);
          setBooking(foundBooking);
        }
      }
    } catch (err: any) {
      console.error('Lookup error:', err);
      setErrorMsg('Gagal melakukan pencarian. Silakan periksa koneksi internet Anda.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLookup(invoiceInput, whatsappInput);
  };

  const handleLogout = () => {
    localStorage.removeItem('ermi_lookup_invoice');
    localStorage.removeItem('ermi_lookup_whatsapp');
    setBooking(null);
    setInvoiceInput('');
    setWhatsappInput('');
    setErrorMsg(null);
  };

  const formatPrice = (price: string | number) => {
    if (typeof price === 'string') return price;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusConfig = (status: Booking['bookingStatus']) => {
    const statusMap = {
      pending: { label: 'Menunggu Verifikasi', variant: 'outline' as const, classes: 'border-amber-200 bg-amber-50/50 text-amber-800' },
      confirmed: { label: 'Dikonfirmasi', variant: 'secondary' as const, classes: 'border-blue-200 bg-blue-50/50 text-blue-800' },
      paid: { label: 'Pembayaran Diterima', variant: 'default' as const, classes: 'border-emerald-200 bg-emerald-50/50 text-emerald-800' },
      fitting: { label: 'Tahap Fitting', variant: 'default' as const, classes: 'border-purple-200 bg-purple-50/50 text-purple-800' },
      ready: { label: 'Siap Diambil', variant: 'default' as const, classes: 'border-indigo-200 bg-indigo-50/50 text-indigo-800' },
      completed: { label: 'Selesai', variant: 'outline' as const, classes: 'border-stone-300 bg-stone-50 text-stone-700' },
      cancelled: { label: 'Dibatalkan', variant: 'destructive' as const, classes: 'border-red-200 bg-red-50 text-red-700' }
    };
    return statusMap[status] || { label: status, variant: 'outline' as const, classes: 'border-stone-200 bg-stone-50 text-stone-600' };
  };

  const getTimelineSteps = (status: Booking['bookingStatus']) => {
    const steps = [
      { id: 'pending', label: 'Reservasi', desc: 'Menunggu Pembayaran' },
      { id: 'paid', label: 'Pembayaran', desc: 'DP/Lunas Terkonfirmasi' },
      { id: 'fitting', label: 'Fitting', desc: 'Ukur & Coba Gaun' },
      { id: 'ready', label: 'Siap', desc: 'Diambil / Dikirim' },
      { id: 'completed', label: 'Selesai', desc: 'Acara Berlangsung' }
    ];

    let currentStepIdx = 0;
    if (status === 'confirmed' || status === 'paid') currentStepIdx = 1;
    else if (status === 'fitting') currentStepIdx = 2;
    else if (status === 'ready') currentStepIdx = 3;
    else if (status === 'completed') currentStepIdx = 4;
    else if (status === 'cancelled') currentStepIdx = -1; // special case

    return { steps, currentStepIdx };
  };

  const handleWhatsAppConsult = () => {
    if (!booking) return;
    const text = encodeURIComponent(`Halo Admin Ermi Pengantin, saya ingin berkonsultasi mengenai status booking saya untuk Invoice ${booking.invoiceNumber}.`);
    window.open(`https://wa.me/${settings?.whatsappAdmin || '6281234567890'}?text=${text}`, '_blank');
  };

  // Compile list of services selected
  const getServicesNames = (item: Booking) => {
    const servicesNames = [];
    if (item.servicesSelected.weddingPackage) {
      servicesNames.push(item.servicesSelected.weddingPackage.name);
    } else {
      if (item.servicesSelected.dresses?.length) {
        servicesNames.push(`Sewa Gaun (${item.servicesSelected.dresses.map((d) => d.name).join(', ')})`);
      }
      if (item.servicesSelected.makeup) {
        servicesNames.push(`Makeup Artist (${item.servicesSelected.makeup.name})`);
      }
      if (item.servicesSelected.decor) {
        servicesNames.push(`Dekorasi (${item.servicesSelected.decor.name})`);
      }
    }
    return servicesNames;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col gap-2">
        <Breadcrumb customLastLabel={booking ? `Invoice: ${booking.invoiceNumber}` : 'Lacak Pemesanan'} />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Lacak Pemesanan</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Pantau jadwal fitting, koordinasi rias, dan status dekorasi hari bahagia Anda.
            </p>
          </div>
          {!booking && (
            <Button asChild size="lg" className="w-full sm:w-auto h-11 px-6">
              <Link href="/booking">Buat Reservasi Baru</Link>
            </Button>
          )}
        </div>
      </div>

      <Separator />

      {/* LOOKUP SCREEN (No booking loaded yet) */}
      {!booking ? (
        <div className="max-w-md mx-auto py-10">
          <Card className="border-border/60 shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 rounded-full bg-secondary/80 text-primary flex items-center justify-center mx-auto mb-4 border border-border/40">
                <Search className="size-5" />
              </div>
              <CardTitle className="font-serif text-2xl">Cari Invoice Anda</CardTitle>
              <CardDescription>
                Masukkan nomor invoice dan nomor WhatsApp yang digunakan saat reservasi untuk melihat detail status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearchSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="invoice" className="text-xs font-semibold text-foreground/80 block">Nomor Invoice</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-2.5 size-4 text-muted-foreground/60" />
                    <input
                      id="invoice"
                      type="text"
                      placeholder="Contoh: INV-2026-1234"
                      value={invoiceInput}
                      onChange={(e) => setInvoiceInput(e.target.value)}
                      className="w-full bg-muted/30 border border-border/80 rounded-xl py-2 px-3 pl-9 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/50 uppercase"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="whatsapp" className="text-xs font-semibold text-foreground/80 block">Nomor WhatsApp</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 size-4 text-muted-foreground/60" />
                    <input
                      id="whatsapp"
                      type="tel"
                      placeholder="Contoh: 081234567890 atau 6281234567890"
                      value={whatsappInput}
                      onChange={(e) => setWhatsappInput(e.target.value)}
                      className="w-full bg-muted/30 border border-border/80 rounded-xl py-2 px-3 pl-9 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/50"
                      required
                    />
                  </div>
                </div>

                {errorMsg && (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs p-3.5 rounded-xl flex items-start gap-2">
                    <Info className="size-4 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <Button type="submit" disabled={isSearching} className="w-full h-10 mt-2 text-xs uppercase tracking-wider font-bold">
                  {isSearching ? (
                    <>
                      <RefreshCw className="size-4 animate-spin mr-2" />
                      Mencari Reservasi...
                    </>
                  ) : (
                    <>
                      <Search className="size-4 mr-2" />
                      Lacak Booking
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="bg-secondary/20 justify-center p-4 border-t border-border/40 text-[10px] text-muted-foreground flex gap-1.5 items-center">
              <span>Detail fitting & status pembayaran ter-update otomatis</span>
            </CardFooter>
          </Card>
        </div>
      ) : (
        /* DASHBOARD WITH LOADED BOOKING */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Details */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Header info */}
            <div className="bg-card border rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center border border-primary/5">
                  <User className="size-6" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-foreground">Halo, {booking.customerName}!</h3>
                  <p className="text-xs text-muted-foreground">Detail jadwal & status kelengkapan pernikahan Anda</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
                  <LogOut className="size-3.5 mr-1" /> Lacak Lain
                </Button>
                <Button asChild size="sm">
                  <Link href="/booking"><PlusIcon className="size-3.5 mr-1" /> Booking Baru</Link>
                </Button>
              </div>
            </div>

            {/* Visual Timeline Stepper */}
            {booking.bookingStatus !== 'cancelled' && (
              <Card className="border-border/60 shadow-sm overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="font-serif text-base">Timeline Progress</CardTitle>
                  <CardDescription>Tahapan kelengkapan persiapan pesanan Anda</CardDescription>
                </CardHeader>
                <CardContent className="pb-8">
                  {(() => {
                    const { steps, currentStepIdx } = getTimelineSteps(booking.bookingStatus);
                    return (
                      <div className="relative pt-4">
                        {/* Horizontal track line for larger screens */}
                        <div className="absolute top-[38px] left-[10%] right-[10%] h-0.5 bg-muted hidden md:block">
                          <div 
                            className="h-full bg-primary transition-all duration-500" 
                            style={{ width: `${(currentStepIdx / (steps.length - 1)) * 100}%` }}
                          />
                        </div>

                        {/* Step items */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-4 relative z-10">
                          {steps.map((step, idx) => {
                            const isCompleted = idx <= currentStepIdx;
                            const isActive = idx === currentStepIdx;
                            
                            return (
                              <div key={step.id} className="flex md:flex-col items-center gap-4 md:gap-2 text-left md:text-center">
                                {/* Visual Ring */}
                                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                                  isCompleted 
                                    ? 'bg-primary border-primary text-primary-foreground scale-110 shadow-sm' 
                                    : 'bg-background border-muted text-muted-foreground'
                                }`}>
                                  {isCompleted ? <CheckCircle2 className="size-4" /> : <span className="text-xs font-mono font-bold">{idx + 1}</span>}
                                </div>
                                
                                {/* Label Text */}
                                <div>
                                  <p className={`text-xs font-bold leading-tight ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                                    {step.label}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-normal">
                                    {step.desc}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            )}

            {/* Cancelled Alert */}
            {booking.bookingStatus === 'cancelled' && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs p-4 rounded-3xl flex items-start gap-3">
                <Info className="size-5 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-sm">Pemesanan Dibatalkan</p>
                  <p className="text-destructive/80 leading-relaxed text-[11px]">
                    Status pemesanan ini telah ditandai sebagai batal. Jika ini adalah kesalahan atau Anda membutuhkan restitusi uang muka, silakan langsung menghubungi tim butik kami via tombol WhatsApp.
                  </p>
                </div>
              </div>
            )}

            {/* Booking Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Event details Card */}
              <Card className="border-border/60 shadow-sm">
                <CardHeader>
                  <CardTitle className="font-serif text-base flex items-center gap-1.5">
                    <Calendar className="size-4 text-primary" /> Detail Acara
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3.5 text-xs text-muted-foreground">
                  <div className="flex justify-between border-b pb-2 border-border/40">
                    <span>Nomor Invoice:</span>
                    <span className="font-bold text-foreground">{booking.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2 border-border/40">
                    <span>Tanggal Pelaksanaan:</span>
                    <span className="font-bold text-foreground">{booking.eventDate}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2 border-border/40">
                    <span>Jenis Acara:</span>
                    <span className="font-bold text-foreground uppercase">{booking.eventType}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span>Tempat / Lokasi Acara:</span>
                    <span className="font-bold text-foreground flex gap-1 items-start mt-0.5">
                      <MapPin className="size-3.5 shrink-0 mt-0.5 text-primary" />
                      {booking.eventLocation}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Customer details Card */}
              <Card className="border-border/60 shadow-sm">
                <CardHeader>
                  <CardTitle className="font-serif text-base flex items-center gap-1.5">
                    <User className="size-4 text-primary" /> Data Pelanggan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3.5 text-xs text-muted-foreground">
                  <div className="flex justify-between border-b pb-2 border-border/40">
                    <span>Nama Klien:</span>
                    <span className="font-bold text-foreground">{booking.customerName}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2 border-border/40">
                    <span>WhatsApp Kontak:</span>
                    <span className="font-bold text-foreground">{booking.customerWhatsApp}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2 border-border/40">
                    <span>Alamat Email:</span>
                    <span className="font-bold text-foreground">{booking.customerEmail || '-'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span>Alamat Penjemputan / Fitting:</span>
                    <span className="font-bold text-foreground mt-0.5 leading-relaxed">{booking.customerAddress}</span>
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* List Services Items */}
            <Card className="border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle className="font-serif text-base flex items-center gap-1.5">
                  <ShoppingBag className="size-4 text-primary" /> Layanan Dipesan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Package All-In-One if selected */}
                {booking.servicesSelected.weddingPackage && (
                  <div className="bg-secondary/30 border border-border/40 rounded-2xl p-4 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Paket Utama</span>
                      <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary text-[10px]">Lengkap</Badge>
                    </div>
                    <p className="font-serif text-lg font-bold text-foreground">{booking.servicesSelected.weddingPackage.name}</p>
                    <p className="text-xs text-muted-foreground leading-normal">
                      Termasuk busana pengantin lengkap, tata rias akad & resepsi, serta instalasi panggung pelaminan.
                    </p>
                  </div>
                )}

                {/* ala carte list */}
                {(!booking.servicesSelected.weddingPackage) && (
                  <div className="divide-y divide-border/40">
                    
                    {/* Dresses */}
                    {booking.servicesSelected.dresses && booking.servicesSelected.dresses.length > 0 && (
                      <div className="py-3 first:pt-0">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Busana Pengantin</span>
                        {booking.servicesSelected.dresses.map((d) => (
                          <div key={d.id} className="flex gap-4 items-center bg-muted/15 border border-border/20 rounded-xl p-3">
                            {d.image && (
                              <div className="relative w-12 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                                <img src={d.image} alt={d.name} className="w-full h-full object-cover" />
                              </div>
                            )}
                            <div>
                              <p className="text-xs font-bold text-foreground">{d.name}</p>
                              <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                                <span>Ukuran: <b className="text-foreground">{d.size}</b></span>
                                <span>•</span>
                                <span>Warna: <b className="text-foreground">{d.color}</b></span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Makeup */}
                    {booking.servicesSelected.makeup && (
                      <div className="py-3">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Tata Rias & Makeup</span>
                        <div className="bg-muted/15 border border-border/20 rounded-xl p-3 text-xs font-bold text-foreground">
                          {booking.servicesSelected.makeup.name}
                        </div>
                      </div>
                    )}

                    {/* Decor */}
                    {booking.servicesSelected.decor && (
                      <div className="py-3">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Dekorasi Pelaminan</span>
                        <div className="bg-muted/15 border border-border/20 rounded-xl p-3 text-xs font-bold text-foreground">
                          {booking.servicesSelected.decor.name}
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {booking.notes && (
                  <div className="bg-muted/20 border rounded-2xl p-4 text-xs text-muted-foreground leading-relaxed mt-4">
                    <span className="font-bold text-foreground block mb-1">Catatan Tambahan:</span>
                    “{booking.notes}”
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

          {/* Right column sidebar (Cost / payment status & WhatsApp CTA) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Cost card */}
            <Card className="border-border/60 shadow-lg overflow-hidden">
              <CardHeader className="bg-secondary/15 pb-4 border-b border-border/40">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Status Pembayaran</span>
                  <Badge className={getStatusConfig(booking.bookingStatus).classes}>
                    {getStatusConfig(booking.bookingStatus).label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2.5 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Subtotal Jasa:</span>
                    <span className="font-medium text-foreground">{booking.subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Biaya Transportasi:</span>
                    <span className="font-medium text-foreground">{booking.additionalFees}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-foreground border-t border-dashed pt-2.5 mt-2">
                    <span>Total Estimasi:</span>
                    <span className="text-primary">{booking.totalAmount}</span>
                  </div>
                </div>

                <Separator />

                {/* Amount to pay based on status */}
                <div className="bg-muted/30 border border-border/40 p-4 rounded-2xl space-y-2 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Tipe Pembayaran:</span>
                    <span className="font-bold text-foreground uppercase">{booking.paymentType === 'dp' ? 'Uang Muka (DP)' : 'Lunas'}</span>
                  </div>
                  <div className="flex justify-between border-t border-dashed border-border/30 pt-2 mt-1.5 text-sm font-extrabold text-foreground">
                    <span>Jumlah yang Harus Dibayar:</span>
                    <span className="text-emerald-700">
                      {booking.paymentType === 'dp' ? booking.depositRequired : booking.totalAmount}
                    </span>
                  </div>
                  {booking.paymentStatus === 'pending' && (
                    <div className="text-[10px] text-amber-600 bg-amber-50/50 border border-amber-100 p-2.5 rounded-xl mt-3 flex items-start gap-1.5 leading-normal">
                      <Clock className="size-3.5 shrink-0 mt-0.5" />
                      <span>
                        Selesaikan pembayaran agar jadwal tanggal sewa Anda terkunci aman dari booking klien lain.
                      </span>
                    </div>
                  )}
                </div>

                {/* CTA actions */}
                <div className="space-y-3 pt-2">
                  {booking.paymentStatus === 'pending' && (
                    <Button asChild className="w-full h-11 text-xs uppercase tracking-wider font-bold">
                      <Link href={`/checkout?bookingId=${booking.id}`}>
                        Proses Pembayaran Saya <ChevronRight className="size-4 ml-1" />
                      </Link>
                    </Button>
                  )}
                  
                  <Button variant="outline" onClick={handleWhatsAppConsult} className="w-full h-11 text-xs font-semibold flex items-center justify-center gap-1.5">
                    <MessageSquare className="size-4 text-emerald-600 shrink-0" />
                    <span>WhatsApp Admin Butik</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Guarantee info card */}
            <div className="bg-secondary/10 border border-border/30 rounded-3xl p-5 text-[11px] text-muted-foreground leading-normal space-y-3">
              <h4 className="font-serif font-bold text-foreground text-xs flex items-center gap-1.5">
                <Info className="size-4 text-primary" /> Panduan Pelanggan
              </h4>
              <ul className="space-y-2 list-disc pl-4">
                <li>
                  Fitting ukuran gaun dilakukan di butik H-7 secara gratis dengan membawa cetakan invoice ini.
                </li>
                <li>
                  Nomor WhatsApp yang terdaftar digunakan untuk koordinasi fitting dan notifikasi pengiriman.
                </li>
                <li>
                  Jaminan (Refundable Deposit) dikembalikan lunas H+1 setelah pengembalian gaun lolos inspeksi kebersihan.
                </li>
              </ul>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
