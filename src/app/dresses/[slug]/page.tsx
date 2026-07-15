'use client';

import { use, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star, Shield, RefreshCw, HelpCircle, Check, ArrowLeft, MessageCircle } from 'lucide-react';
import { useDresses, useSettings } from '@/data/db';
import DressCard from '@/components/DressCard';
import AvailabilityCalendar from '@/components/AvailabilityCalendar';
import EmptyState from '@/components/ui/EmptyState';
import ImagePlaceholder from '@/components/ui/ImagePlaceholder';
import Breadcrumb from '@/components/Breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function DressDetail({ params }: PageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const [dresses] = useDresses();
  const [settings] = useSettings();

  // Find the dress
  const dress = useMemo(() => {
    return dresses.find((d) => d.slug === slug);
  }, [dresses, slug]);

  // States
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  if (!dress) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <EmptyState
          title="Busana Tidak Ditemukan"
          description="Maaf, busana yang Anda cari tidak tersedia dalam koleksi kami saat ini."
          actionText="Kembali ke Katalog"
          onAction={() => router.push('/dresses')}
        />
      </div>
    );
  }

  // Similar products (same category, excluding current dress)
  const similarDresses = dresses.filter(
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
    const text = encodeURIComponent(`Halo Ermi Pengantin, saya tertarik konsultasi busana "${dress.name}".`);
    window.open(`https://wa.me/${settings.whatsappAdmin}?text=${text}`, '_blank');
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Breadcrumb customLastLabel={dress.name} />
        <Link
          href="/dresses"
          className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground gap-1 transition-colors duration-200"
        >
          <ArrowLeft className="size-3.5" /> Kembali ke Katalog
        </Link>
      </div>

      <Separator />

      {/* Product Content Block */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
        
        {/* LEFT COLUMN: Gallery */}
        <div className="lg:col-span-5 space-y-4">
          <div className="aspect-[3/4] bg-muted/25 rounded-3xl overflow-hidden shadow-sm border border-border">
            {dress.images[selectedImageIdx] || dress.images[0] ? (
              <img
                src={dress.images[selectedImageIdx] || dress.images[0]}
                alt={dress.name}
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <ImagePlaceholder label="Foto busana kosong" />
            )}
          </div>
          
          {/* Thumbnails */}
          {dress.images.length > 1 && (
            <div className="flex flex-wrap gap-2.5">
              {dress.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`w-16 aspect-[3/4] bg-muted/20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    selectedImageIdx === idx ? 'border-primary shadow-sm' : 'border-transparent hover:border-muted-foreground/30'
                  }`}
                >
                  {img ? <img src={img} alt="" className="w-full h-full object-cover" /> : <ImagePlaceholder label="" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* MIDDLE COLUMN: Details & Description */}
        <div className="lg:col-span-4 space-y-6">
          <div className="space-y-3">
            <div>
              <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary text-[10px] uppercase font-bold px-2 py-0.5">
                {dress.category}
              </Badge>
            </div>
            <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">{dress.name}</h1>
            
            {/* Rating */}
            <div className="flex items-center space-x-1">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <span className="text-xs font-bold text-foreground pl-1">{dress.rating}</span>
              <span className="text-xs text-muted-foreground">({dress.reviewCount} ulasan pelanggan)</span>
            </div>
          </div>

          <Separator />

          <div className="space-y-2 text-xs leading-relaxed text-muted-foreground">
            <h3 className="font-serif font-bold text-sm text-foreground">Deskripsi Busana</h3>
            <p>{dress.description}</p>
          </div>

          <Separator />

          <div className="space-y-3">
            <h3 className="font-serif font-bold text-sm text-foreground">Spesifikasi Detail</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-card p-3.5 rounded-2xl border border-border shadow-xs">
                <span className="text-muted-foreground block text-[9px] uppercase tracking-wider font-semibold">Bahan Utama</span>
                <span className="font-bold text-foreground mt-0.5 block">{dress.material}</span>
              </div>
              <div className="bg-card p-3.5 rounded-2xl border border-border shadow-xs">
                <span className="text-muted-foreground block text-[9px] uppercase tracking-wider font-semibold">Durasi Sewa</span>
                <span className="font-bold text-foreground mt-0.5 block">{dress.rentalDurationDays} Hari</span>
              </div>
            </div>
          </div>

          {/* Rental Terms & Conditions */}
          <div className="bg-secondary/20 p-5 rounded-2xl border border-border/60 space-y-3">
            <h4 className="font-serif font-bold text-xs text-foreground flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-primary shrink-0" /> Ketentuan Pengambilan & Fitting
            </h4>
            <ul className="space-y-1.5 text-[11px] text-muted-foreground leading-normal">
              <li className="flex items-start gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span>Fitting gratis di butik H-7 setelah konfirmasi booking.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span>Pengembalian H+3 paling lambat pukul 18.00 WIB.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span>Deposit Jaminan dikembalikan 100% setelah pengecekan busana.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* RIGHT COLUMN: Sticky Booking & Calendar */}
        <div className="lg:col-span-3">
          <Card className="border-border/60 shadow-lg p-6 space-y-6 lg:sticky lg:top-24">
            
            {/* Price Box */}
            <div className="bg-secondary/15 p-4 rounded-2xl border border-border/40">
              <span className="text-muted-foreground text-xs block">Biaya Sewa 3 Hari</span>
              <span className="text-2xl font-black text-primary block mt-0.5">
                {formatPrice(dress.price)}
              </span>
              <div className="flex justify-between items-center text-[10px] text-muted-foreground border-t border-border/40 mt-3 pt-2">
                <span>Jaminan (Refundable):</span>
                <span className="font-bold text-foreground">{formatPrice(dress.deposit)}</span>
              </div>
            </div>

            {/* Select Size */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground block">Pilih Ukuran:</label>
              <div className="flex gap-2">
                {dress.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`h-9 w-9 text-xs font-bold rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                      selectedSize === size
                        ? 'bg-primary border-primary text-primary-foreground shadow-sm'
                        : 'bg-background border-border text-foreground hover:border-primary/50'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Select Color */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground block">Pilih Warna:</label>
              <div className="flex flex-wrap gap-2">
                {dress.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                      selectedColor === color
                        ? 'bg-primary border-primary text-primary-foreground shadow-sm'
                        : 'bg-background border-border text-foreground hover:border-primary/50'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Select Date & Calendar Popover */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground block">Pilih Tanggal Acara:</label>
              <AvailabilityCalendar
                bookedDates={[]}
                selectedDate={selectedDate}
                onChange={setSelectedDate}
              />
              {selectedDate && (
                <div className="text-[11px] text-emerald-600 font-semibold mt-1 bg-emerald-50/50 border border-emerald-100 p-2 rounded-xl text-center">
                  Tanggal dipilih: {selectedDate}
                </div>
              )}
            </div>

            {/* Book & WhatsApp Buttons */}
            <div className="space-y-2.5">
              <Button
                onClick={handleBooking}
                className="w-full h-11 text-xs uppercase tracking-wider font-bold shadow-md hover:shadow-lg transition-all"
              >
                Booking Busana
              </Button>
              
              <Button
                onClick={handleWhatsAppConsult}
                variant="outline"
                className="w-full h-11 text-xs font-semibold"
              >
                <MessageCircle className="h-4 w-4 text-emerald-600 mr-1.5 shrink-0" />
                Tanya Admin Butik
              </Button>
            </div>

          </Card>
        </div>

      </div>

      {/* Similar Dresses Section */}
      {similarDresses.length > 0 && (
        <div className="border-t border-border pt-12 space-y-6">
          <h2 className="text-2xl font-serif font-bold text-foreground">Rekomendasi Serupa</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarDresses.map((item) => (
              <DressCard key={item.id} dress={item} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
