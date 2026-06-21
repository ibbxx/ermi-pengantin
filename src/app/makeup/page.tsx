'use client';

import { Sparkles, Heart, ShieldAlert, Award } from 'lucide-react';
import { MOCK_MAKEUP, MOCK_GALLERY } from '@/data/mockData';
import MakeupPackageCard from '@/components/MakeupPackageCard';

export default function MakeupPage() {
  const makeupPortfolios = MOCK_GALLERY.filter((item) => item.category === 'makeup');

  const qualityPoints = [
    {
      title: 'Kosmetik Premium Asli',
      desc: 'Kami menggunakan brand makeup internasional ternama (seperti Dior, Chanel, Estee Lauder, Huda Beauty) untuk memastikan ketahanan tinggi dan hasil foto HD.',
      icon: Sparkles
    },
    {
      title: 'MUA Berpengalaman & Ramah',
      desc: 'Seluruh tim MUA kami bersertifikasi profesional, berpengalaman menangani berbagai jenis kerumitan kulit, dan sigap membantu kecemasan Anda.',
      icon: Award
    },
    {
      title: 'Kebersihan Alat Terjamin',
      desc: 'Kuas, sponge, dan aplikator dibersihkan serta disterilisasi sebelum setiap event untuk mencegah iritasi kulit calon pengantin.',
      icon: ShieldAlert
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs uppercase tracking-widest text-gold-dark font-bold font-semibold">Bridal Makeup Artist (MUA)</span>
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-charcoal">Jasa Makeup Pengantin</h1>
        <p className="text-xs text-stone-muted">
          Riasan wajah istimewa dengan konsep flawless, glowing, dan semi-bold yang disesuaikan untuk menonjolkan kecantikan alami Anda.
        </p>
      </div>

      {/* Makeup Packages Grid */}
      <div className="space-y-8">
        <h2 className="text-2xl font-serif font-bold text-charcoal text-center md:text-left">Pilihan Paket Rias Wajah</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {MOCK_MAKEUP.map((pkg) => (
            <MakeupPackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      </div>

      {/* Quality Standards (Mengapa Memilih Kami?) */}
      <div className="bg-ivory py-12 px-6 md:px-12 rounded-3xl border border-gold-light/20 grid grid-cols-1 md:grid-cols-3 gap-8">
        {qualityPoints.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="space-y-3">
              <div className="w-10 h-10 bg-champagne text-gold-dark rounded-full flex items-center justify-center">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-serif font-bold text-lg text-charcoal">{item.title}</h3>
              <p className="text-xs text-stone-600 leading-relaxed">{item.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Before After & Portfolios */}
      <div className="space-y-8">
        <div className="text-center max-w-lg mx-auto space-y-2">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-charcoal">Portofolio Riasan Pengantin</h2>
          <p className="text-xs text-stone-muted">Dokumentasi asli pengerjaan makeup pengantin kami untuk akad nikah, resepsi, dan pesta pre-wedding.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {makeupPortfolios.map((item) => (
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

      {/* CTA section */}
      <div className="bg-charcoal text-white rounded-3xl p-8 md:p-12 text-center max-w-3xl mx-auto shadow-xl relative overflow-hidden glass-dark">
        <div className="max-w-xl mx-auto space-y-6 flex flex-col items-center">
          <Heart className="h-8 w-8 text-gold fill-gold" />
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-white">Konsultasikan Konsep & Jadwal MUA Anda</h2>
          <p className="text-stone-300 text-xs leading-relaxed font-light">
            Kami siap memadukan warna lipstik, eyeshadow, dan gaya hairdo/hijab do yang paling menawan untuk gaun pilihan Anda.
          </p>
          <div className="flex gap-4">
            <a
              href="https://wa.me/6281234567890?text=Halo%20Elika%20Wedding%2C%20saya%20ingin%20konsultasi%20jadwal%20booking%20MUA."
              target="_blank"
              rel="noreferrer"
              className="px-8 py-3 bg-gold hover:bg-gold-dark text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300"
            >
              Hubungi MUA Sekarang
            </a>
          </div>
        </div>
      </div>

    </div>
  );
}
