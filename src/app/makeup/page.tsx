'use client';

import { useState } from 'react';
import { Sparkles, Heart, ShieldAlert, Award } from 'lucide-react';
import { useMakeup, useGallery, useSettings } from '@/data/db';
import MakeupPackageCard from '@/components/MakeupPackageCard';
import ImagePlaceholder from '@/components/ui/ImagePlaceholder';
import Breadcrumb from '@/components/Breadcrumb';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function MakeupPage() {
  const [makeup] = useMakeup();
  const [gallery] = useGallery();
  const [settings] = useSettings();

  const makeupPortfolios = gallery.filter((item) => item.category === 'makeup');

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Breadcrumb & Header */}
      <div className="space-y-2">
        <Breadcrumb />
        <div className="text-center max-w-xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-foreground">Jasa Rias Pengantin (MUA)</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Riasan wajah istimewa dengan konsep flawless, glowing, dan semi-bold yang disesuaikan untuk menonjolkan kecantikan alami Anda.
          </p>
        </div>
      </div>

      <Separator />

      {/* Makeup Packages Grid */}
      <div className="space-y-6">
        <h2 className="text-xl font-serif font-bold text-foreground">Pilihan Paket Rias Wajah</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {makeup.map((pkg) => (
            <MakeupPackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      </div>

      {/* Quality Standards */}
      <div className="bg-secondary/15 py-8 px-6 md:px-10 rounded-3xl border border-border/80 grid grid-cols-1 md:grid-cols-3 gap-8">
        {qualityPoints.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="space-y-2.5">
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center border border-primary/5">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-serif font-bold text-base text-foreground">{item.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-light">{item.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Portfolios */}
      <div className="space-y-6">
        <div className="text-center max-w-lg mx-auto space-y-1">
          <h2 className="text-2xl font-serif font-bold text-foreground">Portofolio Riasan</h2>
          <p className="text-xs text-muted-foreground">Dokumentasi asli pengerjaan makeup pengantin kami.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {makeupPortfolios.map((item) => (
            <div key={item.id} className="relative aspect-square overflow-hidden rounded-2xl group shadow-sm border border-border bg-muted">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImagePlaceholder label="Foto kosong" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5" />
              <div className="absolute bottom-4 left-4 right-4 text-white z-10">
                <h4 className="font-serif font-bold text-base">{item.title}</h4>
                {item.description && <p className="text-[10px] text-stone-300 mt-0.5">{item.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA section */}
      <Card className="border-border/80 bg-primary text-primary-foreground max-w-3xl mx-auto rounded-3xl overflow-hidden shadow-lg">
        <CardContent className="p-8 md:p-12 text-center space-y-6 flex flex-col items-center">
          <Heart className="h-8 w-8 text-primary-foreground/90 fill-primary-foreground/20" />
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary-foreground">Konsultasikan Konsep & Jadwal MUA Anda</h2>
          <p className="text-primary-foreground/75 text-xs leading-relaxed font-light max-w-lg">
            Kami siap memadukan warna lipstik, eyeshadow, dan gaya hairdo/hijab do yang paling menawan untuk gaun pilihan Anda.
          </p>
          <div>
            <Button asChild size="lg" className="bg-background text-foreground hover:bg-background/90 font-bold uppercase tracking-wider text-xs h-10 px-8 rounded-full">
              <a
                href={`https://wa.me/${settings.whatsappAdmin}?text=Halo%20Ermi%20Pengantin%2C%20saya%20ingin%20konsultasi%20jadwal%20booking%20MUA.`}
                target="_blank"
                rel="noreferrer"
              >
                Hubungi MUA Sekarang
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
