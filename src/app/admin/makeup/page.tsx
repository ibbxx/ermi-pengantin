'use client';

import { useState } from 'react';
import { Plus, Edit3, Trash2, Sparkles, MessageCircle } from 'lucide-react';
import { MOCK_MAKEUP } from '@/data/mockData';
import { MakeupPackage } from '@/types';

export default function AdminMakeup() {
  const [packages, setPackages] = useState<MakeupPackage[]>(MOCK_MAKEUP);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus paket rias ini dari katalog?')) {
      setPackages(packages.filter((pkg) => pkg.id !== id));
    }
  };

  return (
    <div className="space-y-6 text-xs">
      
      {/* Header controls */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="font-serif font-bold text-base text-charcoal">Daftar Paket Rias Artist (MUA)</h2>
          <p className="text-[10px] text-stone-400">Atur harga, deskripsi, dan fasilitas inklusi MUA untuk calon pengantin.</p>
        </div>
        <button
          onClick={() => alert('Fitur tambah paket akan dihubungkan ke backend database.')}
          className="px-4 py-2 bg-gold hover:bg-gold-dark text-white rounded-xl font-semibold uppercase tracking-wider flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" /> Tambah Paket
        </button>
      </div>

      {/* Grid List Packages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {packages.map((pkg) => (
          <div key={pkg.id} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="font-serif font-bold text-sm text-charcoal">{pkg.name}</h3>
                <span className="font-bold text-gold-dark">{formatPrice(pkg.price)}</span>
              </div>
              <p className="text-[11px] text-stone-500 leading-relaxed">{pkg.description}</p>
              
              <div className="pt-2">
                <span className="font-bold text-stone-400 block mb-1 uppercase text-[9px]">Fasilitas Termasuk:</span>
                <ul className="list-disc pl-4 space-y-1 text-stone-600">
                  {pkg.features.map((feat, i) => (
                    <li key={i}>{feat}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-stone-100 pt-4 mt-auto">
              <button
                onClick={() => handleDelete(pkg.id)}
                className="p-1.5 rounded border border-stone-200 hover:border-red-500 hover:bg-red-50 text-stone-500 hover:text-red-700 transition-all"
                title="Hapus Paket"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
