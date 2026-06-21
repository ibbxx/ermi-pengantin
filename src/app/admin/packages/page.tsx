'use client';

import { useState } from 'react';
import { Plus, Trash2, Award } from 'lucide-react';
import { MOCK_PACKAGES } from '@/data/mockData';
import { WeddingPackage } from '@/types';

export default function AdminPackages() {
  const [packages, setPackages] = useState<WeddingPackage[]>(MOCK_PACKAGES);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus paket pernikahan ini dari katalog?')) {
      setPackages(packages.filter((pkg) => pkg.id !== id));
    }
  };

  return (
    <div className="space-y-6 text-xs">
      
      {/* Header controls */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="font-serif font-bold text-base text-charcoal">Paket Pernikahan All-in-One</h2>
          <p className="text-[10px] text-stone-400">Atur paket komplit gabungan baju, makeup, dan dekorasi pelaminan dengan harga khusus.</p>
        </div>
        <button
          onClick={() => alert('Fitur tambah paket komplit akan dihubungkan ke backend database.')}
          className="px-4 py-2 bg-gold hover:bg-gold-dark text-white rounded-xl font-semibold uppercase tracking-wider flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" /> Tambah Paket
        </button>
      </div>

      {/* Table view of packages */}
      <div className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-md">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200 font-serif font-bold text-charcoal">
              <th className="p-4 md:p-5">Nama Paket</th>
              <th className="p-4 md:p-5">Harga Paket</th>
              <th className="p-4 md:p-5">Baju Pengantin</th>
              <th className="p-4 md:p-5">Fasilitas Rias</th>
              <th className="p-4 md:p-5">Uang Muka (DP)</th>
              <th className="p-4 md:p-5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-150">
            {packages.map((item) => (
              <tr key={item.id} className="hover:bg-ivory-light/35 transition-colors">
                <td className="p-4 md:p-5 font-bold text-charcoal flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-gold-dark" />
                  <span>{item.name}</span>
                  {item.isPopular && <span className="bg-gold text-white text-[8px] px-2 py-0.5 rounded-full uppercase">Best</span>}
                </td>
                <td className="p-4 md:p-5 font-extrabold text-gold-dark">{formatPrice(item.price)}</td>
                <td className="p-4 md:p-5 text-stone-600 font-semibold">{item.dressesIncluded} Pasang Baju</td>
                <td className="p-4 md:p-5 text-stone-500 font-medium">{item.makeupIncluded.join(', ')}</td>
                <td className="p-4 md:p-5 text-stone-600">{formatPrice(item.depositRequired)}</td>
                <td className="p-4 md:p-5 text-right">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded border border-stone-200 hover:border-red-500 hover:bg-red-50 text-stone-500 hover:text-red-700 transition-all inline-block"
                    title="Hapus Paket"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
