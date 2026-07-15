'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Mail, MapPin, Phone, Search } from 'lucide-react';
import { adminFetch, type AdminBooking } from '@/lib/admin-booking-api';

export default function AdminCustomersPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    try { setBookings((await adminFetch<{ bookings: AdminBooking[] }>('/api/admin/bookings')).bookings); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Data pelanggan gagal dimuat.'); }
  }, []);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- synchronize authenticated admin data after mount.
  useEffect(() => { void load(); }, [load]);
  const customers = useMemo(() => {
    const grouped = new Map<string, { name: string; whatsapp: string; email: string; address: string; count: number }>();
    bookings.forEach((booking) => {
      const key = booking.customer_whatsapp;
      const current = grouped.get(key);
      grouped.set(key, current ? { ...current, count: current.count + 1 } : { name: booking.customer_name, whatsapp: booking.customer_whatsapp, email: booking.customer_email, address: booking.customer_address, count: 1 });
    });
    const query = search.toLowerCase();
    return [...grouped.values()].filter((item) => [item.name, item.whatsapp, item.email].some((value) => value.toLowerCase().includes(query)));
  }, [bookings, search]);
  return <div className="space-y-6"><header className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="font-serif text-xl font-bold">Data Pelanggan</h1><p className="text-xs text-stone-500">Kontak pelanggan dari API admin, bukan akses tabel publik.</p></div><label className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" /><input className="rounded-xl border border-stone-200 py-2 pl-9 pr-3 text-xs outline-none focus:border-gold" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari pelanggan…" /></label></header>{error ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{customers.map((customer) => <article key={customer.whatsapp} className="rounded-2xl border border-stone-200 bg-white p-5"><div className="flex items-center justify-between"><h2 className="font-serif font-bold">{customer.name}</h2><span className="rounded-full bg-stone-100 px-2 py-1 text-[10px] font-bold">{customer.count} booking</span></div><div className="mt-4 space-y-2 text-xs text-stone-600"><p className="flex gap-2"><Phone className="h-4 w-4 text-emerald-600" />{customer.whatsapp}</p><p className="flex gap-2"><Mail className="h-4 w-4 text-gold-deep" />{customer.email || '-'}</p><p className="flex gap-2"><MapPin className="h-4 w-4 text-stone-400" />{customer.address || '-'}</p></div><a className="mt-4 block rounded-xl bg-emerald-600 px-3 py-2 text-center text-xs font-bold text-white" href={`https://wa.me/${customer.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">Chat WhatsApp</a></article>)}</section></div>;
}
