'use client';

import { FormEvent, Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CalendarDays, Check, ChevronLeft, ChevronRight, Copy, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import { useDecor, useDresses, useMakeup, usePackages } from '@/data/db';
import type { BookingRequestInput } from '@/types';

const inputClass = 'w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/15';

interface BookingCreated {
  bookingId: string;
  invoiceNumber: string;
  accessUrl: string;
  adminWhatsApp: string;
  estimate: { subtotal: number; additionalFees: number; depositRequired: number; totalAmount: number };
}

function money(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
}

function BookingForm() {
  const searchParams = useSearchParams();
  const [dresses] = useDresses();
  const [makeup] = useMakeup();
  const [decor] = useDecor();
  const [packages] = usePackages();
  const decorPackages = useMemo(() => decor.filter((item) => item.decorType === 'package'), [decor]);

  const [step, setStep] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerWhatsApp, setCustomerWhatsApp] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [eventDate, setEventDate] = useState(searchParams.get('date') || '');
  const [eventLocation, setEventLocation] = useState('');
  const [eventType, setEventType] = useState<BookingRequestInput['eventType']>('akad');
  const [notes, setNotes] = useState('');
  const [usePackage, setUsePackage] = useState(Boolean(searchParams.get('packageId')));
  const [useDress, setUseDress] = useState(Boolean(searchParams.get('dressId')));
  const [makeupEnabled, setMakeupEnabled] = useState(Boolean(searchParams.get('makeupId')));
  const [decorEnabled, setDecorEnabled] = useState(Boolean(searchParams.get('decorId')));
  const [packageId, setPackageId] = useState(searchParams.get('packageId') || '');
  const [dressId, setDressId] = useState(searchParams.get('dressId') || '');
  const [dressSize, setDressSize] = useState(searchParams.get('size') || '');
  const [dressColor, setDressColor] = useState(searchParams.get('color') || '');
  const [makeupId, setMakeupId] = useState(searchParams.get('makeupId') || '');
  const [decorId, setDecorId] = useState(searchParams.get('decorId') || '');
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState<BookingCreated | null>(null);
  const [copied, setCopied] = useState(false);

  const selectedDress = dresses.find((item) => item.id === (dressId || dresses[0]?.id));
  const selectedPackageId = packageId || packages[0]?.id || '';
  const selectedMakeupId = makeupId || makeup[0]?.id || '';
  const selectedDecorId = decorId || decorPackages[0]?.id || '';
  const selectedDressId = dressId || dresses[0]?.id || '';
  const selectedSize = dressSize || selectedDress?.sizes[0] || '';
  const selectedColor = dressColor || selectedDress?.colors[0] || '';
  const minimumDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().slice(0, 10);
  }, []);

  function validate(target: number) {
    if (target >= 2 && (!customerName.trim() || !customerWhatsApp.trim())) {
      setError('Nama dan nomor WhatsApp wajib diisi.');
      return false;
    }
    if (target >= 3 && (!eventDate || eventDate < minimumDate || !eventLocation.trim())) {
      setError('Tanggal minimal besok dan lokasi acara wajib diisi.');
      return false;
    }
    setError('');
    return true;
  }

  function next() {
    const target = Math.min(3, step + 1);
    if (validate(target)) setStep(target);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate(3)) return;
    if (!consent) return setError('Centang persetujuan pemrosesan data untuk melanjutkan.');
    if (!usePackage && !useDress && !makeupEnabled && !decorEnabled) return setError('Pilih minimal satu layanan.');
    if (usePackage && !selectedPackageId) return setError('Paket belum tersedia atau belum dipilih.');

    const input: BookingRequestInput = {
      customerName,
      customerWhatsApp,
      customerEmail,
      customerAddress,
      eventDate,
      eventLocation,
      eventType,
      notes,
      consent,
      ...(usePackage ? { weddingPackageId: selectedPackageId } : {
        ...(useDress && selectedDressId ? { dressPreferences: [{ dressId: selectedDressId, size: selectedSize, color: selectedColor }] } : {}),
        ...(makeupEnabled && selectedMakeupId ? { makeupId: selectedMakeupId } : {}),
        ...(decorEnabled && selectedDecorId ? { decorId: selectedDecorId } : {}),
      }),
    };

    setSubmitting(true);
    setError('');
    try {
      const response = await fetch('/api/customer/booking-requests', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = await response.json() as BookingCreated & { error?: string };
      if (!response.ok) throw new Error(data.error || 'Permintaan booking gagal dikirim.');
      setCreated(data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Permintaan booking gagal dikirim.');
    } finally {
      setSubmitting(false);
    }
  }

  if (created) {
    const waText = `Halo Admin Ermi Pengantin, saya baru mengajukan booking ${created.invoiceNumber}. Mohon informasi selanjutnya.`;
    return (
      <main className="mx-auto max-w-2xl space-y-6 px-4 py-12 sm:px-6">
        <section className="rounded-3xl border border-emerald-200 bg-white p-6 text-center shadow-sm sm:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700"><Check className="h-7 w-7" /></div>
          <h1 className="mt-4 font-serif text-3xl font-bold text-charcoal">Permintaan booking terkirim</h1>
          <p className="mt-2 text-sm text-stone-500">Simpan invoice dan link aman ini. Pembayaran baru dibuka setelah admin mengonfirmasi ketersediaan.</p>
          <div className="mt-6 rounded-2xl bg-stone-50 p-5 text-left">
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Nomor invoice</span>
            <p className="mt-1 break-all font-mono text-xl font-black text-charcoal">{created.invoiceNumber}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><span className="block text-xs text-stone-500">Total estimasi</span><strong>{money(created.estimate.totalAmount)}</strong></div><div><span className="block text-xs text-stone-500">Estimasi DP</span><strong>{money(created.estimate.depositRequired)}</strong></div></div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={async () => { await navigator.clipboard.writeText(created.accessUrl); setCopied(true); }} className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-300 px-4 py-3 text-sm font-bold text-charcoal hover:bg-stone-50"><Copy className="h-4 w-4" />{copied ? 'Link tersalin' : 'Salin link status'}</button>
            <Link href={created.accessUrl} className="inline-flex items-center justify-center gap-2 rounded-xl bg-charcoal px-4 py-3 text-sm font-bold text-white">Buka status booking <ChevronRight className="h-4 w-4" /></Link>
          </div>
          {created.adminWhatsApp ? <a href={`https://wa.me/${created.adminWhatsApp.replace(/\D/g, '')}?text=${encodeURIComponent(waText)}`} target="_blank" rel="noreferrer" className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white"><MessageCircle className="h-4 w-4" /> Hubungi admin via WhatsApp</a> : null}
        </section>
      </main>
    );
  }

  const steps = ['Data diri', 'Acara', 'Layanan'];
  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <Breadcrumb customLastLabel={`Langkah ${step}: ${steps[step - 1]}`} />
      <header className="text-center"><h1 className="font-serif text-3xl font-bold text-charcoal">Ajukan Booking</h1><p className="mt-2 text-sm text-stone-500">Tiga langkah untuk meminta jadwal. Harga final dan pembayaran dikonfirmasi oleh admin.</p></header>
      <ol className="mx-auto grid max-w-2xl grid-cols-3 gap-2">{steps.map((label, index) => <li key={label} className={`rounded-xl border px-3 py-3 text-center text-xs font-bold ${index + 1 <= step ? 'border-gold bg-gold/10 text-gold-deep' : 'border-stone-200 text-stone-400'}`}>{index + 1}. {label}</li>)}</ol>
      {error ? <p role="alert" className="mx-auto max-w-3xl rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p> : null}
      <form onSubmit={submit} className="mx-auto max-w-3xl rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
        {step === 1 ? <section className="grid gap-4 sm:grid-cols-2"><Heading icon={ShieldCheck} title="Data pelanggan" description="Invoice dan akses status akan dicocokkan dengan nomor WhatsApp ini." /><Field label="Nama lengkap"><input className={inputClass} value={customerName} onChange={(e) => setCustomerName(e.target.value)} required /></Field><Field label="Nomor WhatsApp"><input className={inputClass} value={customerWhatsApp} onChange={(e) => setCustomerWhatsApp(e.target.value)} placeholder="0812…" inputMode="tel" required /></Field><Field label="Email (opsional)"><input className={inputClass} type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} /></Field><Field label="Alamat (opsional)"><input className={inputClass} value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} /></Field></section> : null}
        {step === 2 ? <section className="grid gap-4 sm:grid-cols-2"><Heading icon={CalendarDays} title="Rencana acara" description="Admin akan mengecek jadwal dan ketersediaan unit secara langsung." /><Field label="Tanggal acara"><input className={inputClass} type="date" min={minimumDate} value={eventDate} onChange={(e) => setEventDate(e.target.value)} required /></Field><Field label="Jenis acara"><select className={inputClass} value={eventType} onChange={(e) => setEventType(e.target.value as BookingRequestInput['eventType'])}><option value="akad">Akad</option><option value="resepsi">Resepsi</option><option value="prewedding">Prewedding</option><option value="lamaran">Lamaran</option></select></Field><Field label="Lokasi acara" wide><input className={inputClass} value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} required /></Field><Field label="Catatan (opsional)" wide><textarea className={`${inputClass} min-h-24 resize-y`} value={notes} onChange={(e) => setNotes(e.target.value)} /></Field></section> : null}
        {step === 3 ? <section className="space-y-5"><Heading icon={Sparkles} title="Preferensi layanan" description="Browser hanya mengirim ID dan preferensi; nominal dihitung ulang oleh server." /><label className="flex gap-3 rounded-2xl border border-stone-200 p-4"><input type="checkbox" checked={usePackage} onChange={(e) => { setUsePackage(e.target.checked); if (e.target.checked) { setUseDress(false); setMakeupEnabled(false); setDecorEnabled(false); } }} /><span className="flex-1 text-sm"><strong>Paket pernikahan</strong><span className="mt-2 block"><select className={inputClass} disabled={!usePackage} value={selectedPackageId} onChange={(e) => setPackageId(e.target.value)}>{packages.map((item) => <option key={item.id} value={item.id}>{item.name} — {money(item.price)}</option>)}</select></span></span></label><ServiceToggle label="Busana" checked={useDress} onChange={(value) => { setUseDress(value); if (value) setUsePackage(false); }}>{dresses.length ? <><select className={inputClass} value={selectedDressId} onChange={(e) => { setDressId(e.target.value); setDressSize(''); setDressColor(''); }}>{dresses.map((item) => <option key={item.id} value={item.id}>{item.name} — {money(item.price)}</option>)}</select><div className="mt-2 grid grid-cols-2 gap-2"><select className={inputClass} value={selectedSize} onChange={(e) => setDressSize(e.target.value)}>{selectedDress?.sizes.map((value) => <option key={value}>{value}</option>)}</select><select className={inputClass} value={selectedColor} onChange={(e) => setDressColor(e.target.value)}>{selectedDress?.colors.map((value) => <option key={value}>{value}</option>)}</select></div></> : <Unavailable />}</ServiceToggle><ServiceToggle label="Makeup" checked={makeupEnabled} onChange={(value) => { setMakeupEnabled(value); if (value) setUsePackage(false); }}>{makeup.length ? <select className={inputClass} value={selectedMakeupId} onChange={(e) => setMakeupId(e.target.value)}>{makeup.map((item) => <option key={item.id} value={item.id}>{item.name} — {money(item.price)}</option>)}</select> : <Unavailable />}</ServiceToggle><ServiceToggle label="Dekorasi" checked={decorEnabled} onChange={(value) => { setDecorEnabled(value); if (value) setUsePackage(false); }}>{decorPackages.length ? <select className={inputClass} value={selectedDecorId} onChange={(e) => setDecorId(e.target.value)}>{decorPackages.map((item) => <option key={item.id} value={item.id}>{item.name} — mulai {money(item.price)}</option>)}</select> : <Unavailable />}</ServiceToggle><label className="flex items-start gap-3 rounded-xl bg-stone-50 p-4 text-xs text-stone-600"><input className="mt-0.5" type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required /><span>Saya menyetujui data ini dipakai untuk memproses permintaan booking dan menghubungi saya melalui WhatsApp.</span></label></section> : null}
        <div className="mt-7 flex gap-3 border-t border-stone-100 pt-5">{step > 1 ? <button type="button" onClick={() => { setError(''); setStep(step - 1); }} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-stone-300 px-4 py-3 text-sm font-bold"><ChevronLeft className="h-4 w-4" /> Kembali</button> : null}{step < 3 ? <button type="button" onClick={next} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-charcoal px-4 py-3 text-sm font-bold text-white">Lanjut <ChevronRight className="h-4 w-4" /></button> : <button disabled={submitting} className="flex-1 rounded-xl bg-gold px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{submitting ? 'Mengirim…' : 'Kirim permintaan booking'}</button>}</div>
      </form>
    </main>
  );
}

function Heading({ icon: Icon, title, description }: { icon: typeof ShieldCheck; title: string; description: string }) { return <div className="sm:col-span-2"><div className="flex items-center gap-2"><Icon className="h-5 w-5 text-gold-deep" /><h2 className="font-serif text-xl font-bold text-charcoal">{title}</h2></div><p className="mt-1 text-xs text-stone-500">{description}</p></div>; }
function Field({ label, wide, children }: { label: string; wide?: boolean; children: React.ReactNode }) { return <label className={wide ? 'sm:col-span-2' : ''}><span className="mb-1.5 block text-xs font-bold text-charcoal">{label}</span>{children}</label>; }
function ServiceToggle({ label, checked, onChange, children }: { label: string; checked: boolean; onChange: (value: boolean) => void; children: React.ReactNode }) { return <label className="flex gap-3 rounded-2xl border border-stone-200 p-4"><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} /><span className="flex-1 text-sm"><strong>{label}</strong>{checked ? <span className="mt-2 block">{children}</span> : null}</span></label>; }
function Unavailable() { return <span className="text-xs text-stone-400">Belum ada pilihan yang tersedia.</span>; }

export default function BookingPage() {
  return <Suspense fallback={<main className="px-4 py-16 text-center text-sm text-stone-500">Memuat formulir booking…</main>}><BookingForm /></Suspense>;
}
