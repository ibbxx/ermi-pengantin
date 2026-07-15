'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ExternalLink, Link2, MessageCircle, RefreshCw, Search, XCircle } from 'lucide-react';
import { adminFetch, type AdminBooking, type AdminDressOption, type DressUnit } from '@/lib/admin-booking-api';
import type { BookingStatus, PaymentStatus } from '@/types';

const inputClass = 'w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/15';
const BOOKING_LABELS: Record<BookingStatus, string> = { pending: 'Permintaan', submitted: 'Permintaan', confirmed: 'Dikonfirmasi', paid: 'Terbayar', fitting: 'Fitting', ready: 'Siap', completed: 'Selesai', declined: 'Ditolak', cancelled: 'Dibatalkan' };
const PAYMENT_LABELS: Record<PaymentStatus, string> = { not_due: 'Belum ditagihkan', awaiting_payment: 'Menunggu bayar', under_review: 'Verifikasi bukti', partially_paid: 'DP diterima', paid: 'Lunas', rejected: 'Bukti ditolak', pending: 'Menunggu bayar', failed: 'Gagal' };

function money(value: number | string) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value) || 0); }
function serviceNames(booking: AdminBooking) {
  const result: string[] = [];
  if (booking.services_selected.weddingPackage) result.push(booking.services_selected.weddingPackage.name);
  booking.services_selected.dresses?.forEach((item) => result.push(`${item.name} (${item.size || '-'}, ${item.color || '-'})`));
  if (booking.services_selected.makeup) result.push(booking.services_selected.makeup.name);
  if (booking.services_selected.decor) result.push(booking.services_selected.decor.name);
  return result;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [units, setUnits] = useState<DressUnit[]>([]);
  const [dressOptions, setDressOptions] = useState<AdminDressOption[]>([]);
  const [selected, setSelected] = useState<AdminBooking | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [bookingData, unitData] = await Promise.all([
        adminFetch<{ bookings: AdminBooking[] }>('/api/admin/bookings'),
        adminFetch<{ units: DressUnit[]; dresses: AdminDressOption[] }>('/api/admin/dress-units'),
      ]);
      const normalized = bookingData.bookings.map((item) => ({ ...item, subtotal: Number(item.subtotal), additional_fees: Number(item.additional_fees), deposit_required: Number(item.deposit_required), total_amount: Number(item.total_amount) }));
      setBookings(normalized);
      setUnits(unitData.units);
      setDressOptions(unitData.dresses);
      setSelected((current) => current ? normalized.find((item) => item.id === current.id) || null : null);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Data booking gagal dimuat.'); }
    finally { setLoading(false); }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- synchronize the authenticated admin API after mount.
  useEffect(() => { void load(); }, [load]);

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return bookings.filter((item) => (!query || [item.invoice_number, item.customer_name, item.customer_whatsapp].some((value) => value.toLowerCase().includes(query))) && (statusFilter === 'all' || item.booking_status === statusFilter));
  }, [bookings, search, statusFilter]);
  const stats = useMemo(() => ({ submitted: bookings.filter((item) => ['submitted', 'pending'].includes(item.booking_status)).length, review: bookings.filter((item) => item.payment_status === 'under_review').length, active: bookings.filter((item) => ['confirmed', 'fitting', 'ready'].includes(item.booking_status)).length, complete: bookings.filter((item) => item.booking_status === 'completed').length }), [bookings]);

  async function action(id: string, body: Record<string, unknown>, success: string) {
    setError(''); setMessage('');
    try {
      const data = await adminFetch<{ accessUrl?: string }>(`/api/admin/bookings/${id}/actions`, { method: 'POST', body: JSON.stringify(body) });
      if (data.accessUrl) { await navigator.clipboard.writeText(data.accessUrl); setMessage('Link aman disalin ke clipboard.'); }
      else setMessage(success);
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Aksi gagal diproses.'); }
  }

  async function createUnit(input: { dressId: string; unitCode: string; size: string; color: string }) {
    setError(''); setMessage('');
    const data = await adminFetch<{ unit: DressUnit }>('/api/admin/dress-units', { method: 'POST', body: JSON.stringify(input) });
    setMessage(`Unit ${data.unit.unit_code} berhasil ditambahkan.`);
    await load();
    return data.unit;
  }

  return <div className="space-y-6">
    <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="font-serif text-2xl font-bold text-charcoal">Booking & Transaksi</h1><p className="mt-1 text-xs text-stone-500">Konfirmasi ketersediaan, unit, pembayaran, dan tahap booking melalui API admin.</p></div><button type="button" onClick={() => void load()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-bold"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Segarkan</button></header>
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4"><Stat label="Permintaan baru" value={stats.submitted} /><Stat label="Bukti ditinjau" value={stats.review} /><Stat label="Booking aktif" value={stats.active} /><Stat label="Selesai" value={stats.complete} /></section>
    <section className="grid gap-3 rounded-2xl border border-stone-200 bg-white p-4 sm:grid-cols-[1fr_220px]"><label className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-stone-400" /><input className={`${inputClass} pl-9`} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari invoice, nama, atau WhatsApp…" /></label><select className={inputClass} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="all">Semua status</option>{Object.entries(BOOKING_LABELS).filter(([value]) => value !== 'pending' && value !== 'paid').map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></section>
    {message ? <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{message}</p> : null}
    {error ? <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p> : null}
    {loading ? <p className="rounded-2xl border border-stone-200 bg-white p-10 text-center text-sm text-stone-500">Memuat booking…</p> : visible.length === 0 ? <p className="rounded-2xl border border-stone-200 bg-white p-10 text-center text-sm text-stone-500">Belum ada booking yang cocok.</p> : <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-xs"><thead className="bg-stone-50 text-[10px] uppercase text-stone-500"><tr><th className="p-4">Invoice</th><th className="p-4">Pelanggan</th><th className="p-4">Acara</th><th className="p-4">Total</th><th className="p-4">Status</th><th className="p-4 text-right">Aksi</th></tr></thead><tbody className="divide-y divide-stone-100">{visible.map((booking) => <tr key={booking.id} className="hover:bg-stone-50"><td className="p-4"><strong>{booking.invoice_number}</strong><span className="mt-1 block text-[10px] text-stone-400">{new Date(booking.created_at).toLocaleDateString('id-ID')}</span></td><td className="p-4"><strong>{booking.customer_name}</strong><span className="mt-1 block text-stone-500">{booking.customer_whatsapp}</span></td><td className="p-4"><strong>{new Date(`${booking.event_date}T00:00:00`).toLocaleDateString('id-ID')}</strong><span className="mt-1 block max-w-56 truncate text-stone-500">{booking.event_type} · {booking.event_location}</span></td><td className="p-4"><strong className="text-gold-deep">{money(booking.total_amount)}</strong><span className="mt-1 block text-stone-500">{PAYMENT_LABELS[booking.payment_status]}</span></td><td className="p-4"><span className="rounded-full bg-stone-100 px-2 py-1 text-[10px] font-bold">{BOOKING_LABELS[booking.booking_status]}</span></td><td className="p-4 text-right"><button type="button" onClick={() => setSelected(booking)} className="rounded-lg bg-charcoal px-3 py-2 font-bold text-white">Kelola</button></td></tr>)}</tbody></table></div></div>}
    {selected ? <BookingSheet key={selected.id} booking={selected} units={units} dressOptions={dressOptions} onClose={() => setSelected(null)} onAction={action} onCreateUnit={createUnit} /> : null}
  </div>;
}

function BookingSheet({ booking, units, dressOptions, onClose, onAction, onCreateUnit }: { booking: AdminBooking; units: DressUnit[]; dressOptions: AdminDressOption[]; onClose: () => void; onAction: (id: string, body: Record<string, unknown>, success: string) => Promise<void>; onCreateUnit: (input: { dressId: string; unitCode: string; size: string; color: string }) => Promise<DressUnit> }) {
  const [busy, setBusy] = useState(false);
  const [rentalStart, setRentalStart] = useState(booking.event_date);
  const [rentalEnd, setRentalEnd] = useState(booking.event_date);
  const [additionalFees, setAdditionalFees] = useState(booking.additional_fees);
  const [totalAmount, setTotalAmount] = useState(booking.total_amount);
  const [depositRequired, setDepositRequired] = useState(booking.deposit_required);
  const [paymentDueAt, setPaymentDueAt] = useState('');
  const [unitIds, setUnitIds] = useState<string[]>(booking.booking_dress_assignments.map((item) => item.dress_unit_id));
  const [declineReason, setDeclineReason] = useState('');
  const needsUnit = Boolean(booking.services_selected.weddingPackage || booking.services_selected.dresses?.length);
  async function run(body: Record<string, unknown>, success: string) { setBusy(true); await onAction(booking.id, body, success); setBusy(false); }
  const transitionOptions: BookingStatus[] = booking.booking_status === 'confirmed' ? ['fitting', 'ready', 'cancelled'] : booking.booking_status === 'fitting' ? ['ready', 'cancelled'] : booking.booking_status === 'ready' ? ['completed', 'cancelled'] : [];
  return <div className="fixed inset-0 z-[100]" role="presentation"><button type="button" aria-label="Tutup detail booking" className="absolute inset-0 z-0 cursor-default bg-black/20 backdrop-blur-xs" onClick={() => { if (!busy) onClose(); }} /><aside role="dialog" aria-modal="true" aria-labelledby="booking-detail-title" aria-describedby="booking-detail-description" className="pointer-events-auto absolute inset-y-0 right-0 z-10 flex w-full max-w-2xl flex-col overflow-y-auto border-l border-stone-200 bg-white shadow-2xl"><header className="sticky top-0 z-20 flex items-start justify-between gap-4 border-b border-stone-200 bg-white px-5 py-4"><div><h2 id="booking-detail-title" className="font-serif text-xl font-bold text-charcoal">{booking.invoice_number}</h2><p id="booking-detail-description" className="mt-1 text-sm text-stone-500">{booking.customer_name} · {booking.customer_whatsapp}</p></div><button type="button" aria-label="Tutup" disabled={busy} onClick={onClose} className="rounded-lg border border-stone-200 px-3 py-1.5 text-lg leading-none text-stone-600 hover:bg-stone-50 disabled:opacity-40">×</button></header><div className="space-y-6 px-5 py-5 pb-8">
    <section className="rounded-2xl bg-stone-50 p-4 text-sm"><Info label="Acara" value={`${booking.event_type} · ${booking.event_date}`} /><Info label="Lokasi" value={booking.event_location} /><Info label="Layanan" value={serviceNames(booking).join(', ') || '-'} /><Info label="Subtotal" value={money(booking.subtotal)} /><Info label="Status pembayaran" value={PAYMENT_LABELS[booking.payment_status]} /></section>
    {['submitted', 'pending'].includes(booking.booking_status) ? <section className="space-y-3"><h3 className="font-serif font-bold">Konfirmasi booking</h3><div className="grid grid-cols-2 gap-3"><Field label="Mulai sewa"><input className={inputClass} type="date" value={rentalStart} onChange={(e) => setRentalStart(e.target.value)} /></Field><Field label="Selesai sewa"><input className={inputClass} type="date" value={rentalEnd} onChange={(e) => setRentalEnd(e.target.value)} /></Field><Field label="Biaya tambahan"><input className={inputClass} type="number" min="0" value={additionalFees} onChange={(e) => setAdditionalFees(Number(e.target.value))} /></Field><Field label="Total final"><input className={inputClass} type="number" min="0" value={totalAmount} onChange={(e) => setTotalAmount(Number(e.target.value))} /></Field><Field label="DP wajib"><input className={inputClass} type="number" min="0" value={depositRequired} onChange={(e) => setDepositRequired(Number(e.target.value))} /></Field><Field label="Batas pembayaran"><input className={inputClass} type="datetime-local" value={paymentDueAt} onChange={(e) => setPaymentDueAt(e.target.value)} /></Field></div>{needsUnit ? <UnitPicker units={units} dressOptions={dressOptions} selectedIds={unitIds} onSelectedIdsChange={setUnitIds} onCreateUnit={onCreateUnit} suggestedDressId={booking.services_selected.dresses?.[0]?.id} /> : null}<button disabled={busy || !rentalStart || !rentalEnd || (needsUnit && !unitIds.length)} onClick={() => void run({ action: 'confirm', unitIds, rentalStart, rentalEnd, additionalFees, totalAmount, depositRequired, paymentDueAt: paymentDueAt ? new Date(paymentDueAt).toISOString() : undefined }, 'Booking dikonfirmasi dan instruksi pembayaran dibuka.')} className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-40"><CheckCircle2 className="mr-2 inline h-4 w-4" /> Konfirmasi & buka pembayaran</button>{needsUnit && !unitIds.length ? <p className="text-xs font-semibold text-amber-700">Pilih minimal satu unit busana agar tombol konfirmasi aktif.</p> : null}<div className="flex gap-2"><input className={inputClass} value={declineReason} onChange={(e) => setDeclineReason(e.target.value)} placeholder="Alasan penolakan" /><button disabled={busy} onClick={() => void run({ action: 'decline', reason: declineReason }, 'Booking ditolak.')} className="shrink-0 rounded-xl bg-red-600 px-4 text-xs font-bold text-white"><XCircle className="mr-1 inline h-4 w-4" /> Tolak</button></div></section> : null}
    {transitionOptions.length ? <section className="space-y-3"><h3 className="font-serif font-bold">Tahap operasional</h3><div className="flex flex-wrap gap-2">{transitionOptions.map((status) => <button key={status} disabled={busy} onClick={() => void run({ action: 'status', status }, `Status diubah menjadi ${BOOKING_LABELS[status]}.`)} className="rounded-xl border border-stone-300 px-3 py-2 text-xs font-bold hover:border-gold">{BOOKING_LABELS[status]}</button>)}</div></section> : null}
    <section className="space-y-3"><h3 className="font-serif font-bold">Bukti pembayaran</h3>{booking.payment_submissions.length ? booking.payment_submissions.map((submission) => <article key={submission.id} className="rounded-xl border border-stone-200 p-4 text-xs"><div className="flex items-start justify-between gap-3"><div><strong>{submission.payment_type.toUpperCase()} · {money(submission.amount)}</strong><p className="mt-1 text-stone-500">{submission.status}</p></div>{submission.proof_url ? <a href={submission.proof_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold text-gold-deep">Lihat bukti <ExternalLink className="h-3.5 w-3.5" /></a> : null}</div>{submission.status === 'under_review' ? <div className="mt-3 flex gap-2"><button disabled={busy} onClick={() => void run({ action: 'review_payment', submissionId: submission.id, decision: 'approve' }, 'Pembayaran disetujui.')} className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 font-bold text-white">Setujui</button><button disabled={busy} onClick={() => { const reason = window.prompt('Alasan penolakan bukti:') || ''; if (reason) void run({ action: 'review_payment', submissionId: submission.id, decision: 'reject', rejectionReason: reason }, 'Bukti pembayaran ditolak.'); }} className="flex-1 rounded-lg bg-red-600 px-3 py-2 font-bold text-white">Tolak</button></div> : null}</article>) : <p className="text-xs text-stone-500">Belum ada bukti pembayaran.</p>}</section>
    <section className="grid gap-2 sm:grid-cols-2"><button disabled={busy} onClick={() => void run({ action: 'create_link' }, '')} className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-300 px-4 py-3 text-xs font-bold"><Link2 className="h-4 w-4" /> Buat & salin link aman</button><a href={`https://wa.me/${booking.customer_whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Halo ${booking.customer_name}, terkait booking ${booking.invoice_number}:`)}`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-bold text-white"><MessageCircle className="h-4 w-4" /> Hubungi pelanggan</a></section>
  </div></aside></div>;
}

function Stat({ label, value }: { label: string; value: number }) { return <div className="rounded-2xl border border-stone-200 bg-white p-4"><p className="text-[10px] font-bold uppercase text-stone-400">{label}</p><p className="mt-1 text-2xl font-black text-charcoal">{value}</p></div>; }
function Info({ label, value }: { label: string; value: string }) { return <div className="flex justify-between gap-4 py-1"><span className="text-stone-500">{label}</span><strong className="text-right">{value}</strong></div>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label><span className="mb-1 block text-[10px] font-bold uppercase text-stone-500">{label}</span>{children}</label>; }

function UnitPicker({ units, dressOptions, selectedIds, onSelectedIdsChange, onCreateUnit, suggestedDressId }: { units: DressUnit[]; dressOptions: AdminDressOption[]; selectedIds: string[]; onSelectedIdsChange: (ids: string[]) => void; onCreateUnit: (input: { dressId: string; unitCode: string; size: string; color: string }) => Promise<DressUnit>; suggestedDressId?: string }) {
  const readyUnits = units.filter((unit) => unit.status === 'ready');
  const initialDress = dressOptions.find((item) => item.id === suggestedDressId) || dressOptions[0];
  const [showForm, setShowForm] = useState(false);
  const [dressId, setDressId] = useState(initialDress?.id || '');
  const [unitCode, setUnitCode] = useState('');
  const [size, setSize] = useState(initialDress?.sizes[0] || '');
  const [color, setColor] = useState(initialDress?.colors[0] || '');
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');
  const selectedDress = dressOptions.find((item) => item.id === dressId);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dressId || !unitCode.trim() || !size.trim() || !color.trim()) return setFormError('Model, kode unit, ukuran, dan warna wajib diisi.');
    setCreating(true); setFormError('');
    try {
      const unit = await onCreateUnit({ dressId, unitCode, size, color });
      onSelectedIdsChange([...selectedIds, unit.id]);
      setUnitCode(''); setShowForm(false);
    } catch (cause) { setFormError(cause instanceof Error ? cause.message : 'Unit gagal ditambahkan.'); }
    finally { setCreating(false); }
  }

  return <div className="space-y-3 rounded-xl border border-stone-200 p-3"><div><span className="block text-xs font-bold text-charcoal">Pilih unit busana</span><p className="mt-1 text-[11px] text-stone-500">Unit adalah barang fisik tertentu yang akan disiapkan untuk pelanggan. Centang minimal satu unit.</p></div>{readyUnits.length ? <div className="max-h-40 space-y-2 overflow-y-auto">{readyUnits.map((unit) => <label key={unit.id} className="flex cursor-pointer items-center gap-2 rounded-lg border border-stone-100 px-3 py-2 text-xs hover:bg-stone-50"><input type="checkbox" checked={selectedIds.includes(unit.id)} onChange={(event) => onSelectedIdsChange(event.target.checked ? [...selectedIds, unit.id] : selectedIds.filter((id) => id !== unit.id))} /><span><strong>{unit.unit_code}</strong> · {unit.dresses?.name || 'Busana'} · {unit.size} · {unit.color}</span></label>)}</div> : <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800"><strong>Belum ada unit busana berstatus siap.</strong><p className="mt-1">Tambahkan unit fisik terlebih dahulu melalui tombol di bawah.</p></div>}{!showForm ? <button type="button" onClick={() => setShowForm(true)} className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-bold hover:border-gold hover:bg-gold/5">+ Tambah unit busana</button> : <form onSubmit={submit} className="space-y-3 rounded-lg bg-stone-50 p-3"><div className="grid gap-2 sm:grid-cols-2"><Field label="Model busana"><select className={inputClass} value={dressId} onChange={(event) => { const next = dressOptions.find((item) => item.id === event.target.value); setDressId(event.target.value); setSize(next?.sizes[0] || ''); setColor(next?.colors[0] || ''); }}>{dressOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field><Field label="Kode unit"><input className={inputClass} value={unitCode} onChange={(event) => setUnitCode(event.target.value)} placeholder="Contoh: GAUN-01" /></Field><Field label="Ukuran"><input className={inputClass} list="unit-size-options" value={size} onChange={(event) => setSize(event.target.value)} /><datalist id="unit-size-options">{selectedDress?.sizes.map((item) => <option key={item} value={item} />)}</datalist></Field><Field label="Warna"><input className={inputClass} list="unit-color-options" value={color} onChange={(event) => setColor(event.target.value)} /><datalist id="unit-color-options">{selectedDress?.colors.map((item) => <option key={item} value={item} />)}</datalist></Field></div>{formError ? <p className="text-xs font-semibold text-red-700">{formError}</p> : null}<div className="flex gap-2"><button type="button" disabled={creating} onClick={() => { setShowForm(false); setFormError(''); }} className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-xs font-bold">Batal</button><button disabled={creating || !dressOptions.length} className="flex-1 rounded-lg bg-charcoal px-3 py-2 text-xs font-bold text-white disabled:opacity-40">{creating ? 'Menyimpan…' : 'Simpan unit'}</button></div></form>}</div>;
}
