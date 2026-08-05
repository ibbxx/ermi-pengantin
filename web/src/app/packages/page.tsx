'use client';

import { Info } from 'lucide-react';
import { usePackages } from '@/data/db';
import PackageCard from '@/components/PackageCard';
import EmptyState from '@/components/ui/EmptyState';
import Breadcrumb from '@/components/Breadcrumb';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function PackagesPage() {
  const [packages] = usePackages();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Breadcrumb & Header */}
      <div className="space-y-2">
        <Breadcrumb />
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs uppercase tracking-widest text-primary font-bold">All-In-One Wedding Package</span>
          <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-foreground mt-1">Paket Pernikahan Lengkap</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Pilihan paket wedding terpadu yang memadukan gaun atelier, rias wajah glamor, dan panggung pelaminan mewah untuk menghemat waktu serta anggaran pernikahan Anda.
          </p>
        </div>
      </div>

      <Separator />

      {/* Package Cards Grid */}
      {packages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
          {packages.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      ) : (
        <EmptyState title="Belum ada paket" description="Paket pernikahan akan tampil setelah ditambahkan dari admin panel." />
      )}

      {/* Comparison Table */}
      <div className="space-y-6 pt-6 border-t">
        <div className="text-center max-w-lg mx-auto space-y-1">
          <h2 className="text-2xl font-serif font-bold text-foreground">Komparasi Detail Paket</h2>
          <p className="text-xs text-muted-foreground">Bandingkan detail inklusi fasilitas antar paket pernikahan untuk membantu keputusan terbaik Anda.</p>
        </div>

        {packages.length > 0 && (
          <div className="overflow-x-auto bg-card rounded-3xl border border-border/80 shadow-md">
            <table className="w-full text-left border-collapse min-w-[700px] text-xs">
              <thead>
                <tr className="bg-secondary/10 border-b border-border/40 text-foreground font-serif font-bold">
                  <th className="p-4 md:p-5 font-semibold">Fitur / Inklusi</th>
                  {packages.map((pkg) => (
                    <th key={pkg.id} className="p-4 md:p-5 text-center text-foreground/80">
                      {pkg.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                <tr className="hover:bg-secondary/5 transition-colors">
                  <td className="p-4 md:p-5 font-semibold text-foreground">Harga Paket</td>
                  {packages.map((pkg) => (
                    <td key={pkg.id} className="p-4 md:p-5 text-center font-bold text-primary">{formatPrice(pkg.price)}</td>
                  ))}
                </tr>
                <tr className="hover:bg-secondary/5 transition-colors">
                  <td className="p-4 md:p-5 font-semibold text-foreground">Gaun Pengantin</td>
                  {packages.map((pkg) => (
                    <td key={pkg.id} className="p-4 md:p-5 text-center text-muted-foreground font-medium">{pkg.dressesIncluded} pasang</td>
                  ))}
                </tr>
                <tr className="hover:bg-secondary/5 transition-colors">
                  <td className="p-4 md:p-5 font-semibold text-foreground">Makeup</td>
                  {packages.map((pkg) => (
                    <td key={pkg.id} className="p-4 md:p-5 text-center text-muted-foreground font-medium">{pkg.makeupIncluded.join(', ') || '-'}</td>
                  ))}
                </tr>
                <tr className="hover:bg-secondary/5 transition-colors">
                  <td className="p-4 md:p-5 font-semibold text-foreground">Dekorasi</td>
                  {packages.map((pkg) => (
                    <td key={pkg.id} className="p-4 md:p-5 text-center text-muted-foreground font-medium">{pkg.decorIncluded || '-'}</td>
                  ))}
                </tr>
                <tr className="hover:bg-secondary/5 transition-colors">
                  <td className="p-4 md:p-5 font-semibold text-foreground">DP Minimum</td>
                  {packages.map((pkg) => (
                    <td key={pkg.id} className="p-4 md:p-5 text-center text-muted-foreground font-medium">{formatPrice(pkg.depositRequired)}</td>
                  ))}
                </tr>
                <tr className="hover:bg-secondary/5 transition-colors">
                  <td className="p-4 md:p-5 font-semibold text-foreground">Fasilitas Tambahan</td>
                  {packages.map((pkg) => (
                    <td key={pkg.id} className="p-4 md:p-5 text-center text-muted-foreground font-medium">{pkg.features.join(', ') || '-'}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Small Note */}
        <div className="flex gap-2 items-start justify-center max-w-xl mx-auto text-[10px] text-muted-foreground bg-secondary/15 p-4 rounded-2xl border border-border/60 text-center">
          <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed font-light">
            Semua paket di atas mensyaratkan pembayaran uang muka (DP) minimal sesuai nominal tercantum untuk reservasi tanggal. Pelunasan dilakukan maksimal H-7 sebelum pengerjaan hari pernikahan dimulai.
          </p>
        </div>
      </div>

    </div>
  );
}
