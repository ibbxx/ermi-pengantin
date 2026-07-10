'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Sparkles,
  Star,
  ShieldCheck,
  Check,
  Plus,
  Minus,
  ArrowRight,
  Heart
} from 'lucide-react';
import { useDresses, usePackages, useGallery, useTestimonials, useSettings } from '@/data/db';
import DressCard from '@/components/DressCard';
import PackageCard from '@/components/PackageCard';
import ImagePlaceholder from '@/components/ui/ImagePlaceholder';

export default function Home() {
  const [dresses] = useDresses();
  const [packages] = usePackages();
  const [gallery] = useGallery();
  const [testimonials] = useTestimonials();
  const [settings] = useSettings();

  // FAQ toggle state
  const [openFaq, setOpenFaq] = useState<number | null>(null);



  const services = [
    {
      title: 'Sewa Gaun Pengantin',
      description: 'Gaun mewah bernuansa modern, kebaya prada adat, baju adat tradisional, hingga jas formal dengan jaminan fitting sempurna.',
      href: '/dresses',
      img: dresses.find((dress) => dress.images[0])?.images[0] || '',
    },
    {
      title: 'Jasa Makeup Pengantin',
      description: 'Riasan wajah flawless dan berkilau yang disesuaikan dengan gaun Anda, dijamin tahan lama sepanjang hari oleh MUA profesional kami.',
      href: '/makeup',
      img: gallery.find((item) => item.category === 'makeup' && item.image)?.image || '',
    },
    {
      title: 'Dekorasi Pelaminan',
      description: 'Dekorasi ballroom megah, konsep rustic outdoor romantis, hingga pelaminan adat sakral yang didesain presisi sesuai venue Anda.',
      href: '/decor',
      img: gallery.find((item) => item.category === 'decor' && item.image)?.image || '',
    },
  ];

  const bookingSteps = [
    {
      step: '01',
      title: 'Pilih Layanan & Tanggal',
      description: 'Temukan gaun favorit, paket makeup, atau dekorasi impian Anda lalu tentukan tanggal hari pernikahan Anda.'
    },
    {
      step: '02',
      title: 'Konsultasi & Fitting',
      description: 'Diskusikan konsep dengan tim kami via WhatsApp dan jadwalkan sesi fitting gratis untuk penyesuaian ukuran gaun.'
    },
    {
      step: '03',
      title: 'Bayar DP Aman',
      description: 'Amankan jadwal Anda dengan membayar uang muka (DP) minimal 30% melalui gerbang pembayaran instan kami.'
    },
    {
      step: '04',
      title: 'Hari Bahagia Anda',
      description: 'Semua detail disiapkan tepat waktu. Gaun diantar rapi, MUA datang pagi, dan dekorasi terpasang kokoh sempurna.'
    }
  ];

  const faqs = [
    {
      q: 'Bagaimana sistem sewa gaun pengantin di Elika?',
      a: 'Sewa gaun berdurasi 3 hari (hari pertama fitting akhir/pengambilan, hari kedua acara pernikahan, hari ketiga pengembalian). Kami juga melayani perpanjangan durasi sewa dengan konfirmasi sebelumnya.'
    },
    {
      q: 'Apakah harga paket sudah termasuk biaya transportasi?',
      a: 'Untuk Paket Standard (Gold), Paket Premium, dan Paket Luxury, biaya transportasi MUA dan tim dekorasi sudah gratis untuk seluruh wilayah Jabodetabek. Di luar wilayah tersebut, ada biaya transport penyesuaian.'
    },
    {
      q: 'Apakah bisa memesan sewa baju saja atau makeup saja?',
      a: 'Tentu bisa! Kami menyediakan layanan terpisah (ala carte) baik sewa baju pengantin di katalog /dresses, paket makeup di /makeup, maupun dekorasi di /decor. Anda bebas memadukan sesuai kebutuhan.'
    },
    {
      q: 'Bagaimana jika gaun yang saya sewa mengalami kerusakan kecil?',
      a: 'Kerusakan kecil akibat pemakaian wajar (seperti kancing lepas atau noda kosmetik ringan) ditanggung oleh uang jaminan (deposit) yang dikembalikan setelah gaun diperiksa. Untuk kerusakan fatal/sobek parah, akan dikenakan denda sesuai syarat sewa.'
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="space-y-24 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden -mt-20">
        <div className="absolute inset-0 z-0">
          {settings.heroImage ? (
            <img
              src={settings.heroImage}
              alt="Pernikahan Indonesia"
              className="w-full h-full object-cover brightness-[0.65]"
            />
          ) : (
            <ImagePlaceholder label="Hero belum diatur" className="brightness-[0.65]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal/80 via-charcoal/50 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left py-32 text-white">
          <div className="max-w-2xl space-y-6 animate-fade-in">
            <div className="inline-flex items-center space-x-2 bg-gold/25 border border-gold/40 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase text-gold-light">
              <Sparkles className="h-4 w-4 text-gold-light" />
              <span>Premium Wedding Atelier & Organizer</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight">
              Wujudkan Hari Pernikahan Impian Anda Yang Elegan
            </h1>
            
            <p className="text-stone-200 text-lg leading-relaxed font-light">
              Satu tempat terbaik untuk menyewa gaun pengantin mewah, riasan wajah menawan dari MUA profesional, dan dekorasi pernikahan megah.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
              <Link
                href="/booking"
                className="px-8 py-3.5 bg-gold hover:bg-gold-dark text-white rounded-full text-sm font-bold tracking-wider uppercase transition-all duration-300 shadow-lg text-center"
              >
                Booking Sekarang
              </Link>
              <Link
                href="/dresses"
                className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-full text-sm font-bold tracking-wider uppercase transition-all duration-300 backdrop-blur-sm text-center"
              >
                Lihat Katalog Gaun
              </Link>
            </div>
          </div>
        </div>
      </section>



      {/* 3. CORE SERVICES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs uppercase tracking-widest text-gold-dark font-bold">Layanan Utama Kami</span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-charcoal">Sentuhan Premium Untuk Hari Bahagia</h2>
          <p className="text-sm text-stone-muted leading-relaxed">
            Kami mengintegrasikan gaun pengantin haute couture, MUA tersertifikasi, dan dekorator berpengalaman untuk memastikan keharmonisan visual hari pernikahan Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((svc, i) => (
            <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gold-light/20 flex flex-col group">
              <div className="relative h-64 overflow-hidden">
                {svc.img ? (
                  <img
                    src={svc.img}
                    alt={svc.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <ImagePlaceholder label="Belum ada foto" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent" />
              </div>
              <div className="p-6 space-y-4 flex flex-col flex-grow">
                <h3 className="font-serif font-bold text-xl text-charcoal">{svc.title}</h3>
                <p className="text-xs text-stone-600 leading-relaxed flex-grow">{svc.description}</p>
                <Link
                  href={svc.href}
                  className="inline-flex items-center text-xs font-bold text-gold-dark hover:text-gold-deep transition-colors pt-2 gap-1 group-hover:translate-x-1 duration-200"
                >
                  <span>Selengkapnya</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. FEATURED DRESSES */}
      <section className="bg-ivory py-16 border-y border-gold-light/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-4">
            <div className="space-y-2 text-center md:text-left max-w-lg">
              <span className="text-xs uppercase tracking-widest text-gold-dark font-bold">Koleksi Terpopuler</span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-charcoal">Katalog Gaun Pengantin Unggulan</h2>
            </div>
            <Link
              href="/dresses"
              className="inline-flex items-center px-6 py-2.5 bg-gold/10 hover:bg-gold/20 text-gold-dark rounded-full text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Lihat Semua Gaun ({dresses.length})
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {dresses.filter(d => d.isPopular).slice(0, 3).map((dress) => (
              <DressCard key={dress.id} dress={dress} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. POPULAR PACKAGES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs uppercase tracking-widest text-gold-dark font-bold font-semibold">Solusi Hemat & Praktis</span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-charcoal">Paket Pernikahan All-In-One Terpopuler</h2>
          <p className="text-sm text-stone-muted leading-relaxed">
            Pilihan paket pernikahan terintegrasi lengkap dengan gaun, makeup keluarga, dan dekorasi panggung pelaminan mewah untuk menghemat waktu serta anggaran Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {packages.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      </section>

      {/* 6. PORTFOLIO SHOWCASE */}
      <section className="bg-charcoal text-ivory-light py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs uppercase tracking-widest text-gold font-bold">Galeri Inspirasi</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white">Hasil Portofolio Nyata Kami</h2>
            <p className="text-stone-400 text-sm leading-relaxed">
              Lihat dokumentasi hasil tata rias pengantin dan dekorasi dekorasi megah di berbagai venue pernikahan asli di Indonesia.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gallery.slice(0, 6).map((item) => (
              <div key={item.id} className="relative aspect-square overflow-hidden rounded-2xl group cursor-pointer shadow-lg">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <ImagePlaceholder label="Foto kosong" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6" />
                <div className="absolute inset-x-6 bottom-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100 text-white z-10">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gold block mb-1">
                    {item.category === 'makeup' ? 'Rias Wajah (MUA)' : item.category === 'decor' ? 'Dekorasi Pelaminan' : 'Katalog Atelier'}
                  </span>
                  <h4 className="font-serif font-bold text-lg">{item.title}</h4>
                  {item.description && <p className="text-xs text-stone-300 mt-1">{item.description}</p>}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-4">
            <Link
              href="/decor"
              className="inline-flex items-center px-8 py-3 border border-gold hover:bg-gold/15 text-gold font-bold uppercase tracking-wider rounded-full transition-all duration-300 text-sm"
            >
              Lihat Portofolio Dekorasi
            </Link>
          </div>
        </div>
      </section>

      {/* 7. HOW IT WORKS (CARA BOOKING) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs uppercase tracking-widest text-gold-dark font-bold">Langkah Pemesanan</span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-charcoal">Bagaimana Alur Melakukan Booking?</h2>
          <p className="text-sm text-stone-muted">
            Proses pemesanan layanan pernikahan di Elika dirancang sesederhana dan senyaman mungkin untuk kesibukan Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {bookingSteps.map((step, idx) => (
            <div key={idx} className="relative bg-white p-8 rounded-3xl border border-gold-light/20 shadow-md flex flex-col space-y-4">
              <span className="text-5xl font-serif font-extrabold text-gold-light">{step.step}</span>
              <h3 className="font-serif font-bold text-lg text-charcoal leading-tight">{step.title}</h3>
              <p className="text-xs text-stone-600 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 8. TESTIMONIALS */}
      <section className="bg-ivory py-20 border-y border-gold-light/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs uppercase tracking-widest text-gold-dark font-bold font-semibold">Testimoni Klien</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-charcoal">Kisah Bahagia Pasangan Elika</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((test) => (
              <div key={test.id} className="bg-white p-8 rounded-3xl shadow-md border border-gold-light/10 flex flex-col justify-between space-y-6">
                <div className="flex items-center space-x-1">
                  {Array.from({ length: test.rating }).map((_, i) => (
                    <Star key={i} className="h-4.5 w-4.5 fill-gold text-gold" />
                  ))}
                </div>
                <p className="text-stone-600 text-xs leading-relaxed font-light flex-grow">
                  "{test.comment}"
                </p>
                <div className="flex items-center space-x-3 pt-4 border-t border-gold-light/10">
                  {test.avatar ? (
                    <img
                      src={test.avatar}
                      alt={test.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-[10px] font-bold text-stone-400">
                      {test.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-xs text-charcoal">{test.name}</h4>
                    <p className="text-[10px] text-stone-muted">{test.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. FAQ SECTION */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs uppercase tracking-widest text-gold-dark font-bold font-semibold">Tanya Jawab</span>
          <h2 className="text-3xl font-serif font-bold text-charcoal">Pertanyaan Sering Diajukan (FAQ)</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="bg-white border border-gold-light/25 rounded-2xl overflow-hidden shadow-sm">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-4 flex justify-between items-center text-left hover:bg-ivory-light transition-colors"
                >
                  <span className="font-serif font-semibold text-sm text-charcoal">{faq.q}</span>
                  {isOpen ? <Minus className="h-4 w-4 text-gold-dark" /> : <Plus className="h-4 w-4 text-gold-dark" />}
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-xs text-stone-600 leading-relaxed border-t border-gold-light/10 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 10. CLOSING CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-charcoal rounded-3xl relative overflow-hidden text-center text-white py-16 px-8 shadow-2xl glass-dark">
          <div className="absolute inset-0 bg-gradient-to-tr from-gold-deep/20 via-transparent to-transparent -z-10" />
          <div className="max-w-xl mx-auto space-y-6 flex flex-col items-center">
            <Heart className="h-10 w-10 text-gold fill-gold animate-pulse" />
            <h2 className="text-3xl md:text-4xl font-serif font-bold leading-tight">
              Konsultasikan Pernikahan Impian Anda Hari Ini
            </h2>
            <p className="text-stone-300 text-xs md:text-sm font-light leading-relaxed">
              Jadwalkan janji temu fitting baju secara eksklusif atau tanyakan detail kustomisasi paket dekorasi. Admin kami siap melayani Anda sepenuh hati.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                href="/booking"
                className="px-8 py-3 bg-gold hover:bg-gold-dark text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md"
              >
                Booking Sekarang
              </Link>
              <a
                href={`https://wa.me/${settings.whatsappAdmin}?text=Halo%20Elika%20Wedding%2C%20saya%20tertarik%20untuk%20konsultasi%20paket%20wedding.`}
                target="_blank"
                rel="noreferrer"
                className="px-8 py-3 border border-stone-500 hover:border-gold hover:text-gold text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300"
              >
                Tanya via WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
