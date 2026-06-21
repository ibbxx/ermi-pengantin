'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';
import { MakeupPackage } from '@/types';

interface MakeupPackageCardProps {
  pkg: MakeupPackage;
}

export default function MakeupPackageCard({ pkg }: MakeupPackageCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleWhatsAppConsult = () => {
    const text = encodeURIComponent(`Halo Elika Wedding, saya tertarik dengan layanan "${pkg.name}" seharga ${formatPrice(pkg.price)}. Ingin tanya-tanya jadwal.`);
    window.open(`https://wa.me/6281234567890?text=${text}`, '_blank');
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gold-light/20 flex flex-col h-full">
      {/* Visual Header / Image */}
      <div className="relative h-48 bg-stone-100 overflow-hidden">
        <img
          src={pkg.images[0]}
          alt={pkg.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-white font-serif font-bold text-xl leading-tight">
            {pkg.name}
          </h3>
        </div>
      </div>

      {/* Info Body */}
      <div className="p-6 flex flex-col flex-grow">
        <p className="text-stone-muted text-sm leading-relaxed mb-4">
          {pkg.description}
        </p>

        {/* Pricing */}
        <div className="mb-4">
          <span className="text-xs text-stone-500 block">Harga Layanan</span>
          <span className="text-2xl font-extrabold text-gold-dark">
            {formatPrice(pkg.price)}
          </span>
        </div>

        {/* Inclusions */}
        <div className="mb-6 flex-grow">
          <span className="text-xs font-semibold uppercase tracking-wider text-charcoal block mb-3">Fasilitas & Layanan:</span>
          <ul className="space-y-2">
            {pkg.features.map((feature, i) => (
              <li key={i} className="flex items-start text-xs text-stone-600 gap-2">
                <Check className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-gold-light/10">
          <button
            onClick={handleWhatsAppConsult}
            className="py-2.5 text-center text-xs font-semibold border border-gold text-gold-dark hover:bg-gold-light/10 rounded-xl transition-all duration-300"
          >
            Konsultasi WA
          </button>
          <Link
            href={`/booking?makeupId=${pkg.id}`}
            className="py-2.5 text-center text-xs font-semibold bg-gold hover:bg-gold-dark text-white rounded-xl transition-all duration-300 shadow-sm"
          >
            Booking MUA
          </Link>
        </div>
      </div>
    </div>
  );
}
