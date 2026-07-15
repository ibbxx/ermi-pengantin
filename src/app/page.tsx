'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Check, MessageCircle, Star } from 'lucide-react';
import { useDresses, useGallery, usePackages, useSettings, useTestimonials } from '@/data/db';
import DressCard from '@/components/DressCard';
import PackageCard from '@/components/PackageCard';
import ImagePlaceholder from '@/components/ui/ImagePlaceholder';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const bookingSteps = [
  ['01', 'Mulai dari kebutuhan', 'Pilih busana, makeup, dekorasi, atau paket yang paling sesuai dengan acara Anda.'],
  ['02', 'Konsultasi langsung', 'Tim kami membantu menyelaraskan ukuran, palet warna, lokasi acara, dan anggaran.'],
  ['03', 'Fitting dan konfirmasi', 'Jadwal dikunci setelah fitting atau konsultasi teknis dan pembayaran uang muka.'],
  ['04', 'Hari acara', 'Setiap detail disiapkan sesuai catatan final yang telah disepakati bersama.'],
];

const faqs = [
  {
    q: 'Berapa lama masa sewa busana?',
    a: 'Masa sewa standar adalah tiga hari: pengambilan atau fitting akhir, hari acara, dan pengembalian. Perpanjangan dapat dibicarakan sebelum tanggal acara.',
  },
  {
    q: 'Apakah bisa memesan layanan secara terpisah?',
    a: 'Bisa. Anda dapat memesan busana, makeup, atau dekorasi saja. Paket lengkap tersedia jika Anda ingin koordinasi yang lebih ringkas.',
  },
  {
    q: 'Bagaimana perhitungan biaya transportasi?',
    a: 'Biaya transportasi mengikuti lokasi acara dan kebutuhan tim. Nilai final disampaikan sebelum Anda membayar uang muka.',
  },
  {
    q: 'Kapan sebaiknya melakukan booking?',
    a: 'Idealnya tiga sampai enam bulan sebelum acara, terutama untuk tanggal populer. Untuk kebutuhan mendadak, hubungi kami agar ketersediaan dapat dicek langsung.',
  },
];

export default function Home() {
  const [dresses] = useDresses();
  const [packages] = usePackages();
  const [gallery] = useGallery();
  const [testimonials] = useTestimonials();
  const [settings] = useSettings();

  const services = [
    {
      number: '01',
      title: 'Busana pengantin',
      description: 'Kebaya, busana adat, gaun modern, dan setelan pria yang dipilih berdasarkan bentuk tubuh serta karakter acara.',
      href: '/dresses',
      image: settings.serviceDressImage,
    },
    {
      number: '02',
      title: 'Makeup',
      description: 'Rias pengantin yang dirancang melalui konsultasi look, karakter wajah, pencahayaan, dan durasi acara.',
      href: '/makeup',
      image: settings.serviceMakeupImage,
    },
    {
      number: '03',
      title: 'Dekorasi',
      description: 'Konsep ruang yang proporsional terhadap lokasi acara, palet warna, dan kebutuhan dokumentasi.',
      href: '/decor',
      image: settings.serviceDecorImage,
    },
  ];

  const featuredDresses = dresses.filter((dress) => dress.isPopular).slice(0, 3);
  return (
    <div className="pb-24">
      {/* Mobile Hero (Editorial-Asymmetric) */}
      <section className="block md:hidden border-b bg-background overflow-hidden">
        <div className="px-5 py-8 space-y-6 flex flex-col min-h-[calc(100svh-4rem)] justify-between">
          {/* Header Typography */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80">
              <span className="h-[1px] w-5 bg-primary/40" />
              Busana · Rias · Dekorasi
            </div>
            <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-foreground">
              Satu visi untuk hari pernikahan{' '}
              <span className="font-serif italic text-primary block mt-1.5 font-normal">
                yang terasa milik Anda.
              </span>
            </h1>
          </div>

          {/* Asymmetric Gallery Frame */}
          <div className="relative w-full my-2 flex items-center justify-center">
            {/* Background offset card to give depth */}
            <div className="absolute top-2 left-8 w-[80%] aspect-[4/5] bg-secondary/40 rounded-2xl border border-border/30 -z-10" />
            
            {/* Main Image Container */}
            <div className="relative w-[80%] aspect-[4/5] ml-6 rounded-2xl overflow-hidden border border-border/80 shadow-md bg-muted">
              {settings.heroImage ? (
                <Image 
                  src={settings.heroImage} 
                  alt="Karya pernikahan Ermi Pengantin" 
                  fill 
                  priority
                  sizes="80vw" 
                  className="object-cover" 
                />
              ) : (
                <ImagePlaceholder label="Foto hero belum diatur" />
              )}
            </div>
          </div>

          {/* Paragraph & CTAs */}
          <div className="space-y-4">
            <p className="text-xs leading-normal text-muted-foreground max-w-sm">
              Ceritakan rencana Anda. Kami menyelaraskan seluruh detail agar hari pernikahan terasa utuh, personal, dan tetap tenang.
            </p>
            <div className="flex gap-2">
              <Button asChild size="lg" className="flex-grow h-10 text-xs font-bold uppercase tracking-wider">
                <Link href="/booking">Mulai Konsultasi</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="flex-grow h-10 text-xs font-bold">
                <Link href="/dresses">Koleksi Gaun</Link>
              </Button>
            </div>
          </div>

          {/* Horizontal Service Quick-Preview */}
          <div className="space-y-2 border-t pt-4 border-border/60">
            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Eksplor Layanan:</span>
            <div className="flex overflow-x-auto gap-3 py-1 scrollbar-none snap-x snap-mandatory">
              {services.map((service) => (
                <Link
                  key={service.href}
                  href={service.href}
                  className="flex-shrink-0 w-[45%] snap-start group"
                >
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-border/60 bg-muted mb-1.5 shadow-xs">
                    {service.image ? (
                      <Image 
                        src={service.image} 
                        alt={service.title} 
                        fill 
                        sizes="25vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105" 
                      />
                    ) : (
                      <ImagePlaceholder label="" />
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-foreground">
                    <span className="truncate pr-1">{service.title}</span>
                    <span className="font-mono text-muted-foreground/60 text-[9px]">{service.number}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Desktop Hero (Original Split-Grid) */}
      <section className="hidden md:block border-b bg-secondary/35">
        <div className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-7xl lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex items-center px-6 py-20 sm:px-10 lg:px-12">
            <div className="max-w-xl space-y-8">
              <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                <span className="h-px w-8 bg-accent" />
                Busana · Rias · Dekorasi
              </div>
              <h1 className="font-heading text-5xl leading-[0.98] tracking-[-0.035em] sm:text-6xl lg:text-7xl">
                Satu visi untuk hari pernikahan yang terasa milik Anda.
              </h1>
              <p className="max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">
                Ceritakan rencana Anda. Kami menyelaraskan busana, rias, dan dekorasi agar hari pernikahan terasa utuh, personal, dan tetap tenang.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-11 px-6">
                  <Link href="/booking">Mulai konsultasi <ArrowRight /></Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-11 px-6">
                  <Link href="/dresses">Jelajahi koleksi</Link>
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-6 border-t pt-6 text-sm text-muted-foreground">
                <p><span className="block font-medium text-foreground">Semua dalam satu tim</span>Busana, rias, dan dekorasi.</p>
                <p><span className="block font-medium text-foreground">Dimulai dari cerita Anda</span>Bukan paket seragam.</p>
              </div>
            </div>
          </div>

          <div className="relative min-h-[55svh] overflow-hidden border-l bg-muted lg:min-h-full">
            {settings.heroImage ? (
              <Image src={settings.heroImage} alt="Karya pernikahan Ermi Pengantin" fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
            ) : (
              <ImagePlaceholder label="Foto hero belum diatur" />
            )}
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/65 to-transparent p-6 pt-24 text-white sm:p-8">
              <p className="max-w-xs text-sm leading-6 text-white/80">Setiap pilihan dibangun dari konteks acara, bukan dari template yang sama.</p>
              <span className="font-heading text-3xl italic">Ermi</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mb-12 grid gap-6 md:grid-cols-[0.7fr_1.3fr] md:items-end">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Layanan Ermi Pengantin</p>
            <h2 className="font-heading text-4xl tracking-tight sm:text-5xl">Dikerjakan sebagai satu kesatuan.</h2>
          </div>
          <p className="max-w-xl text-base leading-7 text-muted-foreground md:justify-self-end">
            Bukan sekadar menggabungkan vendor. Kami menjaga agar busana, wajah, dan ruang berbicara dalam bahasa visual yang sama.
          </p>
        </div>

        <div className="grid border-y md:grid-cols-3">
          {services.map((service) => (
            <article key={service.href} className="group border-b py-6 md:border-b-0 md:px-6 md:first:pl-0 md:last:pr-0 md:not-last:border-r">
              <div className="relative mb-6 aspect-[4/3] overflow-hidden bg-muted">
                {service.image ? (
                  <Image src={service.image} alt={service.title} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
                ) : (
                  <ImagePlaceholder label="Belum ada foto" />
                )}
              </div>
              <div className="mb-3 flex items-baseline justify-between">
                <h3 className="font-heading text-2xl">{service.title}</h3>
                <span className="font-mono text-xs text-muted-foreground">{service.number}</span>
              </div>
              <p className="mb-5 min-h-20 text-sm leading-6 text-muted-foreground">{service.description}</p>
              <Button asChild variant="link" className="h-auto p-0 text-foreground">
                <Link href={service.href}>Pelajari layanan <ArrowRight /></Link>
              </Button>
            </article>
          ))}
        </div>
      </section>

      {featuredDresses.length > 0 && (
        <section className="border-y bg-card py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Pilihan atelier</p>
                <h2 className="font-heading text-4xl tracking-tight sm:text-5xl">Busana yang layak dicoba langsung.</h2>
              </div>
              <Button asChild variant="outline"><Link href="/dresses">Seluruh koleksi ({dresses.length})</Link></Button>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredDresses.map((dress) => <DressCard key={dress.id} dress={dress} />)}
            </div>
          </div>
        </section>
      )}

      {packages.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Paket terintegrasi</p>
            <h2 className="font-heading text-4xl tracking-tight sm:text-5xl">Lebih sedikit koordinasi, lebih banyak kepastian.</h2>
            <p className="mt-5 text-base leading-7 text-muted-foreground">Pilih paket sebagai titik awal. Detail tetap dapat disesuaikan setelah konsultasi.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {packages.slice(0, 3).map((pkg) => <PackageCard key={pkg.id} pkg={pkg} />)}
          </div>
        </section>
      )}

      {gallery.length > 0 && (
        <section className="bg-primary py-24 text-primary-foreground">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 grid gap-4 md:grid-cols-2 md:items-end">
              <h2 className="font-heading text-4xl tracking-tight sm:text-5xl">Catatan visual dari karya kami.</h2>
              <p className="max-w-md text-sm leading-6 text-primary-foreground/65 md:justify-self-end">Dokumentasi busana, rias, dan tata ruang yang telah diwujudkan bersama klien Ermi Pengantin.</p>
            </div>
            <div className="grid auto-rows-[220px] gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.slice(0, 5).map((item, index) => (
                <figure key={item.id} className={`group relative overflow-hidden bg-white/5 ${index === 0 ? 'sm:row-span-2 lg:col-span-2' : ''}`}>
                  {item.image ? <Image src={item.image} alt={item.title} fill sizes="(min-width: 1024px) 50vw, (min-width: 640px) 50vw, 100vw" className="object-cover opacity-90 transition duration-500 group-hover:opacity-100" /> : <ImagePlaceholder label="Foto kosong" />}
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-5 pt-16">
                    <p className="text-xs uppercase tracking-[0.16em] text-white/60">{item.category}</p>
                    <p className="mt-1 font-heading text-xl text-white">{item.title}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Cara bekerja</p>
            <h2 className="font-heading text-4xl tracking-tight sm:text-5xl">Proses yang jelas sejak awal.</h2>
          </div>
          <div className="border-t">
            {bookingSteps.map(([number, title, description]) => (
              <div key={number} className="grid gap-3 border-b py-6 sm:grid-cols-[48px_180px_1fr] sm:items-start">
                <span className="font-mono text-xs text-muted-foreground">{number}</span>
                <h3 className="font-medium">{title}</h3>
                <p className="text-sm leading-6 text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {testimonials.length > 0 && (
        <section className="border-y bg-secondary/40 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-10 max-w-xl font-heading text-4xl tracking-tight">Yang dirasakan klien setelah semuanya selesai.</h2>
            <div className="grid gap-8 md:grid-cols-3">
              {testimonials.slice(0, 3).map((testimonial) => (
                <blockquote key={testimonial.id} className="border-t border-foreground/20 pt-6">
                  <div className="mb-5 flex gap-1" aria-label={`${testimonial.rating} dari 5 bintang`}>
                    {Array.from({ length: testimonial.rating }).map((_, index) => <Star key={index} className="size-3.5 fill-accent text-accent" />)}
                  </div>
                  <p className="font-heading text-xl leading-8">“{testimonial.comment}”</p>
                  <footer className="mt-6 text-sm text-muted-foreground"><span className="font-medium text-foreground">{testimonial.name}</span> · {testimonial.role}</footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:px-8">
        <div>
          <Badge variant="outline" className="mb-5">Pertanyaan umum</Badge>
          <h2 className="font-heading text-4xl tracking-tight">Hal yang biasanya ditanyakan sebelum mulai.</h2>
        </div>
        <Accordion type="single" collapsible className="border-t">
          {faqs.map((faq, index) => (
            <AccordionItem key={faq.q} value={`faq-${index}`}>
              <AccordionTrigger className="py-5 text-base hover:no-underline">{faq.q}</AccordionTrigger>
              <AccordionContent className="max-w-2xl pb-5 leading-6 text-muted-foreground">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Card className="border-0 bg-primary py-0 text-primary-foreground ring-0">
          <CardContent className="grid gap-8 px-6 py-12 sm:px-10 lg:grid-cols-[1fr_auto] lg:items-end lg:px-14 lg:py-16">
            <div className="max-w-2xl">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground/55">Mulai percakapan</p>
              <h2 className="font-heading text-4xl tracking-tight sm:text-5xl">Bawa referensi Anda. Kami bantu menyusun sisanya.</h2>
              <div className="mt-6 flex items-start gap-2 text-sm leading-6 text-primary-foreground/65"><Check className="mt-1 size-4 shrink-0" /> Konsultasi awal membantu menentukan layanan dan kisaran anggaran yang relevan.</div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Button asChild size="lg" className="bg-background text-foreground hover:bg-background/90"><Link href="/booking">Buat janji <ArrowRight /></Link></Button>
              <Button asChild variant="outline" size="lg" className="border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white">
                <a href={`https://wa.me/${settings.whatsappAdmin}?text=Halo%20Ermi%20Pengantin%2C%20saya%20ingin%20berkonsultasi.`} target="_blank" rel="noreferrer"><MessageCircle /> WhatsApp</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
