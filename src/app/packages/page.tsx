'use client';

import { Info } from 'lucide-react';
import { usePackages } from '@/data/db';
import PackageCard from '@/components/PackageCard';
import EmptyState from '@/components/ui/EmptyState';

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs uppercase tracking-widest text-gold-dark font-bold font-semibold">All-In-One Wedding Package</span>
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-charcoal">Paket Pernikahan Lengkap</h1>
        <p className="text-xs text-stone-muted">
          Pilihan paket wedding terpadu yang memadukan gaun atelier, rias wajah glamor, dan panggung pelaminan mewah untuk menghemat waktu serta anggaran pernikahan Anda.
        </p>
      </div>

      {/* Package Cards Grid */}
      {packages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pt-4">
          {packages.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      ) : (
        <EmptyState title="Belum ada paket" description="Paket pernikahan akan tampil setelah ditambahkan dari admin panel." />
      )}

      {/* Comparison Table */}
      <div className="space-y-8 pt-8">
        <div className="text-center max-w-lg mx-auto space-y-2">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-charcoal">Komparasi Detail Paket</h2>
          <p className="text-xs text-stone-muted">Bandingkan detail inklusi fasilitas antar paket pernikahan untuk membantu keputusan terbaik Anda.</p>
        </div>

        {packages.length > 0 && (
          <div className="overflow-x-auto bg-white rounded-3xl border border-gold-light/20 shadow-md">
            <table className="w-full text-left border-collapse min-w-[700px] text-xs">
              <thead>
                <tr className="bg-gradient-to-r from-ivory to-white border-b border-gold-light/10 text-charcoal font-serif font-bold">
                  <th className="p-4 md:p-5 font-semibold">Fitur / Inklusi</th>
                  {packages.map((pkg) => (
                    <th key={pkg.id} className="p-4 md:p-5 text-center text-stone-700">
                      {pkg.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-light/10">
                <tr className="hover:bg-ivory-light/40 transition-colors">
                  <td className="p-4 md:p-5 font-semibold text-charcoal">Harga Paket</td>
                  {packages.map((pkg) => (
                    <td key={pkg.id} className="p-4 md:p-5 text-center font-bold text-gold-dark">{formatPrice(pkg.price)}</td>
                  ))}
                </tr>
                <tr className="hover:bg-ivory-light/40 transition-colors">
                  <td className="p-4 md:p-5 font-semibold text-charcoal">Gaun Pengantin</td>
                  {packages.map((pkg) => (
                    <td key={pkg.id} className="p-4 md:p-5 text-center text-stone-600">{pkg.dressesIncluded} pasang</td>
                  ))}
                </tr>
                <tr className="hover:bg-ivory-light/40 transition-colors">
                  <td className="p-4 md:p-5 font-semibold text-charcoal">Makeup</td>
                  {packages.map((pkg) => (
                    <td key={pkg.id} className="p-4 md:p-5 text-center text-stone-600">{pkg.makeupIncluded.join(', ') || '-'}</td>
                  ))}
                </tr>
                <tr className="hover:bg-ivory-light/40 transition-colors">
                  <td className="p-4 md:p-5 font-semibold text-charcoal">Dekorasi</td>
                  {packages.map((pkg) => (
                    <td key={pkg.id} className="p-4 md:p-5 text-center text-stone-600">{pkg.decorIncluded || '-'}</td>
                  ))}
                </tr>
                <tr className="hover:bg-ivory-light/40 transition-colors">
                  <td className="p-4 md:p-5 font-semibold text-charcoal">DP Minimum</td>
                  {packages.map((pkg) => (
                    <td key={pkg.id} className="p-4 md:p-5 text-center text-stone-600">{formatPrice(pkg.depositRequired)}</td>
                  ))}
                </tr>
                <tr className="hover:bg-ivory-light/40 transition-colors">
                  <td className="p-4 md:p-5 font-semibold text-charcoal">Fasilitas Tambahan</td>
                  {packages.map((pkg) => (
                    <td key={pkg.id} className="p-4 md:p-5 text-center text-stone-600">{pkg.features.join(', ') || '-'}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Small Note */}
        <div className="flex gap-2 items-start justify-center max-w-xl mx-auto text-[10px] text-stone-500 bg-ivory p-4 rounded-xl border border-gold-light/10 text-center">
          <Info className="h-4 w-4 text-gold-dark flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Semua paket di atas mensyaratkan pembayaran uang muka (DP) minimal sebesar 30% atau sesuai angka tercantum untuk reservasi tanggal. Pelunasan dilakukan maksimal H-7 sebelum pengerjaan hari pernikahan dimulai.
          </p>
        </div>
      </div>

    </div>
  );
}
