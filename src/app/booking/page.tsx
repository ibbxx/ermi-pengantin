'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ShoppingBag, 
  Calendar, 
  User, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Info,
  MapPin,
  Mail,
  Phone,
  Sparkles
} from 'lucide-react';
import { useDresses, useMakeup, useDecor, usePackages, useSettings, db } from '@/data/db';
import { Booking } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Breadcrumb from '@/components/Breadcrumb';

// Wrap the actual form in a suspense boundary due to useSearchParams
function BookingFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [dresses] = useDresses();
  const [makeup] = useMakeup();
  const [decorations] = useDecor();
  const [packages] = usePackages();
  const [settings] = useSettings();
  
  const packageDecorations = useMemo(
    () => decorations.filter((decor) => decor.decorType === 'package'),
    [decorations]
  );

  // Pre-filled URL parameters
  const preSelectedDressId = searchParams?.get('dressId') || '';
  const preSelectedSize = searchParams?.get('size') || 'M';
  const preSelectedColor = searchParams?.get('color') || '';
  const preSelectedDate = searchParams?.get('date') || '';
  const preSelectedMakeupId = searchParams?.get('makeupId') || '';
  const preSelectedDecorId = searchParams?.get('decorId') || '';
  const preSelectedPackageId = searchParams?.get('packageId') || '';

  const tomorrowDateString = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // Wizard Stepper State
  const [currentStep, setCurrentStep] = useState(1);

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
  const [selectedDecorId, setSelectedDecorId] = useState(preSelectedDecorId);
  const [selectedPackageId, setSelectedPackageId] = useState(preSelectedPackageId || (packages[0]?.id || ''));

  const [notes, setNotes] = useState('');
  const [paymentType, setPaymentType] = useState<'dp' | 'full'>('dp');
  const [paymentMethod, setPaymentMethod] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const selectedDecor = packageDecorations.find((decor) => decor.id === selectedDecorId);
  const isDecorSelectionActive = selectDecorActive && !!selectedDecor;

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

  // Auto set payment method based on enabled settings
  useEffect(() => {
    if (settings && !paymentMethod) {
      if (settings.tfEnabled) {
        setPaymentMethod('tf');
      } else if (settings.qrisEnabled) {
        setPaymentMethod('qris');
      }
    }
  }, [settings, paymentMethod]);

  // If wedding package is active, other services are disabled/cleared (since package is all-in-one)
  useEffect(() => {
    if (selectPackageActive) {
      setSelectDressActive(false);
      setSelectMakeupActive(false);
      setSelectDecorActive(false);
    }
  }, [selectPackageActive]);

  useEffect(() => {
    if (selectDressActive || selectMakeupActive || isDecorSelectionActive) {
      setSelectPackageActive(false);
    }
  }, [selectDressActive, selectMakeupActive, isDecorSelectionActive]);

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
      if (isDecorSelectionActive) {
        const decor = packageDecorations.find((d) => d.id === selectedDecorId);
        if (decor) {
          subtotal += decor.price;
          decorSelected = { id: decor.id, name: decor.name, price: decor.price };
        }
      }
    }

    const transportFee = subtotal > 0 ? settings.transportBase : 0; // Dynamic transport charge
    const total = subtotal + transportFee;

    // Minimum DP required:
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
    isDecorSelectionActive,
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
    packageDecorations,
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

  // Step Validation
  const validateStep1 = () => {
    const tempErrors: Record<string, string> = {};
    if (!name.trim()) tempErrors.name = 'Nama pelanggan wajib diisi';
    if (!whatsapp.trim()) tempErrors.whatsapp = 'Nomor WhatsApp wajib diisi';
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) tempErrors.email = 'Email tidak valid';
    if (!address.trim()) tempErrors.address = 'Alamat lengkap wajib diisi';
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const validateStep2 = () => {
    const tempErrors: Record<string, string> = {};
    if (!eventDate) {
      tempErrors.eventDate = 'Tanggal acara wajib dipilih';
    } else if (eventDate < tomorrowDateString) {
      tempErrors.eventDate = 'Tanggal acara minimal harus besok hari';
    }
    if (!eventLocation.trim()) tempErrors.eventLocation = 'Lokasi acara wajib diisi';
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const validateStep3 = () => {
    const tempErrors: Record<string, string> = {};
    if (!selectDressActive && !selectMakeupActive && !isDecorSelectionActive && !selectPackageActive) {
      tempErrors.services = 'Pilih minimal satu layanan atau satu paket lengkap';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const validateStep4 = () => {
    const tempErrors: Record<string, string> = {};
    if (!paymentMethod) {
      tempErrors.paymentMethod = 'Pilih salah satu metode pembayaran';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) setCurrentStep(2);
    else if (currentStep === 2 && validateStep2()) setCurrentStep(3);
    else if (currentStep === 3 && validateStep3()) setCurrentStep(4);
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1() || !validateStep2() || !validateStep3() || !validateStep4()) return;

    setIsSubmitting(true);

    const invoiceNum = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const bookingId = `book-${Math.random().toString(36).substring(2, 9)}`;

    const newBooking: Booking = {
      id: bookingId,
      invoiceNumber: invoiceNum,
      customerId: 'cust-temp',
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

    db.saveBooking(newBooking)
      .then(() => {
        setIsSubmitting(false);
        router.push(`/checkout?bookingId=${bookingId}`);
      })
      .catch((err) => {
        console.error('Failed to create booking:', err);
        setIsSubmitting(false);
        alert('Gagal membuat pesanan. Silakan coba lagi.');
      });
  };

  const stepsList = [
    { number: 1, label: 'Data Diri', desc: 'Identitas Anda' },
    { number: 2, label: 'Jadwal & Lokasi', desc: 'Waktu & Tempat' },
    { number: 3, label: 'Pilih Layanan', desc: 'Inklusi Wedding' },
    { number: 4, label: 'Konfirmasi', desc: 'Metode Pembayaran' }
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col gap-2">
        <Breadcrumb customLastLabel={`Step ${currentStep}: ${stepsList[currentStep-1].label}`} />
        <div className="text-center max-w-xl mx-auto space-y-2 mb-4">
          <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-foreground">Formulir Booking Layanan</h1>
          <p className="text-xs text-muted-foreground">
            Lengkapi rencana pernikahan Anda dalam 4 langkah mudah untuk mengamankan ketersediaan jadwal.
          </p>
        </div>
      </div>

      {/* STEPPER PROGRESS BAR */}
      <div className="max-w-3xl mx-auto px-4 py-3 bg-card border rounded-2xl shadow-xs">
        <div className="relative flex items-center justify-between">
          {/* Track line */}
          <div className="absolute top-[16px] left-[5%] right-[5%] h-0.5 bg-muted z-0">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            />
          </div>

          {stepsList.map((step) => {
            const isCompleted = step.number < currentStep;
            const isActive = step.number === currentStep;
            return (
              <button
                key={step.number}
                type="button"
                onClick={() => {
                  // Allow jumping to steps only if they are completed or validated
                  if (step.number < currentStep) setCurrentStep(step.number);
                  else if (step.number === 2 && validateStep1()) setCurrentStep(2);
                  else if (step.number === 3 && validateStep1() && validateStep2()) setCurrentStep(3);
                  else if (step.number === 4 && validateStep1() && validateStep2() && validateStep3()) setCurrentStep(4);
                }}
                className="relative z-10 flex flex-col items-center group cursor-pointer focus:outline-none"
              >
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                  isCompleted 
                    ? 'bg-primary border-primary text-primary-foreground' 
                    : isActive 
                    ? 'bg-background border-primary text-primary font-bold shadow-sm'
                    : 'bg-background border-muted text-muted-foreground'
                }`}>
                  {isCompleted ? <CheckCircle2 className="size-4.5" /> : step.number}
                </div>
                <span className={`text-[10px] font-bold mt-1.5 hidden sm:block ${isActive ? 'text-foreground font-extrabold' : 'text-muted-foreground'}`}>
                  {step.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {errors.services && currentStep === 3 && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl text-xs flex items-center gap-2 max-w-3xl mx-auto animate-fade-in">
          <AlertTriangle className="size-4.5 shrink-0" />
          <span>{errors.services}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto">
        
        {/* LEFT COLUMN: Stepper Forms */}
        <div className="lg:col-span-8">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="border-b pb-4">
              <CardTitle className="font-serif text-xl flex items-center gap-2">
                {currentStep === 1 && <User className="size-5 text-primary" />}
                {currentStep === 2 && <Calendar className="size-5 text-primary" />}
                {currentStep === 3 && <ShoppingBag className="size-5 text-primary" />}
                {currentStep === 4 && <FileText className="size-5 text-primary" />}
                {stepsList[currentStep-1].number}. {stepsList[currentStep-1].label}
              </CardTitle>
              <CardDescription>{stepsList[currentStep-1].desc}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              
              {/* STEP 1: CUSTOMER DATA */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground block">Nama Lengkap</label>
                      <input
                        type="text"
                        placeholder="Contoh: Sarah Amelia"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`w-full bg-muted/20 border rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                          errors.name ? 'border-destructive' : 'border-border'
                        }`}
                      />
                      {errors.name && <span className="text-[10px] text-destructive block">{errors.name}</span>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground block">Nomor WhatsApp Aktif</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs text-muted-foreground/60 font-bold">+62</span>
                        <input
                          type="tel"
                          placeholder="81234567890"
                          value={whatsapp}
                          onChange={(e) => setWhatsapp(e.target.value)}
                          className={`w-full bg-muted/20 border rounded-xl py-2 px-3 pl-12 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                            errors.whatsapp ? 'border-destructive' : 'border-border'
                          }`}
                        />
                      </div>
                      {errors.whatsapp && <span className="text-[10px] text-destructive block">{errors.whatsapp}</span>}
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-semibold text-foreground block">Alamat Email</label>
                      <input
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full bg-muted/20 border rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                          errors.email ? 'border-destructive' : 'border-border'
                        }`}
                      />
                      {errors.email && <span className="text-[10px] text-destructive block">{errors.email}</span>}
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-semibold text-foreground block">Alamat Lengkap (Untuk Fitting/Pengiriman)</label>
                      <textarea
                        rows={3}
                        placeholder="Masukkan alamat rumah lengkap (jalan, nomor, RT/RW, kecamatan, kota)..."
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className={`w-full bg-muted/20 border rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none ${
                          errors.address ? 'border-destructive' : 'border-border'
                        }`}
                      />
                      {errors.address && <span className="text-[10px] text-destructive block">{errors.address}</span>}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: EVENT DETAILS */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground block">Tanggal Acara Pernikahan</label>
                      <input
                        type="date"
                        min={tomorrowDateString}
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className={`w-full bg-muted/20 border rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                          errors.eventDate ? 'border-destructive' : 'border-border'
                        }`}
                      />
                      {errors.eventDate && <span className="text-[10px] text-destructive block">{errors.eventDate}</span>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground block">Jenis Acara</label>
                      <select
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value as Booking['eventType'])}
                        className="w-full bg-muted/20 border border-border rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      >
                        <option value="akad">Akad Nikah / Pemberkatan</option>
                        <option value="resepsi">Resepsi Pernikahan</option>
                        <option value="prewedding">Foto Prewedding</option>
                        <option value="lamaran">Prosesi Lamaran</option>
                      </select>
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-semibold text-foreground block">Nama & Lokasi Gedung/Tempat Acara</label>
                      <input
                        type="text"
                        placeholder="Contoh: Gedung Sasana Kriya, Ballroom Hotel Santika, atau Alamat Rumah"
                        value={eventLocation}
                        onChange={(e) => setEventLocation(e.target.value)}
                        className={`w-full bg-muted/20 border rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                          errors.eventLocation ? 'border-destructive' : 'border-border'
                        }`}
                      />
                      {errors.eventLocation && <span className="text-[10px] text-destructive block">{errors.eventLocation}</span>}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: SERVICE CUSTOM SELECTION */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  {/* Option A: Packages All-in-One */}
                  <div className="bg-secondary/10 border border-border/40 rounded-2xl p-4 space-y-4">
                    <label className="flex items-center space-x-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectPackageActive}
                        onChange={(e) => setSelectPackageActive(e.target.checked)}
                        className="h-4.5 w-4.5 rounded border-border text-primary focus:ring-primary accent-primary"
                      />
                      <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                        Pilih Paket Wedding Lengkap (All-in-One)
                      </span>
                    </label>

                    {selectPackageActive && (
                      <div className="bg-background border border-border/40 p-4 rounded-xl space-y-2.5 text-xs animate-fade-in">
                        <label className="font-semibold text-muted-foreground block">Pilih Paket Pernikahan:</label>
                        <select
                          value={selectedPackageId}
                          onChange={(e) => setSelectedPackageId(e.target.value)}
                          className="w-full bg-muted/20 border border-border rounded-xl py-2 px-3 text-xs focus:outline-none"
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
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/60" /></div>
                    <span className="relative px-3 bg-card text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Atau Kustomisasi Ala Carte</span>
                  </div>

                  {/* Option B: Ala Carte List */}
                  <div className="space-y-4">
                    {/* B1: Sewa Baju */}
                    <div className="border border-border/40 rounded-2xl p-4 space-y-3 bg-muted/5">
                      <label className="flex items-center space-x-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectDressActive}
                          onChange={(e) => setSelectDressActive(e.target.checked)}
                          className="h-4.5 w-4.5 rounded border-border text-primary focus:ring-primary accent-primary"
                        />
                        <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                          Sewa Baju & Busana Atelier
                        </span>
                      </label>

                      {selectDressActive && (
                        <div className="bg-background border border-border/40 p-4 rounded-xl space-y-3 text-xs grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in">
                          <div className="sm:col-span-3">
                            <label className="font-semibold text-muted-foreground block mb-1">Pilih Baju/Busana:</label>
                            <select
                              value={selectedDressId}
                              onChange={(e) => setSelectedDressId(e.target.value)}
                              className="w-full bg-muted/20 border border-border rounded-xl py-2 px-3 text-xs focus:outline-none"
                            >
                              {dresses.map((d) => (
                                <option key={d.id} value={d.id}>
                                  {d.name} ({d.category}) - {formatPrice(d.price)}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="font-semibold text-muted-foreground block mb-1">Ukuran:</label>
                            <select
                              value={selectedSize}
                              onChange={(e) => setSelectedSize(e.target.value)}
                              className="w-full bg-muted/20 border border-border rounded-xl py-2 px-3 text-xs focus:outline-none"
                            >
                              {dresses.find((d) => d.id === selectedDressId)?.sizes.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </div>
                          <div className="sm:col-span-2">
                            <label className="font-semibold text-muted-foreground block mb-1">Pilihan Warna:</label>
                            <select
                              value={selectedColor}
                              onChange={(e) => setSelectedColor(e.target.value)}
                              className="w-full bg-muted/20 border border-border rounded-xl py-2 px-3 text-xs focus:outline-none"
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
                    <div className="border border-border/40 rounded-2xl p-4 space-y-3 bg-muted/5">
                      <label className="flex items-center space-x-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectMakeupActive}
                          onChange={(e) => setSelectMakeupActive(e.target.checked)}
                          className="h-4.5 w-4.5 rounded border-border text-primary focus:ring-primary accent-primary"
                        />
                        <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                          Tata Rias Makeup Artist (MUA)
                        </span>
                      </label>

                      {selectMakeupActive && (
                        <div className="bg-background border border-border/40 p-4 rounded-xl space-y-2.5 text-xs animate-fade-in">
                          <label className="font-semibold text-muted-foreground block mb-1">Pilih Paket Makeup:</label>
                          <select
                            value={selectedMakeupId}
                            onChange={(e) => setSelectedMakeupId(e.target.value)}
                            className="w-full bg-muted/20 border border-border rounded-xl py-2 px-3 text-xs focus:outline-none"
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
                    <div className="border border-border/40 rounded-2xl p-4 space-y-3 bg-muted/5">
                      <label className="flex items-center space-x-3 cursor-pointer group font-semibold text-foreground">
                        <input
                          type="checkbox"
                          checked={isDecorSelectionActive}
                          disabled={packageDecorations.length === 0}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            if (checked && !selectedDecor) {
                              setSelectedDecorId(packageDecorations[0]?.id || '');
                            }
                            setSelectDecorActive(checked);
                          }}
                          className="h-4.5 w-4.5 rounded border-border text-primary focus:ring-primary accent-primary disabled:opacity-50"
                        />
                        <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                          Dekorasi Panggung Pelaminan
                        </span>
                      </label>

                      {packageDecorations.length === 0 && (
                        <p className="pl-7 text-[10px] text-muted-foreground">Belum ada tema dekorasi yang tersedia saat ini.</p>
                      )}

                      {isDecorSelectionActive && (
                        <div className="bg-background border border-border/40 p-4 rounded-xl space-y-2.5 text-xs animate-fade-in">
                          <label className="font-semibold text-muted-foreground block mb-1">Pilih Tema/Paket Dekorasi:</label>
                          <select
                            value={selectedDecorId}
                            onChange={(e) => setSelectedDecorId(e.target.value)}
                            className="w-full bg-muted/20 border border-border rounded-xl py-2 px-3 text-xs focus:outline-none"
                          >
                            {packageDecorations.map((d) => (
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
              )}

              {/* STEP 4: REVIEW & PAYMENT SELECTION */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  {/* Confirmation lookup review */}
                  <div className="bg-secondary/15 border border-border/40 rounded-2xl p-5 space-y-4">
                    <h4 className="font-serif font-bold text-base text-foreground flex items-center gap-1.5">
                      <Sparkles className="size-4.5 text-primary" /> Review Data Rencana Acara
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-muted-foreground border-b border-border/40 pb-4">
                      <div>
                        <span>Nama Pengantin:</span>
                        <p className="font-bold text-foreground mt-0.5">{name}</p>
                      </div>
                      <div>
                        <span>Nomor WhatsApp:</span>
                        <p className="font-bold text-foreground mt-0.5">+{whatsapp}</p>
                      </div>
                      <div>
                        <span>Tanggal Pernikahan:</span>
                        <p className="font-bold text-foreground mt-0.5">{eventDate}</p>
                      </div>
                      <div>
                        <span>Jenis & Tempat Acara:</span>
                        <p className="font-bold text-foreground mt-0.5 uppercase">{eventType} - {eventLocation}</p>
                      </div>
                      <div className="sm:col-span-2">
                        <span>Alamat Pengiriman/Fitting:</span>
                        <p className="font-bold text-foreground mt-0.5 leading-relaxed">{address}</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <span className="font-semibold text-muted-foreground">Layanan Dipesan:</span>
                      <ul className="list-disc pl-4 space-y-1 font-bold text-foreground">
                        {calculations.packageSelected && <li>Paket Lengkap: {calculations.packageSelected.name}</li>}
                        {calculations.dressesSelected.map((d) => (
                          <li key={d.id}>Busana: {d.name} (Ukuran: {d.size}, Warna: {d.color})</li>
                        ))}
                        {calculations.makeupSelected && <li>Tata Rias: {calculations.makeupSelected.name}</li>}
                        {calculations.decorSelected && <li>Dekorasi: {calculations.decorSelected.name}</li>}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground block">Catatan Tambahan (Kustomisasi/Permintaan Khusus)</label>
                      <textarea
                        rows={2}
                        placeholder="Contoh: Siger adat sunda, hijab styling tambahan, ukuran lingkar dada jas 104cm, dll..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full bg-muted/20 border border-border rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                      />
                    </div>

                    {/* Payment Type */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-foreground block">Tipe Pembayaran:</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setPaymentType('dp')}
                          className={`py-3 px-4 rounded-xl border text-center transition-all flex flex-col items-center cursor-pointer ${
                            paymentType === 'dp'
                              ? 'bg-primary/5 border-primary text-primary shadow-xs ring-1 ring-primary/20'
                              : 'bg-background border-border text-foreground hover:border-primary/40'
                          }`}
                        >
                          <span className="text-xs font-bold">Bayar DP Dulu ({selectPackageActive ? 'Tercantum' : `${settings.minDpPercent}%`})</span>
                          <span className="text-[10px] text-muted-foreground mt-1">
                            Minimal {formatPrice(calculations.minDp)} untuk kunci jadwal
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentType('full')}
                          className={`py-3 px-4 rounded-xl border text-center transition-all flex flex-col items-center cursor-pointer ${
                            paymentType === 'full'
                              ? 'bg-primary/5 border-primary text-primary shadow-xs ring-1 ring-primary/20'
                              : 'bg-background border-border text-foreground hover:border-primary/40'
                          }`}
                        >
                          <span className="text-xs font-bold">Bayar Lunas</span>
                          <span className="text-[10px] text-muted-foreground mt-1">
                            Lunas {formatPrice(calculations.total)} sekarang juga
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-foreground block">Metode Pembayaran:</label>
                      {!settings.tfEnabled && !settings.qrisEnabled ? (
                        <div className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex gap-2">
                          <Info className="size-4.5 text-amber-600 shrink-0" />
                          <span>Metode pembayaran transfer belum dikonfigurasi admin. Harap hubungi via WA admin butik.</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {settings.tfEnabled && (
                            <button
                              type="button"
                              onClick={() => setPaymentMethod('tf')}
                              className={`py-3 px-4 rounded-xl border text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                                paymentMethod === 'tf'
                                  ? 'bg-primary/5 border-primary text-primary shadow-xs ring-1 ring-primary/20'
                                  : 'bg-background border-border text-foreground hover:border-primary/40'
                              }`}
                            >
                              <span className="text-xs font-bold">Transfer Bank</span>
                              <span className="text-[10px] text-muted-foreground mt-0.5">{settings.tfBankName}</span>
                            </button>
                          )}
                          {settings.qrisEnabled && (
                            <button
                              type="button"
                              onClick={() => setPaymentMethod('qris')}
                              className={`py-3 px-4 rounded-xl border text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                                paymentMethod === 'qris'
                                  ? 'bg-primary/5 border-primary text-primary shadow-xs ring-1 ring-primary/20'
                                  : 'bg-background border-border text-foreground hover:border-primary/40'
                              }`}
                            >
                              <span className="text-xs font-bold">QRIS Code</span>
                              <span className="text-[10px] text-muted-foreground mt-0.5">E-Wallet & M-Banking</span>
                            </button>
                          )}
                        </div>
                      )}
                      {errors.paymentMethod && (
                        <span className="text-[10px] text-destructive block mt-1">{errors.paymentMethod}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

            </CardContent>
            <CardFooter className="border-t bg-secondary/10 flex justify-between p-4">
              <Button
                type="button"
                variant="ghost"
                onClick={handlePrevStep}
                disabled={currentStep === 1}
                className="text-xs"
              >
                <ChevronLeft className="size-4 mr-1" /> Kembali
              </Button>

              {currentStep < 4 ? (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="text-xs"
                >
                  Lanjutkan <ChevronRight className="size-4 ml-1" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs uppercase tracking-wider font-bold h-9"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="size-4 mr-1.5" />
                      Konfirmasi & Booking
                    </>
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        {/* RIGHT COLUMN: Bill Summary Sidebar */}
        <div className="lg:col-span-4">
          <Card className="border-border/60 shadow-lg lg:sticky lg:top-24">
            <CardHeader className="border-b pb-4">
              <CardTitle className="font-serif text-base">Ringkasan Pemesanan</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {/* List selected items */}
              <div className="space-y-3.5 divide-y divide-border/40 max-h-60 overflow-y-auto pr-1">
                {!selectDressActive && !selectMakeupActive && !isDecorSelectionActive && !selectPackageActive && (
                  <p className="text-muted-foreground/60 italic py-4 text-center text-xs">Belum ada layanan yang dipilih.</p>
                )}

                {/* Package */}
                {selectPackageActive && (
                  <div className="pt-3 first:pt-0">
                    <div className="flex justify-between font-bold text-foreground text-xs">
                      <span>{packages.find((p) => p.id === selectedPackageId)?.name}</span>
                      <span>{formatPrice(packages.find((p) => p.id === selectedPackageId)?.price || 0)}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground block mt-0.5">Paket All-in-One</span>
                  </div>
                )}

                {/* Dress */}
                {selectDressActive && (
                  <div className="pt-3 first:pt-0">
                    <div className="flex justify-between font-bold text-foreground text-xs">
                      <span>Gaun: {dresses.find((d) => d.id === selectedDressId)?.name}</span>
                      <span>{formatPrice(dresses.find((d) => d.id === selectedDressId)?.price || 0)}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 space-x-2">
                      <span>Ukuran: {selectedSize}</span>
                      <span>•</span>
                      <span>Warna: {selectedColor}</span>
                    </div>
                  </div>
                )}

                {/* Makeup */}
                {selectMakeupActive && (
                  <div className="pt-3 first:pt-0">
                    <div className="flex justify-between font-bold text-foreground text-xs">
                      <span>{makeup.find((m) => m.id === selectedMakeupId)?.name}</span>
                      <span>{formatPrice(makeup.find((m) => m.id === selectedMakeupId)?.price || 0)}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground block mt-0.5">Rias Pengantin MUA</span>
                  </div>
                )}

                {/* Decor */}
                {isDecorSelectionActive && (
                  <div className="pt-3 first:pt-0">
                    <div className="flex justify-between font-bold text-foreground text-xs">
                      <span>{packageDecorations.find((d) => d.id === selectedDecorId)?.name}</span>
                      <span>{formatPrice(packageDecorations.find((d) => d.id === selectedDecorId)?.price || 0)}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground block mt-0.5">Dekorasi Pelaminan</span>
                  </div>
                )}
              </div>

              <Separator />

              {/* Subtotal & Fees */}
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Subtotal Layanan:</span>
                  <span className="font-medium text-foreground">{formatPrice(calculations.subtotal)}</span>
                </div>
                {calculations.subtotal > 0 && (
                  <div className="flex justify-between">
                    <span>Biaya Pengantaran/Transport:</span>
                    <span className="font-medium text-foreground">{formatPrice(calculations.transportFee)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-foreground border-t border-dashed border-border/40 pt-2">
                  <span>Total Biaya:</span>
                  <span className="text-primary">{formatPrice(calculations.total)}</span>
                </div>
              </div>

              {/* DP Alert info Box */}
              <div className="bg-muted/40 border border-border/40 p-3.5 rounded-2xl space-y-2 text-[11px] text-muted-foreground leading-normal">
                <div className="flex justify-between font-semibold">
                  <span>Tipe Bayar:</span>
                  <span className="text-foreground uppercase">{paymentType === 'dp' ? 'Uang Muka (DP)' : 'Lunas'}</span>
                </div>
                <div className="flex justify-between font-extrabold text-foreground text-xs border-t border-dashed border-border/40 pt-1.5 mt-1">
                  <span>Jumlah Tagihan:</span>
                  <span className="text-emerald-700">
                    {formatPrice(paymentType === 'dp' ? calculations.minDp : calculations.total)}
                  </span>
                </div>
                {paymentType === 'dp' && (
                  <p className="text-[9px] text-muted-foreground/80 leading-normal italic pt-1 border-t border-border/20 mt-1">
                    *Sisa pelunasan dibayar selambat-lambatnya H-7 sebelum hari pelaksanaan acara.
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="justify-center border-t py-4 text-[10px] text-muted-foreground flex gap-1.5 items-center">
              <ShieldCheck className="size-4 text-primary shrink-0" />
              <span>Transaksi terenkripsi aman & bergaransi</span>
            </CardFooter>
          </Card>
        </div>

      </div>
    </div>
  );
}

export default function BookingForm() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-xs text-muted-foreground">
        Loading parameter booking...
      </div>
    }>
      <BookingFormContent />
    </Suspense>
  );
}
