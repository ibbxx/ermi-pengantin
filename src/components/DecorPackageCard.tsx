'use client';

import Link from 'next/link';
import { Check, Map } from 'lucide-react';
import { DecorPackage } from '@/types';

interface DecorPackageCardProps {
  pkg: DecorPackage;
}

export default function DecorPackageCard({ pkg }: DecorPackageCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleWhatsAppConsult = () => {
    const text = encodeURIComponent(`Halo Elika Wedding, saya ingin berkonsultasi mengenai Paket Dekorasi "${pkg.name}" (${pkg.theme}) seharga ${formatPrice(pkg.price)}.`);
    window.open(`https://wa.me/6281234567890?text=${text}`, '_blank');
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gold-light/20 flex flex-col h-full">
      {/* Background Image / Banner */}
      <div className="relative h-56 bg-stone-100 overflow-hidden">
        <img
          src={pkg.images[0]}
          alt={pkg.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/20 to-transparent" />
        <div className="absolute top-4 right-4 bg-gold text-white text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full">
          Tema: {pkg.theme}
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-white font-serif font-bold text-xl leading-tight">
            {pkg.name}
          </h3>
          <div className="flex items-center text-stone-200 text-xs mt-1 gap-1">
            <Map className="h-3 w-3 text-gold" />
            <span>Kapasitas: {pkg.venueSize}</span>
          </div>
        </div>
      </div>

      {/* Info Body */}
      <div className="p-6 flex flex-col flex-grow">
        <p className="text-stone-muted text-sm leading-relaxed mb-4">
          {pkg.description}
        </p>

        {/* Pricing */}
        <div className="mb-4">
          <span className="text-xs text-stone-500 block">Harga Mulai Dari</span>
          <span className="text-2xl font-extrabold text-gold-dark">
            {formatPrice(pkg.price)}
          </span>
        </div>

        {/* Features Inclusions */}
        <div className="mb-6 flex-grow">
          <span className="text-xs font-semibold uppercase tracking-wider text-charcoal block mb-3">Item Dekorasi Termasuk:</span>
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
            Konsultasi Tema
          </button>
          <Link
            href={`/booking?decorId=${pkg.id}`}
            className="py-2.5 text-center text-xs font-semibold bg-gold hover:bg-gold-dark text-white rounded-xl transition-all duration-300 shadow-sm"
          >
            Booking Dekor
          </Link>
        </div>
      </div>
    </div>
  );
}
