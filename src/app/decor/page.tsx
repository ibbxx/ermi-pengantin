'use client';

import { useState } from 'react';
import { Layers, CheckCircle, MessageSquare } from 'lucide-react';
import { MOCK_DECOR, MOCK_GALLERY } from '@/data/mockData';
import DecorPackageCard from '@/components/DecorPackageCard';

export default function DecorPage() {
  const [selectedThemeFilter, setSelectedThemeFilter] = useState<'all' | 'Rustic' | 'White Classic' | 'Tradisional'>('all');
  const decorPortfolios = MOCK_GALLERY.filter((item) => item.category === 'decor');

  // Filtered packages
  const filteredPackages = MOCK_DECOR.filter((pkg) => {
    return selectedThemeFilter === 'all' || pkg.theme === selectedThemeFilter;
  });

  const categories = [
    { label: 'Semua Tema', value: 'all' },
    { label: 'Rustic Romance', value: 'Rustic' },
    { label: 'White Classic', value: 'White Classic' },
    { label: 'Tradisional Jawa', value: 'Tradisional' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs uppercase tracking-widest text-gold-dark font-bold font-semibold">Wedding Decoration Atelier</span>
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-charcoal">Dekorasi Pernikahan</h1>
        <p className="text-xs text-stone-muted">
          Panggung pelaminan megah, lorong lampu romantis, gerbang bunga segar, dan photobooth cantik yang disesuaikan khusus untuk keindahan venue Anda.
        </p>
      </div>

      {/* Theme Filters Tab */}
      <div className="flex justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedThemeFilter(cat.value as any)}
            className={`text-xs px-4 py-2 rounded-full font-semibold border transition-all ${
              selectedThemeFilter === cat.value
                ? 'bg-gold border-gold text-white shadow-md'
                : 'bg-white border-stone-200 text-stone-600 hover:border-gold-light'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Decor Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {filteredPackages.map((pkg) => (
          <DecorPackageCard key={pkg.id} pkg={pkg} />
        ))}
      </div>

      {/* Venue Fit Guide */}
      <div className="bg-ivory rounded-3xl p-8 md:p-12 border border-gold-light/20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-4">
          <span className="text-xs uppercase tracking-widest text-gold-dark font-bold">Panduan Venue</span>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-charcoal">Penyesuaian Skala Ruangan (Venue Fitting)</h2>
          <p className="text-xs text-stone-600 leading-relaxed">
            Setiap panggung pelaminan kami dapat disesuaikan lebarnya mulai dari 4 meter (untuk area rumah/outdoor kecil) hingga 16 meter (untuk gedung ballroom hotel besar). Tim kami akan melakukan survey lokasi H-14 sebelum acara untuk melakukan pengukuran presisi.
          </p>
          <ul className="space-y-2.5 text-xs text-stone-700">
            <li className="flex items-center gap-2 font-medium">
              <CheckCircle className="h-4.5 w-4.5 text-gold-dark flex-shrink-0" />
              <span>Survey Lokasi & Gambar Layout 3D Gratis</span>
            </li>
            <li className="flex items-center gap-2 font-medium">
              <CheckCircle className="h-4.5 w-4.5 text-gold-dark flex-shrink-0" />
              <span>Bebas Konsultasi Kombinasi Warna Bunga & Lighting</span>
            </li>
            <li className="flex items-center gap-2 font-medium">
              <CheckCircle className="h-4.5 w-4.5 text-gold-dark flex-shrink-0" />
              <span>Peralatan Lengkap (Karpet Jalan, Meja VIP, Lampu Sorot)</span>
            </li>
          </ul>
        </div>
        <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-stone-100 shadow-md">
          <img
            src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80"
            alt="Survey Dekorasi"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Portfolios Gallery Grid */}
      <div className="space-y-8">
        <div className="text-center max-w-lg mx-auto space-y-2">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-charcoal">Galeri Hasil Dekorasi</h2>
          <p className="text-xs text-stone-muted">Inspirasi layout pelaminan asli dari pengerjaan dekorasi kami.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {decorPortfolios.map((item) => (
            <div key={item.id} className="relative aspect-square overflow-hidden rounded-2xl group shadow-sm">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/20 to-transparent flex flex-col justify-end p-5" />
              <div className="absolute bottom-4 left-4 right-4 text-white z-10">
                <h4 className="font-serif font-bold text-base">{item.title}</h4>
                {item.description && <p className="text-[10px] text-stone-300 mt-0.5">{item.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating consult CTA */}
      <div className="bg-charcoal text-white rounded-3xl p-8 md:p-12 text-center max-w-3xl mx-auto shadow-xl relative overflow-hidden glass-dark">
        <div className="max-w-xl mx-auto space-y-6 flex flex-col items-center">
          <Layers className="h-8 w-8 text-gold" />
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-white">Butuh Konsep Dekorasi Kustom?</h2>
          <p className="text-stone-300 text-xs leading-relaxed font-light">
            Kami siap membuat rancangan dekorasi bertema kebudayaan lokal khusus maupun konsep modern minimalis eksklusif di luar paket kami.
          </p>
          <div className="flex gap-4">
            <a
              href="https://wa.me/6281234567890?text=Halo%20Elika%20Wedding%2C%20saya%20tertarik%20untuk%20diskusi%20custom%20dekorasi%20pelaminan."
              target="_blank"
              rel="noreferrer"
              className="px-8 py-3 bg-gold hover:bg-gold-dark text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Konsultasi Desain 3D</span>
            </a>
          </div>
        </div>
      </div>

    </div>
  );
}
