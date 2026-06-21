'use client';

import { use, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star, Shield, RefreshCw, HelpCircle, Check, ArrowLeft, MessageCircle } from 'lucide-react';
import { MOCK_DRESSES } from '@/data/mockData';
import DressCard from '@/components/DressCard';
import AvailabilityCalendar from '@/components/AvailabilityCalendar';
import EmptyState from '@/components/ui/EmptyState';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function DressDetail({ params }: PageProps) {
  const { slug } = use(params);
  const router = useRouter();

  // Find the dress
  const dress = useMemo(() => {
    return MOCK_DRESSES.find((d) => d.slug === slug);
  }, [slug]);

  // States
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  if (!dress) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <EmptyState
          title="Gaun Tidak Ditemukan"
          description="Maaf, gaun pengantin yang Anda cari tidak tersedia dalam koleksi kami saat ini."
          actionText="Kembali ke Katalog"
          onAction={() => router.push('/dresses')}
        />
      </div>
    );
  }

  // Similar products (same category, excluding current dress)
  const similarDresses = MOCK_DRESSES.filter(
    (d) => d.category === dress.category && d.id !== dress.id
  ).slice(0, 3);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleWhatsAppConsult = () => {
    const text = encodeURIComponent(`Halo Elika Wedding, saya tertarik konsultasi gaun "${dress.name}".`);
    window.open(`https://wa.me/6281234567890?text=${text}`, '_blank');
  };

  const handleBooking = () => {
    if (!selectedSize || !selectedColor || !selectedDate) {
      alert('Silakan pilih ukuran, warna, dan tanggal sewa sebelum melanjutkan booking.');
      return;
    }
    // Redirect to booking with query parameters
    router.push(
      `/booking?dressId=${dress.id}&size=${selectedSize}&color=${selectedColor}&date=${selectedDate}`
    );
  };

  // Dates not available (booked dates)
  // Let's assume some dates are booked (we invert the availableDates array from mock data)
  // Let's say: Jun 22, Jun 23, Jun 24, Jun 28, Jun 29 are booked.
  // We can treat any date not in dress.availableDates as booked/unavailable!
  // To make the calendar show available dates, we pass dates that are "unavailable" (booked)
  const bookedDates = useMemo(() => {
    // Generate a set of test booked dates (e.g. June 22-24, June 29)
    return ['2026-06-22', '2026-06-23', '2026-06-24', '2026-06-28', '2026-06-29'];
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      
      {/* Back Button */}
      <div>
        <Link
          href="/dresses"
          className="inline-flex items-center text-xs font-bold text-stone-600 hover:text-gold-dark gap-1"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Katalog Gaun
        </Link>
      </div>

      {/* Product Content Block */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* LEFT COLUMN: Gallery */}
        <div className="lg:col-span-5 space-y-4">
          <div className="aspect-[3/4] bg-stone-100 rounded-3xl overflow-hidden shadow-md">
            <img
              src={dress.images[selectedImageIdx] || dress.images[0]}
              alt={dress.name}
              className="w-full h-full object-cover object-center"
            />
          </div>
          
          {/* Thumbnails */}
          {dress.images.length > 1 && (
            <div className="flex gap-3">
              {dress.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`w-20 aspect-[3/4] bg-stone-100 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImageIdx === idx ? 'border-gold shadow-sm' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* MIDDLE COLUMN: Details & Description */}
        <div className="lg:col-span-4 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-gold-dark uppercase tracking-wider bg-champagne px-3 py-1 rounded-md">
              {dress.category}
            </span>
            <h1 className="text-3xl font-serif font-bold text-charcoal">{dress.name}</h1>
            
            {/* Rating */}
            <div className="flex items-center space-x-1 pt-1">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                ))}
              </div>
              <span className="text-xs font-bold text-charcoal pl-1">{dress.rating}</span>
              <span className="text-xs text-stone-muted">({dress.reviewCount} ulasan pelanggan)</span>
            </div>
          </div>

          <div className="prose prose-sm text-stone-600 leading-relaxed space-y-4">
            <h3 className="font-serif font-bold text-base text-charcoal">Deskripsi Gaun</h3>
            <p className="text-xs">{dress.description}</p>
          </div>

          <div className="border-t border-gold-light/20 pt-4 space-y-3">
            <h3 className="font-serif font-bold text-base text-charcoal">Spesifikasi Detail</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-ivory p-3 rounded-xl border border-gold-light/10">
                <span className="text-stone-400 block text-[10px] uppercase">Bahan Utama</span>
                <span className="font-bold text-charcoal">{dress.material}</span>
              </div>
              <div className="bg-ivory p-3 rounded-xl border border-gold-light/10">
                <span className="text-stone-400 block text-[10px] uppercase">Durasi Sewa</span>
                <span className="font-bold text-charcoal">{dress.rentalDurationDays} Hari (3 x 24 Jam)</span>
              </div>
            </div>
          </div>

          {/* Rental Terms & Conditions */}
          <div className="bg-ivory p-5 rounded-2xl border border-gold-light/20 space-y-3">
            <h4 className="font-serif font-bold text-sm text-charcoal flex items-center gap-1.5">
              <Shield className="h-4.5 w-4.5 text-gold-dark" /> Ketentuan Pengambilan & Fitting
            </h4>
            <ul className="space-y-1.5 text-[11px] text-stone-600">
              <li className="flex items-start gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span>Fitting gratis di butik H-7 setelah konfirmasi booking.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span>Pengembalian H+3 paling lambat pukul 18.00 WIB.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span>Deposit Jaminan dikembalikan 100% setelah pengecekan gaun.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* RIGHT COLUMN: Sticky Booking & Calendar */}
        <div className="lg:col-span-3">
          <div className="bg-white p-6 rounded-3xl border border-gold-light/25 shadow-lg space-y-6 lg:sticky lg:top-24">
            
            {/* Price Box */}
            <div className="bg-ivory-light p-4 rounded-2xl border border-gold-light/10">
              <span className="text-stone-500 text-xs block">Biaya Sewa 3 Hari</span>
              <span className="text-2xl font-extrabold text-gold-dark block">
                {formatPrice(dress.price)}
              </span>
              <div className="flex justify-between items-center text-[10px] text-stone-500 border-t border-gold-light/10 mt-2.5 pt-2">
                <span>Jaminan (Refundable):</span>
                <span className="font-bold text-charcoal">{formatPrice(dress.deposit)}</span>
              </div>
            </div>

            {/* Select Size */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-charcoal block">Pilih Ukuran:</label>
              <div className="flex gap-2">
                {dress.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`h-9 w-9 text-xs font-bold rounded-xl border flex items-center justify-center transition-all ${
                      selectedSize === size
                        ? 'bg-gold border-gold text-white shadow-sm'
                        : 'bg-white border-stone-200 text-charcoal hover:border-gold-light'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Select Color */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-charcoal block">Pilih Warna:</label>
              <div className="flex flex-wrap gap-2">
                {dress.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                      selectedColor === color
                        ? 'bg-gold border-gold text-white shadow-sm'
                        : 'bg-white border-stone-200 text-charcoal hover:border-gold-light'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Select Date & Calendar Popover */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-charcoal block">Pilih Tanggal Acara:</label>
              <AvailabilityCalendar
                bookedDates={bookedDates}
                selectedDate={selectedDate}
                onChange={setSelectedDate}
              />
              {selectedDate && (
                <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                  Tanggal dipilih: {selectedDate}
                </div>
              )}
            </div>

            {/* Book & WhatsApp Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleBooking}
                className="w-full py-3 bg-gold hover:bg-gold-dark text-white rounded-xl text-xs uppercase tracking-wider font-semibold transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-1.5"
              >
                Booking Gaun
              </button>
              <button
                onClick={handleWhatsAppConsult}
                className="w-full py-3 border border-stone-200 text-stone-700 rounded-xl text-xs font-semibold hover:bg-stone-50 transition-colors flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="h-4 w-4 text-emerald-600" />
                <span>Tanya Admin Butik</span>
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* Similar Dresses Section */}
      {similarDresses.length > 0 && (
        <div className="border-t border-gold-light/20 pt-12 space-y-8">
          <h2 className="text-2xl font-serif font-bold text-charcoal">Rekomendasi Gaun Serupa</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {similarDresses.map((item) => (
              <DressCard key={item.id} dress={item} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
