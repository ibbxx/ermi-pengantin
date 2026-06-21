'use client';

import Link from 'next/link';
import { Check, Info, Award } from 'lucide-react';
import { WeddingPackage } from '@/types';

interface PackageCardProps {
  pkg: WeddingPackage;
}

export default function PackageCard({ pkg }: PackageCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div
      className={`bg-white rounded-3xl overflow-hidden transition-all duration-300 flex flex-col relative h-full border ${
        pkg.isPopular
          ? 'ring-2 ring-gold border-transparent shadow-xl scale-105 md:scale-[1.03] z-10'
          : 'border-gold-light/20 shadow-md hover:shadow-lg'
      }`}
    >
      {/* Popular Banner */}
      {pkg.isPopular && (
        <div className="bg-gold text-white text-xs font-semibold text-center py-1.5 uppercase tracking-wider flex items-center justify-center gap-1">
          <Award className="h-4 w-4" /> Paket Terlaris
        </div>
      )}

      {/* Package Header */}
      <div className="p-6 text-center bg-gradient-to-b from-ivory to-white border-b border-gold-light/10">
        <h3 className="font-serif font-bold text-2xl text-charcoal mb-2">{pkg.name}</h3>
        <div className="text-3xl font-extrabold text-gold-dark mb-1">
          {formatPrice(pkg.price)}
        </div>
        <div className="text-[11px] text-stone-500 flex items-center justify-center gap-1">
          <Info className="h-3 w-3 text-gold-dark" /> DP Minimum: {formatPrice(pkg.depositRequired)}
        </div>
      </div>

      {/* Inclusions & Features */}
      <div className="p-6 flex-grow space-y-6">
        {/* Core items (Baju, Makeup, Dekor) */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-light">Inklusi Utama:</h4>
          <div className="bg-ivory-light p-4 rounded-xl space-y-2.5 text-xs border border-gold-light/10">
            <p className="flex justify-between">
              <span className="text-stone-500 font-medium">Baju Pengantin:</span>
              <span className="font-bold text-charcoal">{pkg.dressesIncluded} Pasang Baju</span>
            </p>
            <p className="flex flex-col">
              <span className="text-stone-500 font-medium mb-0.5">Makeup:</span>
              <span className="font-bold text-charcoal leading-relaxed">{pkg.makeupIncluded.join(', ')}</span>
            </p>
            <p className="flex flex-col">
              <span className="text-stone-500 font-medium mb-0.5">Dekorasi:</span>
              <span className="font-bold text-charcoal leading-relaxed">{pkg.decorIncluded}</span>
            </p>
          </div>
        </div>

        {/* Feature List */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-light">Fasilitas Tambahan:</h4>
          <ul className="space-y-2">
            {pkg.features.map((feature, i) => (
              <li key={i} className="flex items-start text-xs text-stone-600 gap-2">
                <Check className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer / CTA */}
      <div className="p-6 bg-gradient-to-t from-ivory to-white border-t border-gold-light/10 mt-auto">
        <Link
          href={`/booking?packageId=${pkg.id}`}
          className={`w-full block text-center py-3 text-xs uppercase tracking-wider font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg ${
            pkg.isPopular
              ? 'bg-gold hover:bg-gold-dark text-white'
              : 'bg-charcoal hover:bg-charcoal-light text-white'
          }`}
        >
          Pilih Paket
        </Link>
      </div>
    </div>
  );
}
