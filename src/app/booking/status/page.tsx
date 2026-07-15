'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock3, Copy, MessageCircle, Upload } from 'lucide-react';
import type { BookingStatus, PaymentStatus, PaymentType } from '@/types';

const inputClass = 'w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/15';

interface CustomerBooking {
  id: string; invoiceNumber: string; customerName: string; eventDate: string; eventLocation: string; eventType: string;
  servicesSelected: Record<string, unknown>; subtotal: number; additionalFees: number; depositRequired: number; totalAmount: number;
  paymentType: PaymentType; paymentMethod: string; paymentStatus: PaymentStatus; bookingStatus: BookingStatus;
  paymentDueAt?: string; rentalStart?: string; rentalEnd?: string; createdAt: string;
  paymentSubmissions: Array<{ id: string; payment_type: PaymentType; amount: number; status: string; rejection_reason?: string; created_at: string }>;
  paymentInstructions: null | { whatsapp_admin: string; tf_enabled: boolean; tf_bank_name: string; tf_account_number: string; tf_account_holder: string; qris_enabled: boolean; qris_image: string };
}

const BOOKING_LABELS: Record<BookingStatus, string> = {
  submitted: 'Permintaan terkirim', pending: 'Permintaan terkirim', confirmed: 'Dikonfirmasi', paid: 'Pembayaran diterima',
  fitting: 'Tahap fitting', ready: 'Siap diambil', completed: 'Selesai', declined: 'Tidak tersedia', cancelled: 'Dibatalkan',
};
const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  not_due: 'Belum ditagihkan', awaiting_payment: 'Menunggu pembayaran', under_review: 'Menunggu verifikasi',
  partially_paid: 'DP diterima', paid: 'Lunas', rejected: 'Bukti ditolak', pending: 'Menunggu pembayaran', failed: 'Bukti ditolak',
};

function money(value: number) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value); }

export default function BookingStatusPage() {
  const [booking, setBooking] = useState<CustomerBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [invoice, setInvoice] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [proof, setProof] = useState<File | null>(null);
  const [paymentType, setPaymentType] = useState<PaymentType>('dp');
  const [paymentMethod, setPaymentMethod] = useState('tf');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    const response = await fetch('/api/customer/bookings/current', { cache: 'no-store' });
    const data = await response.json() as { booking?: CustomerBooking; error?: string };
    if (response.ok && data.booking) {
      setBooking(data.booking);
      const approved = data.booking.paymentSubmissions
        .filter((item) => item.status === 'approved')
        .reduce((sum, item) => sum + Number(item.amount), 0);
      setPaymentType(approved > 0 ? 'settlement' : 'dp');
      setPaymentMethod(data.booking.paymentInstructions?.tf_enabled ? 'tf' : 'qris');
    } else setBooking(null);
    setLoading(false);
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- initial cookie-backed API synchronization belongs after mount.
  useEffect(() => { void load(); }, [load]);

  const canPay = booking && ['confirmed', 'fitting', 'ready'].includes(booking.bookingStatus)
    && ['awaiting_payment', 'rejected', 'partially_paid'].includes(booking.paymentStatus);
  const approvedAmount = useMemo(() => booking?.paymentSubmissions.filter((item) => item.status === 'approved').reduce((sum, item) => sum + item.amount, 0) || 0, [booking]);

  const lookup = async (event: React.FormEvent) => {
    event.preventDefault(); setSubmitting(true); setError('');
    const response = await fetch('/api/customer/access/lookup', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ invoiceNumber: invoice, whatsapp }) });
    const data = await response.json() as { error?: string };
    if (!response.ok) setError(data.error || 'Data booking tidak ditemukan atau tidak cocok.');
    else await load();
    setSubmitting(false);
  };

  const upload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!booking || !proof) return;
    setSubmitting(true); setError('');
    const form = new FormData(); form.set('proof', proof); form.set('paymentType', paymentType); form.set('paymentMethod', paymentMethod);
    const response = await fetch(`/api/customer/bookings/${booking.id}/payment-proofs`, { method: 'POST', body: form });
    const data = await response.json() as { error?: string };
    if (!response.ok) setError(data.error || 'Bukti gagal dikirim.');
    else { setProof(null); await load(); }
    setSubmitting(false);
  };

  if (loading) return <main className="mx-auto max-w-4xl px-4 py-16 text-center text-sm text-stone-500">Memuat status booking…</main>;

  if (!booking) return (
    <main className="mx-auto max-w-md px-4 py-12">
      <form onSubmit={lookup} className="space-y-5 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
        <div><h1 className="font-serif text-2xl font-bold text-charcoal">Cek Status Booking</h1><p className="mt-1 text-xs text-stone-500">Masukkan invoice dan WhatsApp yang sama persis dengan pengajuan.</p></div>
        {error ? <p role="alert" className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700">{error}</p> : null}
        <label><span className="mb-1 block text-xs font-bold">Nomor invoice</span><input autoFocus className={inputClass} value={invoice} onChange={(e) => setInvoice(e.target.value)} placeholder="EP-202607-…" required /></label>
        <label><span className="mb-1 block text-xs font-bold">Nomor WhatsApp</span><input className={inputClass} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="0812…" inputMode="tel" required /></label>
        <button disabled={submitting} className="w-full rounded-xl bg-charcoal px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{submitting ? 'Memeriksa…' : 'Buka status booking'}</button>
      </form>
    </main>
  );

  const waMessage = `Halo Admin Ermi Pengantin, saya ingin menanyakan booking ${booking.invoiceNumber}. Status saat ini: ${BOOKING_LABELS[booking.bookingStatus]}, pembayaran: ${PAYMENT_LABELS[booking.paymentStatus]}.`;
  const adminWa = booking.paymentInstructions?.whatsapp_admin || '';
  const timeline: BookingStatus[] = ['submitted', 'confirmed', 'fitting', 'ready', 'completed'];
  const currentIndex = timeline.indexOf(booking.bookingStatus === 'pending' ? 'submitted' : booking.bookingStatus === 'paid' ? 'confirmed' : booking.bookingStatus);

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-4 rounded-3xl bg-charcoal p-6 text-white sm:flex-row sm:items-end sm:justify-between"><div><span className="text-[10px] font-bold uppercase tracking-widest text-stone-300">Status booking</span><h1 className="mt-1 font-mono text-2xl font-black">{booking.invoiceNumber}</h1><p className="mt-2 text-sm text-stone-300">{booking.customerName} · {booking.eventType} · {booking.eventDate}</p></div><div className="rounded-xl bg-white/10 px-4 py-3"><p className="text-xs text-stone-300">Status saat ini</p><strong>{BOOKING_LABELS[booking.bookingStatus]}</strong></div></header>
      {error ? <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p> : null}
      {['declined', 'cancelled'].includes(booking.bookingStatus) ? <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">Booking ini {booking.bookingStatus === 'declined' ? 'belum dapat dipenuhi' : 'telah dibatalkan'} dan tidak dapat menerima pembayaran.</div> : null}
      <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7"><h2 className="font-serif text-xl font-bold">Perjalanan pesanan</h2><ol className="mt-5 grid gap-3 sm:grid-cols-5">{timeline.map((status, index) => <li key={status} className={`rounded-xl border p-3 text-xs ${index <= currentIndex ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-stone-200 text-stone-400'}`}><div className="mb-2">{index <= currentIndex ? <CheckCircle2 className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}</div><strong>{BOOKING_LABELS[status]}</strong></li>)}</ol></section>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <section className="space-y-4 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7"><h2 className="font-serif text-xl font-bold">Rincian</h2><Info label="Acara" value={`${booking.eventType} · ${booking.eventDate}`} /><Info label="Lokasi" value={booking.eventLocation} />{booking.rentalStart ? <Info label="Periode sewa" value={`${booking.rentalStart} s.d. ${booking.rentalEnd}`} /> : null}<div className="border-t border-stone-100 pt-4"><Info label="Total final" value={money(booking.totalAmount)} strong /><Info label="Sudah diverifikasi" value={money(approvedAmount)} /><Info label="Status pembayaran" value={PAYMENT_LABELS[booking.paymentStatus]} /></div></section>
        <section className="space-y-4 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7"><h2 className="font-serif text-xl font-bold">Pembayaran</h2>
          {!booking.paymentInstructions ? <p className="rounded-xl bg-blue-50 p-4 text-sm text-blue-800">Instruksi pembayaran akan muncul setelah admin mengonfirmasi ketersediaan.</p> : null}
          {booking.paymentInstructions && booking.paymentStatus === 'under_review' ? <p className="rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">Bukti sudah diterima dan sedang diverifikasi admin. Mengunggah bukti tidak otomatis berarti pembayaran lunas.</p> : null}
          {booking.paymentInstructions && canPay ? <form onSubmit={upload} className="space-y-4">
            <label><span className="mb-1 block text-xs font-bold">Jenis pembayaran</span><select className={inputClass} value={paymentType} onChange={(e) => setPaymentType(e.target.value as PaymentType)}>{approvedAmount === 0 ? <option value="dp">DP — {money(booking.depositRequired)}</option> : null}{approvedAmount === 0 ? <option value="full">Lunas — {money(booking.totalAmount)}</option> : null}{approvedAmount > 0 ? <option value="settlement">Pelunasan — {money(Math.max(0, booking.totalAmount - approvedAmount))}</option> : null}</select></label>
            <label><span className="mb-1 block text-xs font-bold">Metode</span><select className={inputClass} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>{booking.paymentInstructions.tf_enabled ? <option value="tf">Transfer bank</option> : null}{booking.paymentInstructions.qris_enabled ? <option value="qris">QRIS</option> : null}</select></label>
            {paymentMethod === 'tf' && booking.paymentInstructions.tf_enabled ? <div className="rounded-xl bg-stone-50 p-4 text-sm"><strong>{booking.paymentInstructions.tf_bank_name}</strong><p className="mt-1 font-mono text-lg">{booking.paymentInstructions.tf_account_number}</p><p className="text-xs text-stone-500">a.n. {booking.paymentInstructions.tf_account_holder}</p><button type="button" onClick={() => void navigator.clipboard.writeText(booking.paymentInstructions?.tf_account_number || '')} className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-gold-deep"><Copy className="h-3.5 w-3.5" /> Salin rekening</button></div> : null}
            <label className="block cursor-pointer rounded-xl border border-dashed border-stone-300 p-4 text-center text-xs font-bold hover:border-gold"><Upload className="mx-auto mb-2 h-5 w-5" />{proof ? proof.name : 'Pilih bukti JPEG, PNG, atau WebP (maks. 5 MB)'}<input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setProof(e.target.files?.[0] || null)} /></label>
            <button disabled={!proof || submitting} className="w-full rounded-xl bg-gold px-4 py-3 text-sm font-bold text-white disabled:opacity-40">{submitting ? 'Mengirim…' : 'Kirim untuk diverifikasi'}</button>
          </form> : null}
          {booking.paymentSubmissions.length ? <div className="border-t border-stone-100 pt-4"><h3 className="text-xs font-bold uppercase text-stone-500">Riwayat bukti</h3><ul className="mt-2 space-y-2">{booking.paymentSubmissions.map((item) => <li key={item.id} className="rounded-xl bg-stone-50 p-3 text-xs"><div className="flex justify-between"><strong>{item.payment_type.toUpperCase()} · {money(item.amount)}</strong><span>{item.status === 'approved' ? 'Disetujui' : item.status === 'rejected' ? 'Ditolak' : 'Ditinjau'}</span></div>{item.rejection_reason ? <p className="mt-1 text-red-600">{item.rejection_reason}</p> : null}</li>)}</ul></div> : null}
        </section>
      </div>
      {adminWa ? <a href={`https://wa.me/${adminWa.replace(/\D/g, '')}?text=${encodeURIComponent(waMessage)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white"><MessageCircle className="h-4 w-4" /> Hubungi admin</a> : null}
    </main>
  );
}

function Info({ label, value, strong }: { label: string; value: string; strong?: boolean }) { return <div className="flex items-start justify-between gap-4 py-1 text-sm"><span className="text-stone-500">{label}</span><span className={`text-right ${strong ? 'text-lg font-black text-gold-deep' : 'font-semibold text-charcoal'}`}>{value}</span></div>; }
