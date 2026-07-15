'use client';

import { FormEvent, useMemo, useState } from 'react';
import {
  AlertCircle,
  CalendarCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Edit3,
  ExternalLink,
  FileImage,
  MessageSquare,
  MoreHorizontal,
  RefreshCw,
  Search,
  Trash2,
  XCircle,
} from 'lucide-react';
import { Booking, BookingStatus } from '@/types';
import { useBookings } from '@/data/db';
import { deleteImage, uploadPaymentProof } from '@/lib/storage';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

const PAGE_SIZE = 10;
const BOOKING_STATUSES: { value: BookingStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Dikonfirmasi' },
  { value: 'paid', label: 'Terbayar' },
  { value: 'fitting', label: 'Fitting' },
  { value: 'ready', label: 'Siap' },
  { value: 'completed', label: 'Selesai' },
  { value: 'cancelled', label: 'Dibatalkan' },
];
const PAYMENT_STATUSES: { value: Booking['paymentStatus']; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Dibayar' },
  { value: 'failed', label: 'Gagal' },
];

const inputClass = 'w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-charcoal outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/15 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-500';
const labelClass = 'mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-stone-500';

function parseRupiah(value: string | number | undefined) {
  if (typeof value === 'number') return value;
  return Number(String(value ?? '').replace(/[^0-9-]/g, '')) || 0;
}

function formatRupiah(value: string | number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(typeof value === 'number' ? value : parseRupiah(value));
}

function statusLabel(status: BookingStatus) {
  return BOOKING_STATUSES.find((item) => item.value === status)?.label ?? status;
}

function statusClass(status: BookingStatus) {
  if (status === 'completed') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (status === 'cancelled') return 'bg-red-50 text-red-700 border-red-200';
  if (status === 'pending') return 'bg-amber-50 text-amber-700 border-amber-200';
  if (status === 'fitting' || status === 'ready') return 'bg-purple-50 text-purple-700 border-purple-200';
  return 'bg-blue-50 text-blue-700 border-blue-200';
}

function paymentClass(status: Booking['paymentStatus']) {
  if (status === 'paid') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (status === 'failed') return 'bg-red-50 text-red-700 border-red-200';
  return 'bg-amber-50 text-amber-700 border-amber-200';
}

function serviceNames(booking: Booking) {
  const services: string[] = [];
  const selected = booking.servicesSelected;
  if (selected.weddingPackage) services.push(selected.weddingPackage.name);
  selected.dresses?.forEach((dress) => services.push(`${dress.name} (${dress.size}, ${dress.color})`));
  if (selected.makeup) services.push(selected.makeup.name);
  if (selected.decor) services.push(selected.decor.name);
  return services;
}

function whatsappUrl(booking: Booking) {
  const phone = booking.customerWhatsApp.replace(/[^0-9]/g, '').replace(/^0/, '62');
  const message = encodeURIComponent(`Halo ${booking.customerName}, kami dari Ermi Pengantin ingin mengonfirmasi booking dengan invoice ${booking.invoiceNumber}.`);
  return `https://wa.me/${phone}?text=${message}`;
}

interface BookingDrawerProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (booking: Booking) => Promise<Booking>;
}

function BookingDrawer({ booking, open, onOpenChange, onSave }: BookingDrawerProps) {
  const [form, setForm] = useState<Booking | null>(booking);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [removeProof, setRemoveProof] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  if (!form) return null;

  const subtotal = parseRupiah(form.subtotal);
  const additionalFees = parseRupiah(form.additionalFees);
  const total = subtotal + additionalFees;
  const deposit = parseRupiah(form.depositRequired);
  const services = serviceNames(form);
  const update = <K extends keyof Booking>(key: K, value: Booking[K]) => {
    setForm((current) => current ? { ...current, [key]: value } : current);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const whatsapp = form.customerWhatsApp.replace(/[^0-9+]/g, '');
    if (!form.customerName.trim()) return setFormError('Nama pelanggan wajib diisi.');
    if (!/^\+?[0-9]{9,15}$/.test(whatsapp)) return setFormError('Nomor WhatsApp harus berisi 9–15 digit.');
    if (form.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail)) return setFormError('Format email tidak valid.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.eventDate) || Number.isNaN(Date.parse(`${form.eventDate}T00:00:00`))) return setFormError('Tanggal acara tidak valid.');
    if (subtotal < 0 || additionalFees < 0 || deposit < 0) return setFormError('Nominal tidak boleh negatif.');
    if (deposit > total) return setFormError('DP tidak boleh melebihi total biaya.');

    setIsSaving(true);
    setFormError('');
    const oldProof = booking?.paymentProof;
    let uploadedProof: string | undefined;
    try {
      if (proofFile) uploadedProof = await uploadPaymentProof(proofFile);
      const nextProof = uploadedProof ?? (removeProof ? undefined : form.paymentProof);
      const saved = await onSave({
        ...form,
        customerName: form.customerName.trim(),
        customerWhatsApp: whatsapp,
        customerEmail: form.customerEmail.trim(),
        subtotal: formatRupiah(subtotal),
        additionalFees: formatRupiah(additionalFees),
        depositRequired: formatRupiah(deposit),
        totalAmount: formatRupiah(total),
        paymentProof: nextProof,
      });
      if (oldProof && oldProof !== saved.paymentProof) void deleteImage(oldProof);
      onOpenChange(false);
    } catch (cause) {
      if (uploadedProof) void deleteImage(uploadedProof);
      setFormError(cause instanceof Error ? cause.message : 'Gagal menyimpan perubahan.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(next) => !isSaving && onOpenChange(next)}>
      <SheetContent className="w-full sm:max-w-2xl gap-0 bg-white" aria-describedby="booking-drawer-description">
        <SheetHeader className="border-b border-stone-200 px-5 py-5 pr-14">
          <SheetTitle className="font-serif text-xl font-bold text-charcoal">Detail & Edit Booking</SheetTitle>
          <SheetDescription id="booking-drawer-description" className="text-xs text-stone-500">
            Perbarui data operasional dan transaksi tanpa mengubah snapshot layanan.
          </SheetDescription>
        </SheetHeader>

        <form id="booking-edit-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-5">
          <div className="space-y-7">
            <section className="grid gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-4 sm:grid-cols-2">
              <ReadOnly label="Invoice" value={form.invoiceNumber} />
              <ReadOnly label="ID Booking" value={form.id} mono />
              <ReadOnly label="Dibuat" value={new Date(form.createdAt).toLocaleString('id-ID')} />
              <div className="sm:col-span-2">
                <span className={labelClass}>Layanan terpilih</span>
                {services.length ? (
                  <ul className="space-y-1 text-sm text-charcoal">
                    {services.map((name, index) => <li key={`${index}-${name}`}>• {name}</li>)}
                  </ul>
                ) : <p className="text-sm italic text-stone-400">Tidak ada snapshot layanan.</p>}
              </div>
            </section>

            <FormSection title="Data Pelanggan">
              <Field label="Nama pelanggan"><input className={inputClass} value={form.customerName} onChange={(e) => update('customerName', e.target.value)} required /></Field>
              <Field label="WhatsApp"><input className={inputClass} inputMode="tel" value={form.customerWhatsApp} onChange={(e) => update('customerWhatsApp', e.target.value)} required /></Field>
              <Field label="Email"><input className={inputClass} type="email" value={form.customerEmail} onChange={(e) => update('customerEmail', e.target.value)} /></Field>
              <Field label="Alamat" wide><textarea className={`${inputClass} min-h-20 resize-y`} value={form.customerAddress} onChange={(e) => update('customerAddress', e.target.value)} /></Field>
            </FormSection>

            <FormSection title="Detail Acara">
              <Field label="Tanggal acara"><input className={inputClass} type="date" value={form.eventDate} onChange={(e) => update('eventDate', e.target.value)} required /></Field>
              <Field label="Jenis acara"><select className={inputClass} value={form.eventType} onChange={(e) => update('eventType', e.target.value as Booking['eventType'])}><option value="akad">Akad</option><option value="resepsi">Resepsi</option><option value="prewedding">Prewedding</option><option value="lamaran">Lamaran</option></select></Field>
              <Field label="Lokasi acara" wide><input className={inputClass} value={form.eventLocation} onChange={(e) => update('eventLocation', e.target.value)} /></Field>
              <Field label="Catatan" wide><textarea className={`${inputClass} min-h-24 resize-y`} value={form.notes ?? ''} onChange={(e) => update('notes', e.target.value)} /></Field>
            </FormSection>

            <FormSection title="Status & Pembayaran">
              <Field label="Status booking"><select className={inputClass} value={form.bookingStatus} onChange={(e) => update('bookingStatus', e.target.value as BookingStatus)}>{BOOKING_STATUSES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></Field>
              <Field label="Status pembayaran"><select className={inputClass} value={form.paymentStatus} onChange={(e) => update('paymentStatus', e.target.value as Booking['paymentStatus'])}>{PAYMENT_STATUSES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></Field>
              <Field label="Tipe pembayaran"><select className={inputClass} value={form.paymentType} onChange={(e) => update('paymentType', e.target.value as Booking['paymentType'])}><option value="dp">DP</option><option value="full">Lunas</option></select></Field>
              <Field label="Metode pembayaran"><input className={inputClass} value={form.paymentMethod} onChange={(e) => update('paymentMethod', e.target.value)} placeholder="Transfer, QRIS, tunai…" /></Field>
              <Field label="Subtotal (Rp)"><input className={inputClass} type="number" min="0" step="1" value={subtotal} onChange={(e) => update('subtotal', e.target.value)} /></Field>
              <Field label="Biaya tambahan (Rp)"><input className={inputClass} type="number" min="0" step="1" value={additionalFees} onChange={(e) => update('additionalFees', e.target.value)} /></Field>
              <Field label="DP (Rp)"><input className={inputClass} type="number" min="0" step="1" value={deposit} onChange={(e) => update('depositRequired', e.target.value)} /></Field>
              <Field label="Total otomatis"><input className={inputClass} value={formatRupiah(total)} readOnly aria-readonly="true" /></Field>
            </FormSection>

            <section className="space-y-3">
              <h3 className="font-serif text-base font-bold text-charcoal">Bukti Pembayaran</h3>
              {form.paymentProof && !removeProof ? (
                <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <FileImage className="h-5 w-5 text-emerald-700" />
                  <a href={form.paymentProof} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm font-bold text-emerald-700 underline">Lihat bukti tersimpan <ExternalLink className="h-3.5 w-3.5" /></a>
                  <button type="button" className="ml-auto text-xs font-bold text-red-600 hover:underline" onClick={() => { setRemoveProof(true); setProofFile(null); }}>Hapus bukti</button>
                </div>
              ) : <p className="rounded-xl bg-stone-50 p-3 text-xs italic text-stone-500">Belum ada bukti pembayaran tersimpan.</p>}
              <label className="block cursor-pointer rounded-2xl border border-dashed border-stone-300 p-4 text-center text-xs font-bold text-stone-600 hover:border-gold hover:bg-gold/5">
                {proofFile ? `File baru: ${proofFile.name}` : form.paymentProof && !removeProof ? 'Ganti bukti pembayaran' : 'Pilih bukti pembayaran'}
                <input type="file" accept="image/*" className="sr-only" onChange={(e) => { setProofFile(e.target.files?.[0] ?? null); setRemoveProof(false); }} />
              </label>
            </section>

            {formError ? <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{formError}</p> : null}
          </div>
        </form>

        <SheetFooter className="flex-row border-t border-stone-200 bg-white px-5 py-4">
          <button type="button" className="flex-1 rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-bold text-stone-700 hover:bg-stone-50" onClick={() => onOpenChange(false)} disabled={isSaving}>Batal</button>
          <button type="submit" form="booking-edit-form" className="flex-1 rounded-xl bg-charcoal px-4 py-2.5 text-sm font-bold text-white hover:bg-charcoal-light disabled:opacity-60" disabled={isSaving}>{isSaving ? 'Menyimpan…' : 'Simpan Perubahan'}</button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function Field({ label, wide = false, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return <label className={wide ? 'sm:col-span-2' : ''}><span className={labelClass}>{label}</span>{children}</label>;
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section><h3 className="mb-3 font-serif text-base font-bold text-charcoal">{title}</h3><div className="grid gap-4 sm:grid-cols-2">{children}</div></section>;
}

function ReadOnly({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return <div><span className={labelClass}>{label}</span><p className={`break-all text-sm font-semibold text-charcoal ${mono ? 'font-mono text-xs' : ''}`}>{value}</p></div>;
}

export default function AdminBookings() {
  const [bookings, , actions] = useBookings();
  const [search, setSearch] = useState('');
  const [bookingFilter, setBookingFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Booking | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('id-ID');
    return bookings.filter((booking) => {
      const matchesSearch = !query || [booking.invoiceNumber, booking.customerName, booking.customerWhatsApp]
        .some((value) => value.toLocaleLowerCase('id-ID').includes(query));
      return matchesSearch
        && (bookingFilter === 'all' || booking.bookingStatus === bookingFilter)
        && (paymentFilter === 'all' || booking.paymentStatus === paymentFilter);
    });
  }, [bookings, search, bookingFilter, paymentFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const activePage = Math.min(page, totalPages);
  const visible = filtered.slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE);

  const stats = useMemo(() => ({
    total: bookings.length,
    processing: bookings.filter((item) => ['pending', 'confirmed', 'paid', 'fitting', 'ready'].includes(item.bookingStatus)).length,
    pendingPayment: bookings.filter((item) => item.paymentStatus === 'pending').length,
    completed: bookings.filter((item) => item.bookingStatus === 'completed').length,
  }), [bookings]);

  const resetFilters = () => { setSearch(''); setBookingFilter('all'); setPaymentFilter('all'); setPage(1); };
  const cancel = async (booking: Booking) => {
    if (!window.confirm(`Batalkan booking ${booking.invoiceNumber}? Data pembayaran dan bukti bayar tetap disimpan.`)) return;
    setActionError('');
    try {
      await actions.cancelBooking(booking.id);
      setActionMessage(`Booking ${booking.invoiceNumber} berhasil dibatalkan.`);
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'Gagal membatalkan booking.');
    }
  };
  const permanentlyDelete = async () => {
    if (!deleteTarget || deleteConfirmation !== deleteTarget.invoiceNumber) return;
    setIsDeleting(true);
    setActionError('');
    try {
      await actions.deleteBooking(deleteTarget.id);
      const proof = deleteTarget.paymentProof;
      setDeleteTarget(null);
      setDeleteConfirmation('');
      setActionMessage(`Booking ${deleteTarget.invoiceNumber} dihapus permanen.`);
      if (proof) void deleteImage(proof);
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'Gagal menghapus booking.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="font-serif text-2xl font-bold text-charcoal">Booking & Transaksi</h1><p className="mt-1 text-xs text-stone-500">Kelola jadwal, pelanggan, dan pembayaran dari satu tempat.</p></div>
        <button type="button" onClick={() => void actions.refresh()} className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-bold text-stone-700 hover:border-gold" disabled={actions.isLoading}><RefreshCw className={`h-4 w-4 ${actions.isLoading ? 'animate-spin' : ''}`} /> Segarkan</button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={CalendarCheck} label="Total booking" value={stats.total} color="text-blue-700 bg-blue-50" />
        <StatCard icon={Clock3} label="Perlu diproses" value={stats.processing} color="text-purple-700 bg-purple-50" />
        <StatCard icon={CircleDollarSign} label="Pembayaran pending" value={stats.pendingPayment} color="text-amber-700 bg-amber-50" />
        <StatCard icon={CheckCircle2} label="Selesai" value={stats.completed} color="text-emerald-700 bg-emerald-50" />
      </div>

      <div className="grid gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm md:grid-cols-[minmax(240px,1fr)_190px_190px_auto]">
        <label className="relative"><span className="sr-only">Cari booking</span><Search className="absolute left-3 top-3 h-4 w-4 text-stone-400" /><input className={`${inputClass} pl-9`} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Cari invoice, nama, atau WhatsApp…" /></label>
        <label><span className="sr-only">Filter status booking</span><select className={inputClass} value={bookingFilter} onChange={(e) => { setBookingFilter(e.target.value); setPage(1); }}><option value="all">Semua booking</option>{BOOKING_STATUSES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
        <label><span className="sr-only">Filter status pembayaran</span><select className={inputClass} value={paymentFilter} onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}><option value="all">Semua pembayaran</option>{PAYMENT_STATUSES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
        <button type="button" onClick={resetFilters} className="rounded-xl px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100">Reset</button>
      </div>

      {actionMessage ? <div role="status" className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700"><span>{actionMessage}</span><button type="button" onClick={() => setActionMessage('')} aria-label="Tutup pesan"><XCircle className="h-4 w-4" /></button></div> : null}
      {actionError || actions.error ? <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700"><AlertCircle className="h-4 w-4" />{actionError || actions.error}</div> : null}

      {actions.isLoading ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-5"><TableSkeleton /></div>
      ) : actions.error && bookings.length === 0 ? (
        <ErrorState message={actions.error} onRetry={() => void actions.refresh()} />
      ) : filtered.length === 0 ? (
        <EmptyState title={bookings.length ? 'Tidak ada hasil yang cocok' : 'Belum ada booking'} description={bookings.length ? 'Ubah pencarian atau reset filter untuk melihat data lain.' : 'Booking baru dari pelanggan akan muncul di halaman ini.'} actionText={bookings.length ? 'Reset Filter' : undefined} onAction={bookings.length ? resetFilters : undefined} />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm md:block">
            <div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left text-xs">
              <thead className="border-b border-stone-200 bg-stone-50 text-[10px] uppercase tracking-wide text-stone-500"><tr><th className="p-4">Invoice</th><th className="p-4">Pelanggan</th><th className="p-4">Acara</th><th className="p-4">Pembayaran</th><th className="p-4">Status booking</th><th className="p-4 text-right">Aksi</th></tr></thead>
              <tbody className="divide-y divide-stone-100">{visible.map((booking) => <BookingRow key={booking.id} booking={booking} onEdit={() => setSelected(booking)} onCancel={() => void cancel(booking)} onDelete={() => { setDeleteTarget(booking); setDeleteConfirmation(''); }} />)}</tbody>
            </table></div>
          </div>
          <div className="space-y-3 md:hidden">{visible.map((booking) => <BookingCard key={booking.id} booking={booking} onEdit={() => setSelected(booking)} onCancel={() => void cancel(booking)} onDelete={() => { setDeleteTarget(booking); setDeleteConfirmation(''); }} />)}</div>
          <Pagination page={activePage} totalPages={totalPages} total={filtered.length} onChange={setPage} />
        </>
      )}

      {selected ? <BookingDrawer key={selected.id} booking={selected} open onOpenChange={(open) => { if (!open) setSelected(null); }} onSave={actions.updateBooking} /> : null}

      <Sheet open={Boolean(deleteTarget)} onOpenChange={(open) => { if (!open && !isDeleting) { setDeleteTarget(null); setDeleteConfirmation(''); } }}>
        <SheetContent className="w-full bg-white sm:max-w-md" aria-describedby="delete-booking-description">
          <SheetHeader><SheetTitle className="font-serif text-xl font-bold text-red-800">Hapus Permanen</SheetTitle><SheetDescription id="delete-booking-description">Tindakan ini tidak dapat dibatalkan. Ketik nomor invoice untuk mengonfirmasi.</SheetDescription></SheetHeader>
          {deleteTarget ? <div className="space-y-4 px-4"><div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><strong>{deleteTarget.invoiceNumber}</strong><br />{deleteTarget.customerName}</div><label><span className={labelClass}>Nomor invoice</span><input autoFocus className={inputClass} value={deleteConfirmation} onChange={(e) => setDeleteConfirmation(e.target.value)} placeholder={deleteTarget.invoiceNumber} /></label></div> : null}
          <SheetFooter className="flex-row"><button type="button" className="flex-1 rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-bold" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>Batal</button><button type="button" className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40" disabled={!deleteTarget || deleteConfirmation !== deleteTarget.invoiceNumber || isDeleting} onClick={() => void permanentlyDelete()}>{isDeleting ? 'Menghapus…' : 'Hapus Permanen'}</button></SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof CalendarCheck; label: string; value: number; color: string }) {
  return <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}><Icon className="h-5 w-5" /></div><div><p className="text-[10px] font-bold uppercase tracking-wide text-stone-400">{label}</p><p className="text-xl font-black text-charcoal">{value}</p></div></div>;
}

interface BookingActionsProps { booking: Booking; onEdit: () => void; onCancel: () => void; onDelete: () => void }

function BookingRow({ booking, onEdit, onCancel, onDelete }: BookingActionsProps) {
  return <tr className="hover:bg-stone-50/60"><td className="p-4 align-top"><strong className="block text-charcoal">{booking.invoiceNumber}</strong><span className="mt-1 block font-mono text-[10px] text-stone-400">{new Date(booking.createdAt).toLocaleDateString('id-ID')}</span></td><td className="p-4 align-top"><strong className="block text-charcoal">{booking.customerName}</strong><span className="mt-1 block text-stone-500">{booking.customerWhatsApp}</span></td><td className="p-4 align-top"><strong className="block text-charcoal">{new Date(`${booking.eventDate}T00:00:00`).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</strong><span className="mt-1 block max-w-52 truncate text-stone-500">{booking.eventType} · {booking.eventLocation}</span></td><td className="p-4 align-top"><strong className="block text-gold-deep">{formatRupiah(booking.totalAmount)}</strong><span className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${paymentClass(booking.paymentStatus)}`}>{booking.paymentStatus} · {booking.paymentType}</span></td><td className="p-4 align-top"><span className={`inline-flex rounded-full border px-2 py-1 text-[9px] font-bold uppercase ${statusClass(booking.bookingStatus)}`}>{statusLabel(booking.bookingStatus)}</span></td><td className="p-4 align-top"><ActionButtons booking={booking} onEdit={onEdit} onCancel={onCancel} onDelete={onDelete} /></td></tr>;
}

function BookingCard({ booking, onEdit, onCancel, onDelete }: BookingActionsProps) {
  return <article className="space-y-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div><strong className="text-sm text-charcoal">{booking.invoiceNumber}</strong><p className="mt-1 text-xs text-stone-500">{booking.customerName} · {booking.customerWhatsApp}</p></div><span className={`shrink-0 rounded-full border px-2 py-1 text-[9px] font-bold uppercase ${statusClass(booking.bookingStatus)}`}>{statusLabel(booking.bookingStatus)}</span></div><div className="grid grid-cols-2 gap-3 rounded-xl bg-stone-50 p-3 text-xs"><div><span className="block text-[9px] font-bold uppercase text-stone-400">Tanggal acara</span><strong>{new Date(`${booking.eventDate}T00:00:00`).toLocaleDateString('id-ID')}</strong></div><div><span className="block text-[9px] font-bold uppercase text-stone-400">Total</span><strong className="text-gold-deep">{formatRupiah(booking.totalAmount)}</strong></div><div className="col-span-2"><span className="block text-[9px] font-bold uppercase text-stone-400">Pembayaran</span><span className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${paymentClass(booking.paymentStatus)}`}>{booking.paymentStatus} · {booking.paymentType}</span></div></div><ActionButtons booking={booking} onEdit={onEdit} onCancel={onCancel} onDelete={onDelete} /></article>;
}

function ActionButtons({ booking, onEdit, onCancel, onDelete }: BookingActionsProps) {
  return <div className="flex items-center justify-end gap-1.5"><button type="button" onClick={onEdit} className="inline-flex items-center gap-1 rounded-lg border border-stone-200 px-2.5 py-2 font-bold text-stone-700 hover:border-gold hover:bg-gold/5" title="Detail dan edit"><Edit3 className="h-3.5 w-3.5" /> Edit</button><a href={whatsappUrl(booking)} target="_blank" rel="noreferrer" className="rounded-lg border border-stone-200 p-2 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-50" title="Hubungi via WhatsApp" aria-label={`Hubungi ${booking.customerName} via WhatsApp`}><MessageSquare className="h-4 w-4" /></a>{booking.bookingStatus !== 'cancelled' && booking.bookingStatus !== 'completed' ? <button type="button" onClick={onCancel} className="rounded-lg border border-stone-200 p-2 text-amber-700 hover:border-amber-400 hover:bg-amber-50" title="Batalkan booking" aria-label={`Batalkan ${booking.invoiceNumber}`}><XCircle className="h-4 w-4" /></button> : null}<details className="relative"><summary className="list-none cursor-pointer rounded-lg border border-stone-200 p-2 text-stone-600 hover:bg-stone-50" title="Aksi lanjutan"><MoreHorizontal className="h-4 w-4" /></summary><div className="absolute right-0 z-20 mt-1 w-44 rounded-xl border border-stone-200 bg-white p-1.5 shadow-xl"><button type="button" onClick={onDelete} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /> Hapus permanen</button></div></details></div>;
}

function Pagination({ page, totalPages, total, onChange }: { page: number; totalPages: number; total: number; onChange: (page: number) => void }) {
  return <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3 text-xs text-stone-500 sm:flex-row"><span>{total} booking ditemukan · Halaman {page} dari {totalPages}</span><div className="flex gap-2"><button type="button" onClick={() => onChange(page - 1)} disabled={page === 1} className="rounded-lg border border-stone-200 p-2 disabled:opacity-30" aria-label="Halaman sebelumnya"><ChevronLeft className="h-4 w-4" /></button><button type="button" onClick={() => onChange(page + 1)} disabled={page === totalPages} className="rounded-lg border border-stone-200 p-2 disabled:opacity-30" aria-label="Halaman berikutnya"><ChevronRight className="h-4 w-4" /></button></div></div>;
}
