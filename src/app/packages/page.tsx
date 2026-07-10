'use client';

import { Check, X, Info } from 'lucide-react';
import { usePackages } from '@/data/db';
import PackageCard from '@/components/PackageCard';

export default function PackagesPage() {
  const [packages] = usePackages();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Matrix data for comparison table
  const featuresMatrix = [
    { name: 'Harga Paket', hemat: 'Rp 15jt', standard: 'Rp 25jt', premium: 'Rp 39jt', luxury: 'Rp 59jt' },
    { name: 'Gaun Pengantin', hemat: '2 Pasang', standard: '3 Pasang', premium: '4 Pasang', luxury: '5 Pasang' },
    { name: 'MUA Utama', hemat: 'MUA Team', standard: 'MUA Utama', premium: 'MUA Utama', luxury: 'MUA Hits Nasional' },
    { name: 'Retouch Makeup', hemat: '1x Retouch', standard: '1x Retouch', premium: '1x Retouch', luxury: 'Unlimited Retouch' },
    { name: 'Rias Ibu Kandung', hemat: false, standard: '2 Orang', premium: '2 Orang', luxury: '2 Orang' },
    { name: 'Rias Bridesmaid', hemat: false, standard: false, premium: '4 Orang', luxury: '6 Orang' },
    { name: 'Lebar Pelaminan', hemat: '4 - 5 meter', standard: '6 - 8 meter', premium: '10 - 12 meter', luxury: 'Up to 16 meter' },
    { name: 'Jenis Bunga', hemat: 'Artificial (Palsu)', standard: 'Campuran Segar & Palsu', premium: 'Full Bunga Segar', luxury: 'Full Bunga Segar Premium' },
    { name: 'Lighting System', hemat: 'Standard LED', rental: 'Standard + Spotlight', premium: 'Moving Head + Par LED', luxury: 'Professional Stage Lighting' },
    { name: 'Survey & Desain 3D', hemat: true, standard: true, premium: true, luxury: true },
    { name: 'Free Transport', hemat: 'DKI Jakarta', standard: 'Jabodetabek', premium: 'Jabodetabek + Jabar', luxury: 'Seluruh Pulau Jawa' },
    { name: 'Personal Coordinator', hemat: false, standard: false, premium: 'Hari-H', luxury: 'Planner + Coordinator' }
  ];

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pt-4">
        {packages.map((pkg) => (
          <PackageCard key={pkg.id} pkg={pkg} />
        ))}
      </div>

      {/* Comparison Table */}
      <div className="space-y-8 pt-8">
        <div className="text-center max-w-lg mx-auto space-y-2">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-charcoal">Komparasi Detail Paket</h2>
          <p className="text-xs text-stone-muted">Bandingkan detail inklusi fasilitas antar paket pernikahan untuk membantu keputusan terbaik Anda.</p>
        </div>

        <div className="overflow-x-auto bg-white rounded-3xl border border-gold-light/20 shadow-md">
          <table className="w-full text-left border-collapse min-w-[700px] text-xs">
            <thead>
              <tr className="bg-gradient-to-r from-ivory to-white border-b border-gold-light/10 text-charcoal font-serif font-bold">
                <th className="p-4 md:p-5 font-semibold">Fitur / Inklusi</th>
                <th className="p-4 md:p-5 text-center text-stone-700">Paket Hemat (Silver)</th>
                <th className="p-4 md:p-5 text-center text-gold-dark">Paket Standard (Gold)</th>
                <th className="p-4 md:p-5 text-center text-stone-700">Paket Premium (Platinum)</th>
                <th className="p-4 md:p-5 text-center text-charcoal">Paket Luxury (Diamond)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold-light/10">
              {featuresMatrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-ivory-light/40 transition-colors">
                  <td className="p-4 md:p-5 font-semibold text-charcoal">{row.name}</td>
                  
                  {/* Silver */}
                  <td className="p-4 md:p-5 text-center text-stone-600">
                    {typeof row.hemat === 'boolean' ? (
                      row.hemat ? <Check className="h-4.5 w-4.5 text-emerald-600 mx-auto" /> : <X className="h-4.5 w-4.5 text-red-400 mx-auto" />
                    ) : (
                      row.hemat
                    )}
                  </td>

                  {/* Gold */}
                  <td className="p-4 md:p-5 text-center text-gold-deep font-medium bg-gold/5">
                    {typeof row.standard === 'boolean' ? (
                      row.standard ? <Check className="h-4.5 w-4.5 text-emerald-600 mx-auto" /> : <X className="h-4.5 w-4.5 text-red-400 mx-auto" />
                    ) : (
                      row.standard
                    )}
                  </td>

                  {/* Premium */}
                  <td className="p-4 md:p-5 text-center text-stone-600">
                    {typeof row.premium === 'boolean' ? (
                      row.premium ? <Check className="h-4.5 w-4.5 text-emerald-600 mx-auto" /> : <X className="h-4.5 w-4.5 text-red-400 mx-auto" />
                    ) : (
                      row.premium
                    )}
                  </td>

                  {/* Luxury */}
                  <td className="p-4 md:p-5 text-center text-charcoal font-semibold">
                    {typeof row.luxury === 'boolean' ? (
                      row.luxury ? <Check className="h-4.5 w-4.5 text-emerald-600 mx-auto" /> : <X className="h-4.5 w-4.5 text-red-400 mx-auto" />
                    ) : (
                      row.luxury
                    )}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
