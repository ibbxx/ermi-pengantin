'use client';

import { useState } from 'react';
import { Plus, Trash2, Layers } from 'lucide-react';
import { MOCK_DECOR } from '@/data/mockData';
import { DecorPackage } from '@/types';

export default function AdminDecor() {
  const [decorations, setDecorations] = useState<DecorPackage[]>(MOCK_DECOR);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus tema dekorasi ini dari katalog?')) {
      setDecorations(decorations.filter((d) => d.id !== id));
    }
  };

  return (
    <div className="space-y-6 text-xs">
      
      {/* Header controls */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="font-serif font-bold text-base text-charcoal">Tema & Paket Dekorasi Pernikahan</h2>
          <p className="text-[10px] text-stone-400">Kelola tema backdrop pelaminan, pencahayaan panggung, dan kapasitas venue.</p>
        </div>
        <button
          onClick={() => alert('Fitur tambah tema akan dihubungkan ke backend database.')}
          className="px-4 py-2 bg-gold hover:bg-gold-dark text-white rounded-xl font-semibold uppercase tracking-wider flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" /> Tambah Tema
        </button>
      </div>

      {/* Grid List Decorations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {decorations.map((pkg) => (
          <div key={pkg.id} className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-stone-150">
                <img src={pkg.images[0]} alt={pkg.name} className="w-full h-full object-cover" />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-serif font-bold text-sm text-charcoal">{pkg.name}</h3>
                  <span className="font-bold text-gold-dark">{formatPrice(pkg.price)}</span>
                </div>
                <span className="text-[9px] font-bold text-stone-400 uppercase">Kapasitas: {pkg.venueSize}</span>
              </div>

              <p className="text-[11px] text-stone-500 leading-normal">{pkg.description}</p>
              
              <div className="space-y-1 pt-1">
                <span className="font-bold text-stone-400 block uppercase text-[9px]">Elemen Dekorasi:</span>
                <ul className="list-disc pl-4 space-y-0.5 text-stone-600">
                  {pkg.features.slice(0, 4).map((feat, i) => (
                    <li key={i}>{feat}</li>
                  ))}
                  {pkg.features.length > 4 && <li>dan {pkg.features.length - 4} item lainnya...</li>}
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-stone-100 pt-3 mt-auto">
              <button
                onClick={() => handleDelete(pkg.id)}
                className="p-1.5 rounded border border-stone-200 hover:border-red-500 hover:bg-red-50 text-stone-500 hover:text-red-700 transition-all"
                title="Hapus Tema"
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
