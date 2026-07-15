'use client';

import Link from 'next/link';
import { Star, CheckCircle, AlertTriangle } from 'lucide-react';
import { Dress } from '@/types';
import ImagePlaceholder from '@/components/ui/ImagePlaceholder';

interface DressCardProps {
  dress: Dress;
}

export default function DressCard({ dress }: DressCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gold-light/20 flex flex-col group h-full">
      {/* Dress Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-stone-100">
        {dress.images[0] ? (
          <img
            src={dress.images[0]}
            alt={dress.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <ImagePlaceholder label="Foto busana kosong" />
        )}
        {/* Popular Badge */}
        {dress.isPopular && (
          <div className="absolute top-3 left-3 bg-gold text-white text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-sm">
            Populer
          </div>
        )}
        {/* Category Badge */}
        <div className="absolute bottom-3 left-3 bg-charcoal/85 backdrop-blur-sm text-ivory text-[11px] font-medium px-2.5 py-1 rounded-md">
          {dress.category}
        </div>
      </div>

      {/* Dress Info */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Rating */}
        <div className="flex items-center space-x-1 mb-2">
          <Star className="h-4 w-4 fill-gold text-gold" />
          <span className="text-xs font-semibold text-charcoal">{dress.rating}</span>
          <span className="text-xs text-stone-muted">({dress.reviewCount} ulasan)</span>
        </div>

        {/* Title */}
        <h3 className="font-serif font-bold text-lg text-charcoal mb-1 leading-tight group-hover:text-gold-dark transition-colors">
          <Link href={`/dresses/${dress.slug}`}>
            {dress.name}
          </Link>
        </h3>

        {/* Details (Colors / Sizes) */}
        <div className="text-xs text-stone-500 mb-3 space-y-1">
          <p>Ukuran: <span className="font-semibold text-charcoal">{dress.sizes.join(', ')}</span></p>
          <p>Warna: <span className="font-semibold text-charcoal">{dress.colors.join(', ')}</span></p>
        </div>

        {/* Price */}
        <div className="mt-auto pt-3 border-t border-gold-light/10">
          <div className="text-xs text-stone-500">Harga Sewa / 3 Hari</div>
          <div className="text-lg font-bold text-gold-dark mb-3">
            {formatPrice(dress.price)}
          </div>
          
          {/* Status Check */}
          <div className="flex items-center text-xs mb-4">
            {dress.status === 'available' ? (
              <span className="text-emerald-600 flex items-center gap-1 font-medium">
                <CheckCircle className="h-3.5 w-3.5" /> Tersedia untuk Disewa
              </span>
            ) : dress.status === 'rented' ? (
              <span className="text-amber-600 flex items-center gap-1 font-medium">
                <AlertTriangle className="h-3.5 w-3.5" /> Sedang Dipesan
              </span>
            ) : (
              <span className="text-red-500 flex items-center gap-1 font-medium">
                <AlertTriangle className="h-3.5 w-3.5" /> Maintenance
              </span>
            )}
          </div>

          {/* CTA Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/dresses/${dress.slug}`}
              className="py-2.5 text-center text-xs font-semibold border border-gold hover:bg-gold-light/15 text-gold-dark rounded-xl transition-all duration-300"
            >
              Lihat Detail
            </Link>
            <Link
              href={`/booking?dressId=${dress.id}`}
              className="py-2.5 text-center text-xs font-semibold bg-gold hover:bg-gold-dark text-white rounded-xl transition-all duration-300 shadow-sm"
            >
              Booking
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
