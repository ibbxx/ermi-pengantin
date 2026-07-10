'use client';

import { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { useMakeup } from '@/data/db';
import { MakeupPackage } from '@/types';

export default function AdminMakeup() {
  const [packages, setPackages] = useMakeup();
  const [showAddModal, setShowAddModal] = useState(false);

  // New package form states
  const [name, setName] = useState('');
  const [price, setPrice] = useState(1500000);
  const [description, setDescription] = useState('');
  const [featuresInput, setFeaturesInput] = useState('1x Makeup Pengantin, 1x Hairdo / Hijab do, Free Fitting');

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

  const handleAddPackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newPackage: MakeupPackage = {
      id: `mua-${Date.now()}`,
      name,
      price,
      description,
      features: featuresInput.split(',').map((f) => f.trim()).filter(Boolean),
      images: ['https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80']
    };

    setPackages([...packages, newPackage]);

    // Reset fields
    setName('');
    setDescription('');
    setPrice(1500000);
    setFeaturesInput('1x Makeup Pengantin, 1x Hairdo / Hijab do, Free Fitting');
    setShowAddModal(false);
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
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-gold hover:bg-gold-dark text-white rounded-xl font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
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
                className="p-1.5 rounded border border-stone-200 hover:border-red-500 hover:bg-red-50 text-stone-500 hover:text-red-700 transition-all cursor-pointer"
                title="Hapus Paket"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-gold-light/20 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-charcoal transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-serif font-bold text-lg text-charcoal pb-2 border-b border-gold-light/10">
              Tambah Paket Rias MUA
            </h3>

            <form onSubmit={handleAddPackage} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-charcoal">Nama Paket Rias</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 focus:outline-none focus:border-gold"
                  placeholder="Misal: Paket Rias Akad Nikah Premium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-charcoal">Harga Paket (Rp)</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 focus:outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-charcoal">Fasilitas (Pisahkan dengan koma)</label>
                <textarea
                  rows={2}
                  required
                  value={featuresInput}
                  onChange={(e) => setFeaturesInput(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 focus:outline-none focus:border-gold resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-charcoal">Deskripsi Ringkas</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 focus:outline-none focus:border-gold resize-none"
                  placeholder="Penjelasan ringkas tentang layanan..."
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-gold hover:bg-gold-dark text-white font-bold rounded-xl uppercase tracking-wider shadow-md cursor-pointer"
                >
                  Simpan Paket Rias Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
