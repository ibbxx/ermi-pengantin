'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShoppingBag, Calendar, MapPin, User, Phone, Mail, FileText, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useDresses, useMakeup, useDecor, usePackages, useSettings, db } from '@/data/db';
import { Booking } from '@/types';

// Wrap the actual form in a suspense boundary due to useSearchParams
function BookingFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [dresses] = useDresses();
  const [makeup] = useMakeup();
  const [decorations] = useDecor();
  const [packages] = usePackages();
  const [settings] = useSettings();

  // Pre-filled URL parameters
  const preSelectedDressId = searchParams?.get('dressId') || '';
  const preSelectedSize = searchParams?.get('size') || 'M';
  const preSelectedColor = searchParams?.get('color') || '';
  const preSelectedDate = searchParams?.get('date') || '';
  const preSelectedMakeupId = searchParams?.get('makeupId') || '';
  const preSelectedDecorId = searchParams?.get('decorId') || '';
  const preSelectedPackageId = searchParams?.get('packageId') || '';

  // Form states
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [eventDate, setEventDate] = useState(preSelectedDate);
  const [eventLocation, setEventLocation] = useState('');
  const [eventType, setEventType] = useState<'akad' | 'resepsi' | 'prewedding' | 'lamaran'>('akad');

  // Service Selection checkboxes
  const [selectDressActive, setSelectDressActive] = useState(!!preSelectedDressId);
  const [selectMakeupActive, setSelectMakeupActive] = useState(!!preSelectedMakeupId);
  const [selectDecorActive, setSelectDecorActive] = useState(!!preSelectedDecorId);
  const [selectPackageActive, setSelectPackageActive] = useState(!!preSelectedPackageId);

  // Selected Item dropdown values
  const [selectedDressId, setSelectedDressId] = useState(preSelectedDressId || (dresses[0]?.id || ''));
  const [selectedSize, setSelectedSize] = useState(preSelectedSize);
  const [selectedColor, setSelectedColor] = useState(preSelectedColor || (dresses[0]?.colors[0] || ''));
  
  const [selectedMakeupId, setSelectedMakeupId] = useState(preSelectedMakeupId || (makeup[0]?.id || ''));
  const [selectedDecorId, setSelectedDecorId] = useState(preSelectedDecorId || (decorations[0]?.id || ''));
  const [selectedPackageId, setSelectedPackageId] = useState(preSelectedPackageId || (packages[0]?.id || ''));

  const [notes, setNotes] = useState('');
  const [paymentType, setPaymentType] = useState<'dp' | 'full'>('dp');
  const [paymentMethod, setPaymentMethod] = useState('va_bca');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync initial ids once database is loaded
  useEffect(() => {
    if (!selectedDressId && dresses.length > 0) {
      setSelectedDressId(dresses[0].id);
      setSelectedColor(dresses[0].colors[0]);
    }
  }, [dresses, selectedDressId]);

  useEffect(() => {
    if (!selectedMakeupId && makeup.length > 0) {
      setSelectedMakeupId(makeup[0].id);
    }
  }, [makeup, selectedMakeupId]);

  useEffect(() => {
    if (!selectedDecorId && decorations.length > 0) {
      setSelectedDecorId(decorations[0].id);
    }
  }, [decorations, selectedDecorId]);

  useEffect(() => {
    if (!selectedPackageId && packages.length > 0) {
      setSelectedPackageId(packages[0].id);
    }
  }, [packages, selectedPackageId]);

  // Auto select Dress Color if dress changes
  useEffect(() => {
    const dress = dresses.find((d) => d.id === selectedDressId);
    if (dress && !preSelectedColor) {
      setSelectedColor(dress.colors[0]);
    }
  }, [selectedDressId, dresses]);

  // If wedding package is active, other services are disabled/cleared (since package is all-in-one)
  useEffect(() => {
    if (selectPackageActive) {
      setSelectDressActive(false);
      setSelectMakeupActive(false);
      setSelectDecorActive(false);
    }
  }, [selectPackageActive]);

  useEffect(() => {
    if (selectDressActive || selectMakeupActive || selectDecorActive) {
      setSelectPackageActive(false);
    }
  }, [selectDressActive, selectMakeupActive, selectDecorActive]);

  // Calculations
  const calculations = useMemo(() => {
    let subtotal = 0;
    const dressesSelected: Booking['servicesSelected']['dresses'] = [];
    let makeupSelected: Booking['servicesSelected']['makeup'] = undefined;
    let decorSelected: Booking['servicesSelected']['decor'] = undefined;
    let packageSelected: Booking['servicesSelected']['weddingPackage'] = undefined;

    if (selectPackageActive) {
      const pkg = packages.find((p) => p.id === selectedPackageId);
      if (pkg) {
        subtotal += pkg.price;
        packageSelected = { id: pkg.id, name: pkg.name, price: pkg.price };
      }
    } else {
      if (selectDressActive) {
        const dress = dresses.find((d) => d.id === selectedDressId);
        if (dress) {
          subtotal += dress.price;
          dressesSelected.push({
            id: dress.id,
            name: dress.name,
            size: selectedSize,
            color: selectedColor,
            price: dress.price,
            image: dress.images[0] || ''
          });
        }
      }
      if (selectMakeupActive) {
        const mua = makeup.find((m) => m.id === selectedMakeupId);
        if (mua) {
          subtotal += mua.price;
          makeupSelected = { id: mua.id, name: mua.name, price: mua.price };
        }
      }
      if (selectDecorActive) {
        const decor = decorations.find((d) => d.id === selectedDecorId);
        if (decor) {
          subtotal += decor.price;
          decorSelected = { id: decor.id, name: decor.name, price: decor.price };
        }
      }
    }

    const transportFee = subtotal > 0 ? settings.transportBase : 0; // Dynamic transport charge
    const total = subtotal + transportFee;

    // Minimum DP required:
    // If package, check package's required DP. If standard ala carte, say minDpPercent of total
    let minDp = 0;
    if (selectPackageActive) {
      const pkg = packages.find((p) => p.id === selectedPackageId);
      minDp = pkg ? pkg.depositRequired : 0;
    } else {
      minDp = Math.round(subtotal * (settings.minDpPercent / 100));
    }

    return {
      subtotal,
      transportFee,
      total,
      minDp,
      dressesSelected,
      makeupSelected,
      decorSelected,
      packageSelected
    };
  }, [
    selectDressActive,
    selectMakeupActive,
    selectDecorActive,
    selectPackageActive,
    selectedDressId,
    selectedSize,
    selectedColor,
    selectedMakeupId,
    selectedDecorId,
    selectedPackageId,
    packages,
    dresses,
    makeup,
    decorations,
    settings.minDpPercent,
    settings.transportBase,
  ]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Form Validation
  const validateForm = () => {
    const tempErrors: Record<string, string> = {};
    if (!name.trim()) tempErrors.name = 'Nama pelanggan wajib diisi';
    if (!whatsapp.trim()) tempErrors.whatsapp = 'Nomor WhatsApp wajib diisi';
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) tempErrors.email = 'Email tidak valid';
    if (!address.trim()) tempErrors.address = 'Alamat lengkap wajib diisi';
    if (!eventDate) tempErrors.eventDate = 'Tanggal acara wajib dipilih';
    if (!eventLocation.trim()) tempErrors.eventLocation = 'Lokasi venue/acara wajib diisi';

    if (!selectDressActive && !selectMakeupActive && !selectDecorActive && !selectPackageActive) {
      tempErrors.services = 'Pilih minimal satu layanan atau satu paket lengkap';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate submission delay
    setTimeout(() => {
      // Create new booking object
      const invoiceNum = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const bookingId = `book-${Math.random().toString(36).substring(2, 9)}`;
      
      const newBooking: Booking = {
        id: bookingId,
        invoiceNumber: invoiceNum,
        customerId: 'cust-temp', // Anonymous customer
        customerName: name,
        customerWhatsApp: whatsapp,
        customerEmail: email,
        customerAddress: address,
        eventDate: eventDate,
        eventLocation: eventLocation,
        eventType: eventType,
        servicesSelected: {
          dresses: calculations.dressesSelected,
          makeup: calculations.makeupSelected,
          decor: calculations.decorSelected,
          weddingPackage: calculations.packageSelected,
        },
        notes: notes,
        subtotal: formatPrice(calculations.subtotal),
        additionalFees: formatPrice(calculations.transportFee),
        depositRequired: formatPrice(calculations.minDp),
        totalAmount: formatPrice(calculations.total),
        paymentType: paymentType,
        paymentMethod: paymentMethod,
        paymentStatus: 'pending',
        bookingStatus: 'pending',
        createdAt: new Date().toISOString()
      };

      // Save new booking to database
      db.saveBooking(newBooking)
        .then(() => {
          setIsSubmitting(false);
          // Redirect to checkout with bookingId
          router.push(`/checkout?bookingId=${bookingId}`);
        })
        .catch((err) => {
          console.error('Failed to create booking:', err);
          setIsSubmitting(false);
          alert('Gagal membuat pesanan. Silakan coba lagi.');
        });
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2 mb-10">
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-charcoal">Formulir Booking Layanan</h1>
        <p className="text-xs text-stone-muted">
          Silakan isi detail data diri, waktu pernikahan, dan pilih layanan wedding yang Anda kehendaki di bawah ini.
        </p>
      </div>

      {errors.services && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 text-xs flex items-center gap-2 mb-6 max-w-3xl mx-auto">
          <AlertTriangle className="h-4.5 w-4.5" />
          <span>{errors.services}</span>
        </div>
      )}

      {/* Main Grid */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Data Inputs (Form Fields) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Step 1: Customer Data */}
          <div className="bg-white p-6 rounded-2xl border border-gold-light/20 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-lg text-charcoal flex items-center gap-2 pb-2 border-b border-gold-light/10">
              <User className="h-5 w-5 text-gold-dark" /> 1. Data Diri Pelanggan
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-charcoal block">Nama Lengkap</label>
                <input
                  type="text"
                  placeholder="Masukkan nama Anda..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full bg-ivory-light border rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-gold ${
                    errors.name ? 'border-red-400' : 'border-stone-200'
                  }`}
                />
                {errors.name && <span className="text-[10px] text-red-500 block">{errors.name}</span>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-charcoal block">Nomor WhatsApp Aktif</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-stone-400 font-bold">+62</span>
                  <input
                    type="tel"
                    placeholder="81234567890"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className={`w-full bg-ivory-light border rounded-xl py-2 px-3 pl-12 text-xs focus:outline-none focus:border-gold ${
                      errors.whatsapp ? 'border-red-400' : 'border-stone-200'
                    }`}
                  />
                </div>
                {errors.whatsapp && <span className="text-[10px] text-red-500 block">{errors.whatsapp}</span>}
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-charcoal block">Email</label>
                <input
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full bg-ivory-light border rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-gold ${
                    errors.email ? 'border-red-400' : 'border-stone-200'
                  }`}
                />
                {errors.email && <span className="text-[10px] text-red-500 block">{errors.email}</span>}
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-charcoal block">Alamat Lengkap</label>
                <textarea
                  rows={3}
                  placeholder="Masukkan alamat rumah lengkap Anda (untuk keperluan pengiriman/fitting)..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={`w-full bg-ivory-light border rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-gold resize-none ${
                    errors.address ? 'border-red-400' : 'border-stone-200'
                  }`}
                />
                {errors.address && <span className="text-[10px] text-red-500 block">{errors.address}</span>}
              </div>
            </div>
          </div>

          {/* Step 2: Event Details */}
          <div className="bg-white p-6 rounded-2xl border border-gold-light/20 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-lg text-charcoal flex items-center gap-2 pb-2 border-b border-gold-light/10">
              <Calendar className="h-5 w-5 text-gold-dark" /> 2. Detail Jadwal & Lokasi Acara
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-charcoal block">Tanggal Acara Pernikahan</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className={`w-full bg-ivory-light border rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-gold ${
                    errors.eventDate ? 'border-red-400' : 'border-stone-200'
                  }`}
                />
                {errors.eventDate && <span className="text-[10px] text-red-500 block">{errors.eventDate}</span>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-charcoal block">Jenis Acara</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as any)}
                  className="w-full bg-ivory-light border border-stone-200 focus:border-gold rounded-xl py-2 px-3 text-xs focus:outline-none"
                >
                  <option value="akad">Akad Nikah / Pemberkatan</option>
                  <option value="resepsi">Resepsi Pernikahan</option>
                  <option value="prewedding">Foto Prewedding</option>
                  <option value="lamaran">Prosesi Lamaran</option>
                </select>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-charcoal block">Nama & Lokasi Venue Acara</label>
                <input
                  type="text"
                  placeholder="Gedung Ballroom, Hotel, Rumah Alamat E-1..."
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  className={`w-full bg-ivory-light border rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-gold ${
                    errors.eventLocation ? 'border-red-400' : 'border-stone-200'
                  }`}
                />
                {errors.eventLocation && <span className="text-[10px] text-red-500 block">{errors.eventLocation}</span>}
              </div>
            </div>
          </div>

          {/* Step 3: Service Custom Selection */}
          <div className="bg-white p-6 rounded-2xl border border-gold-light/20 shadow-sm space-y-6">
            <h3 className="font-serif font-bold text-lg text-charcoal flex items-center gap-2 pb-2 border-b border-gold-light/10">
              <ShoppingBag className="h-5 w-5 text-gold-dark" /> 3. Pilih Layanan Pernikahan
            </h3>

            {/* Option A: Packages All-in-One */}
            <div className="space-y-4">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectPackageActive}
                  onChange={(e) => setSelectPackageActive(e.target.checked)}
                  className="h-4.5 w-4.5 rounded border-stone-300 text-gold focus:ring-gold accent-gold"
                />
                <span className="text-sm font-bold text-charcoal group-hover:text-gold-dark transition-colors">
                  Pilih Paket Wedding Lengkap (All-in-One)
                </span>
              </label>

              {selectPackageActive && (
                <div className="bg-ivory-light p-4 rounded-xl border border-gold-light/20 space-y-2 animate-fade-in text-xs">
                  <label className="font-semibold text-stone-600 block mb-1">Pilih Paket Pernikahan:</label>
                  <select
                    value={selectedPackageId}
                    onChange={(e) => setSelectedPackageId(e.target.value)}
                    className="w-full bg-white border border-stone-200 focus:border-gold rounded-xl py-2 px-3 text-xs focus:outline-none"
                  >
                    {packages.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name} - {formatPrice(pkg.price)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="relative py-2 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gold-light/10" /></div>
              <span className="relative px-3 bg-white text-[10px] text-stone-400 font-bold uppercase tracking-wider">ATAU PILIH ALA CARTE</span>
            </div>

            {/* Option B: Ala Carte List */}
            <div className="space-y-6">
              {/* B1: Sewa Baju */}
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectDressActive}
                    onChange={(e) => setSelectDressActive(e.target.checked)}
                    className="h-4.5 w-4.5 rounded border-stone-300 text-gold focus:ring-gold accent-gold"
                  />
                  <span className="text-sm font-semibold text-charcoal group-hover:text-gold-dark transition-colors">
                    Sewa Baju Pengantin
                  </span>
                </label>

                {selectDressActive && (
                  <div className="bg-ivory-light p-4 rounded-xl border border-gold-light/20 space-y-3 animate-fade-in text-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-3">
                      <label className="font-semibold text-stone-600 block mb-1">Pilih Gaun/Baju:</label>
                      <select
                        value={selectedDressId}
                        onChange={(e) => setSelectedDressId(e.target.value)}
                        className="w-full bg-white border border-stone-200 focus:border-gold rounded-xl py-2 px-3 text-xs focus:outline-none"
                      >
                        {dresses.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name} ({d.category}) - {formatPrice(d.price)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-stone-600 block mb-1">Ukuran:</label>
                      <select
                        value={selectedSize}
                        onChange={(e) => setSelectedSize(e.target.value)}
                        className="w-full bg-white border border-stone-200 focus:border-gold rounded-xl py-2 px-3 text-xs focus:outline-none"
                      >
                        {dresses.find((d) => d.id === selectedDressId)?.sizes.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="font-semibold text-stone-600 block mb-1">Pilihan Warna:</label>
                      <select
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className="w-full bg-white border border-stone-200 focus:border-gold rounded-xl py-2 px-3 text-xs focus:outline-none"
                      >
                        {dresses.find((d) => d.id === selectedDressId)?.colors.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* B2: Makeup MUA */}
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectMakeupActive}
                    onChange={(e) => setSelectMakeupActive(e.target.checked)}
                    className="h-4.5 w-4.5 rounded border-stone-300 text-gold focus:ring-gold accent-gold"
                  />
                  <span className="text-sm font-semibold text-charcoal group-hover:text-gold-dark transition-colors">
                    Makeup Artist (MUA)
                  </span>
                </label>

                {selectMakeupActive && (
                  <div className="bg-ivory-light p-4 rounded-xl border border-gold-light/20 space-y-2 animate-fade-in text-xs">
                    <label className="font-semibold text-stone-600 block mb-1">Pilih Paket Makeup:</label>
                    <select
                      value={selectedMakeupId}
                      onChange={(e) => setSelectedMakeupId(e.target.value)}
                      className="w-full bg-white border border-stone-200 focus:border-gold rounded-xl py-2 px-3 text-xs focus:outline-none"
                    >
                      {makeup.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} - {formatPrice(m.price)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* B3: Dekorasi Pelaminan */}
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectDecorActive}
                    onChange={(e) => setSelectDecorActive(e.target.checked)}
                    className="h-4.5 w-4.5 rounded border-stone-300 text-gold focus:ring-gold accent-gold"
                  />
                  <span className="text-sm font-semibold text-charcoal group-hover:text-gold-dark transition-colors">
                    Dekorasi Pelaminan
                  </span>
                </label>

                {selectDecorActive && (
                  <div className="bg-ivory-light p-4 rounded-xl border border-gold-light/20 space-y-2 animate-fade-in text-xs">
                    <label className="font-semibold text-stone-600 block mb-1">Pilih Tema/Paket Dekorasi:</label>
                    <select
                      value={selectedDecorId}
                      onChange={(e) => setSelectedDecorId(e.target.value)}
                      className="w-full bg-white border border-stone-200 focus:border-gold rounded-xl py-2 px-3 text-xs focus:outline-none"
                    >
                      {decorations.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.theme}) - Mulai {formatPrice(d.price)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Step 4: Notes & Payment details */}
          <div className="bg-white p-6 rounded-2xl border border-gold-light/20 shadow-sm space-y-6">
            <h3 className="font-serif font-bold text-lg text-charcoal flex items-center gap-2 pb-2 border-b border-gold-light/10">
              <FileText className="h-5 w-5 text-gold-dark" /> 4. Metode Pembayaran & Catatan
            </h3>
            
            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-charcoal block">Catatan Tambahan (Kustomisasi/Permintaan Khusus)</label>
                <textarea
                  rows={2}
                  placeholder="Tuliskan jika ada kebutuhan khusus seperti ukuran kerah jas, siger adat Sunda, hijab styling, dll..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-ivory-light border border-stone-200 focus:border-gold rounded-xl py-2 px-3 focus:outline-none resize-none"
                />
              </div>

              {/* Payment Type */}
              <div className="space-y-2">
                <label className="font-semibold text-charcoal block">Tipe Pembayaran:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentType('dp')}
                    className={`py-3 px-4 rounded-xl border flex flex-col items-center transition-all ${
                      paymentType === 'dp'
                        ? 'bg-gold/5 border-gold text-gold-dark shadow-sm ring-1 ring-gold/30'
                        : 'bg-white border-stone-200 text-charcoal hover:border-gold-light'
                    }`}
                  >
                    <span className="font-bold">Bayar DP Dulu ({selectPackageActive ? 'Tercantum' : `${settings.minDpPercent}%`})</span>
                    <span className="text-[10px] text-stone-500 mt-1">
                      Bayar minimal {formatPrice(calculations.minDp)} untuk aman jadwal
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentType('full')}
                    className={`py-3 px-4 rounded-xl border flex flex-col items-center transition-all ${
                      paymentType === 'full'
                        ? 'bg-gold/5 border-gold text-gold-dark shadow-sm ring-1 ring-gold/30'
                        : 'bg-white border-stone-200 text-charcoal hover:border-gold-light'
                    }`}
                  >
                    <span className="font-bold">Bayar Lunas</span>
                    <span className="text-[10px] text-stone-500 mt-1">
                      Bayar lunas {formatPrice(calculations.total)} sekarang juga
                    </span>
                  </button>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <label className="font-semibold text-charcoal block">Metode Pembayaran Transfer:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: 'Bank BCA (VA)', value: 'va_bca' },
                    { label: 'Bank Mandiri (VA)', value: 'va_mandiri' },
                    { label: 'Gopay / QRIS', value: 'gopay' },
                    { label: 'Kartu Kredit', value: 'credit_card' }
                  ].map((m) => (
                    <button
                      type="button"
                      key={m.value}
                      onClick={() => setPaymentMethod(m.value)}
                      className={`py-2 px-3 rounded-lg border text-center font-bold transition-all ${
                        paymentMethod === m.value
                          ? 'bg-gold border-gold text-white shadow-sm'
                          : 'bg-white border-stone-200 text-charcoal hover:border-gold-light'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Interactive Bill Summary */}
        <div className="lg:col-span-4">
          <div className="bg-white p-6 rounded-3xl border border-gold-light/25 shadow-lg space-y-6 lg:sticky lg:top-24 text-xs">
            <h3 className="font-serif font-bold text-base text-charcoal border-b border-gold-light/10 pb-3 flex items-center gap-1.5">
              Ringkasan Pemesanan
            </h3>

            {/* List items selected */}
            <div className="space-y-3.5 divide-y divide-gold-light/10 max-h-60 overflow-y-auto">
              {!selectDressActive && !selectMakeupActive && !selectDecorActive && !selectPackageActive && (
                <p className="text-stone-400 italic py-4 text-center">Belum ada layanan yang dipilih.</p>
              )}

              {/* Dress selected item */}
              {selectDressActive && (
                <div className="pt-3 first:pt-0">
                  <div className="flex justify-between font-bold text-charcoal">
                    <span>{dresses.find((d) => d.id === selectedDressId)?.name}</span>
                    <span>{formatPrice(dresses.find((d) => d.id === selectedDressId)?.price || 0)}</span>
                  </div>
                  <div className="text-[10px] text-stone-500 mt-0.5 space-x-2">
                    <span>Ukuran: {selectedSize}</span>
                    <span>•</span>
                    <span>Warna: {selectedColor}</span>
                  </div>
                </div>
              )}

              {/* Makeup selected item */}
              {selectMakeupActive && (
                <div className="pt-3 first:pt-0">
                  <div className="flex justify-between font-bold text-charcoal">
                    <span>{makeup.find((m) => m.id === selectedMakeupId)?.name}</span>
                    <span>{formatPrice(makeup.find((m) => m.id === selectedMakeupId)?.price || 0)}</span>
                  </div>
                  <span className="text-[10px] text-stone-500 block mt-0.5">Jasa Makeup Pengantin</span>
                </div>
              )}

              {/* Decor selected item */}
              {selectDecorActive && (
                <div className="pt-3 first:pt-0">
                  <div className="flex justify-between font-bold text-charcoal">
                    <span>{decorations.find((d) => d.id === selectedDecorId)?.name}</span>
                    <span>{formatPrice(decorations.find((d) => d.id === selectedDecorId)?.price || 0)}</span>
                  </div>
                  <span className="text-[10px] text-stone-500 block mt-0.5">Dekorasi Pelaminan Venue</span>
                </div>
              )}

              {/* Wedding Package selected item */}
              {selectPackageActive && (
                <div className="pt-3 first:pt-0">
                  <div className="flex justify-between font-bold text-charcoal">
                    <span>{packages.find((p) => p.id === selectedPackageId)?.name}</span>
                    <span>{formatPrice(packages.find((p) => p.id === selectedPackageId)?.price || 0)}</span>
                  </div>
                  <span className="text-[10px] text-stone-500 block mt-0.5">Paket Pernikahan All-in-One</span>
                </div>
              )}
            </div>

            {/* Fees list */}
            <div className="border-t border-gold-light/20 pt-4 space-y-2 text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal Layanan:</span>
                <span className="font-semibold text-charcoal">{formatPrice(calculations.subtotal)}</span>
              </div>
              {calculations.subtotal > 0 && (
                <div className="flex justify-between">
                  <span>Biaya Pengantaran/Transport:</span>
                  <span className="font-semibold text-charcoal">{formatPrice(calculations.transportFee)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-charcoal pt-2 border-t border-dashed border-gold-light/10">
                <span>Total Estimasi:</span>
                <span className="text-gold-dark">{formatPrice(calculations.total)}</span>
              </div>
            </div>

            {/* DP / Full Payment Info Alert */}
            <div className="bg-ivory border border-gold-light/20 p-4 rounded-2xl space-y-2 text-[11px] text-stone-600">
              <div className="flex justify-between font-semibold">
                <span>Metode Bayar:</span>
                <span className="text-charcoal uppercase">{paymentType === 'dp' ? 'Uang Muka (DP)' : 'Lunas (Full)'}</span>
              </div>
              <div className="flex justify-between font-bold text-charcoal text-xs border-t border-dashed border-gold-light/15 pt-1.5">
                <span>Jumlah Tagihan:</span>
                <span className="text-emerald-700">
                  {formatPrice(paymentType === 'dp' ? calculations.minDp : calculations.total)}
                </span>
              </div>
              {paymentType === 'dp' && (
                <p className="text-[9px] text-stone-400 leading-normal italic pt-1 border-t border-gold-light/5">
                  *Sisa pelunasan sebesar {formatPrice(calculations.total - calculations.minDp)} dibayarkan selambat-lambatnya H-7 sebelum hari pelaksanaan acara.
                </p>
              )}
            </div>

            {/* Submission CTA */}
            <div className="space-y-3.5">
              <button
                type="submit"
                disabled={isSubmitting || calculations.subtotal === 0}
                className="w-full py-3.5 bg-gold hover:bg-gold-dark disabled:bg-stone-300 text-white rounded-xl uppercase tracking-wider font-bold transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 text-xs cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                    <span>Memproses Reservasi...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4.5 w-4.5" />
                    <span>Lanjutkan ke Checkout</span>
                  </>
                )}
              </button>
              
              <div className="flex gap-1.5 items-center justify-center text-[10px] text-stone-400">
                <ShieldCheck className="h-4 w-4 text-gold-dark" />
                <span>Transaksi dijamin aman & tersertifikasi SSL</span>
              </div>
            </div>

          </div>
        </div>

      </form>
    </div>
  );
}

export default function BookingForm() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-xs text-stone-500">
        Loading parameter booking...
      </div>
    }>
      <BookingFormContent />
    </Suspense>
  );
}
