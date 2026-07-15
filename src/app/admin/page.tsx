'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ClipboardList, DollarSign, TrendingUp, Users } from 'lucide-react';
import { adminFetch, type AdminBooking } from '@/lib/admin-booking-api';

function money(value: number) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value); }

export default function AdminDashboardOverview() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    try { setBookings((await adminFetch<{ bookings: AdminBooking[] }>('/api/admin/bookings')).bookings); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Ringkasan gagal dimuat.'); }
  }, []);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- synchronize authenticated admin data after mount.
  useEffect(() => { void load(); }, [load]);
  const stats = useMemo(() => {
    const approved = bookings.flatMap((booking) => booking.payment_submissions).filter((item) => item.status === 'approved').reduce((sum, item) => sum + Number(item.amount), 0);
    const total = bookings.filter((item) => !['declined', 'cancelled'].includes(item.booking_status)).reduce((sum, item) => sum + Number(item.total_amount), 0);
    return { approved, outstanding: Math.max(0, total - approved), active: bookings.filter((item) => ['confirmed', 'fitting', 'ready'].includes(item.booking_status)).length, customers: new Set(bookings.map((item) => item.customer_whatsapp)).size };
  }, [bookings]);
  return <div className="space-y-8"><header><h1 className="font-serif text-2xl font-bold text-charcoal">Ringkasan Operasional Butik</h1><p className="mt-1 text-xs text-stone-500">Data booking dan pembayaran dari API admin.</p></header>{error ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}<section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat icon={DollarSign} label="Pembayaran terverifikasi" value={money(stats.approved)} /><Stat icon={TrendingUp} label="Sisa tagihan" value={money(stats.outstanding)} /><Stat icon={ClipboardList} label="Booking aktif" value={`${stats.active} reservasi`} /><Stat icon={Users} label="Total pelanggan" value={`${stats.customers} pelanggan`} /></section><section className="rounded-2xl border border-stone-200 bg-white p-5"><div className="flex items-center justify-between border-b border-stone-100 pb-3"><h2 className="font-serif font-bold">Booking terbaru</h2><Link href="/admin/bookings" className="text-xs font-bold text-gold-deep">Kelola semua</Link></div><div className="mt-3 divide-y divide-stone-100">{bookings.slice(0, 6).map((booking) => <article key={booking.id} className="grid gap-2 py-3 text-xs sm:grid-cols-[1fr_1fr_140px_140px]"><strong>{booking.invoice_number}</strong><span>{booking.customer_name}</span><span>{booking.event_date}</span><span className="font-bold text-gold-deep">{money(Number(booking.total_amount))}</span></article>)}{bookings.length === 0 ? <p className="py-8 text-center text-sm text-stone-400">Belum ada booking.</p> : null}</div></section></div>;
}

function Stat({ icon: Icon, label, value }: { icon: typeof DollarSign; label: string; value: string }) { return <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-5"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-stone-50 text-gold-deep"><Icon className="h-5 w-5" /></div><div><p className="text-[10px] font-bold uppercase text-stone-400">{label}</p><strong className="text-base text-charcoal">{value}</strong></div></div>; }
