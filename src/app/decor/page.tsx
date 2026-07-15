'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Layers, CheckCircle, MessageSquare, Search } from 'lucide-react';
import { useDecor, useGallery, useSettings } from '@/data/db';
import DecorPackageCard from '@/components/DecorPackageCard';
import ImagePlaceholder from '@/components/ui/ImagePlaceholder';
import EmptyState from '@/components/ui/EmptyState';
import { DecorPackage } from '@/types';
import Breadcrumb from '@/components/Breadcrumb';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function DecorPage() {
  const [decorations] = useDecor();
  const [gallery] = useGallery();
  const [settings] = useSettings();

  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'all' | DecorPackage['decorType']>('all');
  const [selectedThemeFilter, setSelectedThemeFilter] = useState('all');
  const decorPortfolios = gallery.filter((item) => item.category === 'decor');

  // Filtered packages
  const filteredPackages = decorations.filter((decor) => (
    (selectedTypeFilter === 'all' || decor.decorType === selectedTypeFilter)
    && (selectedThemeFilter === 'all' || decor.theme === selectedThemeFilter)
  ));

  const categories = [
    { label: 'Semua Tema', value: 'all' },
    ...Array.from(new Set(decorations.map((item) => item.theme).filter(Boolean))).map((theme) => ({
      label: theme,
      value: theme,
    })),
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Breadcrumb & Header */}
      <div className="space-y-2">
        <Breadcrumb />
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs uppercase tracking-widest text-primary font-bold">Wedding Decoration Atelier</span>
          <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-foreground mt-1">Dekorasi Pernikahan</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Temukan paket dekorasi lengkap dan item hiasan satuan yang seluruhnya dikelola langsung dari katalog kami.
          </p>
        </div>
      </div>

      <Separator />

      {/* Type and theme filters */}
      <div className="space-y-3.5">
        <div className="flex flex-wrap gap-2 justify-center">
          {[
            { label: 'Semua', value: 'all' as const },
            { label: 'Paket Dekorasi', value: 'package' as const },
            { label: 'Item Dekorasi', value: 'item' as const },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setSelectedTypeFilter(filter.value)}
              className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wider transition-all duration-200 cursor-pointer ${
                selectedTypeFilter === filter.value
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-background hover:bg-muted text-muted-foreground border border-border'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedThemeFilter(cat.value)}
              className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wider transition-all duration-200 cursor-pointer ${
                selectedThemeFilter === cat.value
                  ? 'bg-primary/20 text-primary border border-primary/20 shadow-xs'
                  : 'bg-background hover:bg-muted text-muted-foreground border border-border'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Decor Packages Grid */}
      {decorations.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="Katalog dekorasi belum tersedia"
          description="Paket dan item dekorasi akan tampil di sini setelah ditambahkan oleh admin."
        />
      ) : filteredPackages.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Dekorasi tidak ditemukan"
          description="Belum ada dekorasi untuk kombinasi tipe dan tema yang dipilih."
          actionText="Reset Filter"
          onAction={() => {
            setSelectedTypeFilter('all');
            setSelectedThemeFilter('all');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {filteredPackages.map((decor) => (
            <DecorPackageCard key={decor.id} pkg={decor} />
          ))}
        </div>
      )}

      {/* Quality standards */}
      <div className="bg-secondary/15 py-8 px-6 md:px-10 rounded-3xl border border-border/80 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-3">
          <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary text-[10px] uppercase font-bold tracking-wider">
            Standar Dekorasi
          </Badge>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground leading-tight">Keindahan Detail Estetika Rapi & Aman</h2>
          <p className="text-xs text-muted-foreground leading-relaxed font-light">
            Kami mengutamakan kesegaran kelopak bunga mawar, pemasangan lampu sorot panggung yang presisi, dan kekuatan konstruksi rigging backdrop kayu/styrofoam kokoh agar Anda dapat bersanding dengan tenang di hari bahagia.
          </p>
        </div>
        <div className="space-y-3">
          {[
            'Bunga segar grade A disortir di pagi hari',
            'Pemasangan instalasi pelaminan H-1',
            'Desain 3D layout gratis sebelum eksekusi lapangan',
            'Konstruksi backdrop dilapisi furing dan rapi tampak belakang'
          ].map((text, idx) => (
            <div key={idx} className="flex items-center space-x-2.5 text-xs text-muted-foreground">
              <CheckCircle className="h-4.5 w-4.5 text-primary flex-shrink-0" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Portfolios grid */}
      <div className="space-y-6">
        <div className="text-center max-w-lg mx-auto space-y-1">
          <h2 className="text-2xl font-serif font-bold text-foreground">Hasil Dekorasi Nyata</h2>
          <p className="text-xs text-muted-foreground">Foto hasil pengerjaan dekorasi butik untuk berbagai konsep acara klien.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {decorPortfolios.map((item) => (
            <div key={item.id} className="relative aspect-square overflow-hidden rounded-2xl group shadow-sm border border-border bg-muted">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <ImagePlaceholder label="Foto kosong" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-5" />
              <div className="absolute bottom-4 left-4 right-4 text-white z-10">
                <h4 className="font-serif font-bold text-base">{item.title}</h4>
                {item.description && <p className="text-[10px] text-stone-300 mt-0.5">{item.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating consult CTA */}
      <Card className="border-border/80 bg-primary text-primary-foreground max-w-3xl mx-auto rounded-3xl overflow-hidden shadow-lg">
        <CardContent className="p-8 md:p-12 text-center space-y-6 flex flex-col items-center">
          <Layers className="h-8 w-8 text-primary-foreground/90" />
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary-foreground">Butuh Konsep Dekorasi Kustom?</h2>
          <p className="text-primary-foreground/75 text-xs leading-relaxed font-light max-w-lg">
            Kami siap membuat rancangan dekorasi bertema kebudayaan lokal khusus maupun konsep modern minimalis eksklusif di luar paket kami.
          </p>
          <div>
            <Button asChild size="lg" className="bg-background text-foreground hover:bg-background/90 font-bold uppercase tracking-wider text-xs h-10 px-8 rounded-full">
              <a
                href={`https://wa.me/${settings.whatsappAdmin}?text=Halo%20Ermi%20Pengantin%2C%20saya%20tertarik%20untuk%20diskusi%20custom%20dekorasi%20pelaminan.`}
                target="_blank"
                rel="noreferrer"
              >
                <MessageSquare className="h-4 w-4 mr-1.5 shrink-0" />
                Konsultasi Desain 3D
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
