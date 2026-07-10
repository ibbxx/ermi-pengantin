'use client';

import { useState } from 'react';
import { Plus, Trash2, Award, X, Edit3 } from 'lucide-react';
import { usePackages } from '@/data/db';
import { WeddingPackage } from '@/types';

export default function AdminPackages() {
  const [packages, setPackages] = usePackages();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<WeddingPackage | null>(null);

  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [dressesIncluded, setDressesIncluded] = useState(0);
  const [makeupIncludedInput, setMakeupIncludedInput] = useState('');
  const [decorIncluded, setDecorIncluded] = useState('');
  const [featuresInput, setFeaturesInput] = useState('');
  const [depositRequired, setDepositRequired] = useState(0);
  const [isPopular, setIsPopular] = useState(false);

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

  const resetForm = () => {
    setEditingPackage(null);
    setName('');
    setPrice(0);
    setDressesIncluded(0);
    setMakeupIncludedInput('');
    setDecorIncluded('');
    setFeaturesInput('');
    setDepositRequired(0);
    setIsPopular(false);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleOpenEditModal = (pkg: WeddingPackage) => {
    setEditingPackage(pkg);
    setName(pkg.name);
    setPrice(pkg.price);
    setDressesIncluded(pkg.dressesIncluded);
    setMakeupIncludedInput(pkg.makeupIncluded.join(', '));
    setDecorIncluded(pkg.decorIncluded);
    setFeaturesInput(pkg.features.join(', '));
    setDepositRequired(pkg.depositRequired);
    setIsPopular(pkg.isPopular);
    setShowAddModal(true);
  };

  const handleSubmitPackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const packagePayload: WeddingPackage = {
      id: editingPackage?.id || `pkg-${Date.now()}`,
      name,
      price,
      dressesIncluded,
      makeupIncluded: makeupIncludedInput.split(',').map((m) => m.trim()).filter(Boolean),
      decorIncluded,
      features: featuresInput.split(',').map((f) => f.trim()).filter(Boolean),
      depositRequired,
      isPopular
    };

    if (editingPackage) {
      setPackages(packages.map((pkg) => (pkg.id === editingPackage.id ? packagePayload : pkg)));
    } else {
      setPackages([...packages, packagePayload]);
    }

    resetForm();
    setShowAddModal(false);
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
          onClick={handleOpenAddModal}
          className="px-4 py-2 bg-gold hover:bg-gold-dark text-white rounded-xl font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
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
                    onClick={() => handleOpenEditModal(item)}
                    className="p-1.5 rounded border border-stone-200 hover:border-gold hover:bg-gold/5 text-stone-500 hover:text-gold-dark transition-all inline-block cursor-pointer mr-2"
                    title="Edit Paket"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded border border-stone-200 hover:border-red-500 hover:bg-red-50 text-stone-500 hover:text-red-700 transition-all inline-block cursor-pointer"
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

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-gold-light/20 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                resetForm();
                setShowAddModal(false);
              }}
              className="absolute top-4 right-4 text-stone-400 hover:text-charcoal transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-serif font-bold text-lg text-charcoal pb-2 border-b border-gold-light/10">
              {editingPackage ? 'Edit Paket Pernikahan' : 'Tambah Paket Pernikahan'}
            </h3>

            <form onSubmit={handleSubmitPackage} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <label className="font-semibold text-charcoal">Nama Paket Pernikahan</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 focus:outline-none focus:border-gold"
                    placeholder="Misal: Paket Gold (Standard)"
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
                  <label className="font-semibold text-charcoal">Uang Muka/DP Dibutuhkan (Rp)</label>
                  <input
                    type="number"
                    required
                    value={depositRequired}
                    onChange={(e) => setDepositRequired(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-charcoal">Jumlah Gaun Termasuk</label>
                  <input
                    type="number"
                    required
                    value={dressesIncluded}
                    onChange={(e) => setDressesIncluded(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-5">
                  <input
                    type="checkbox"
                    id="isPopular"
                    checked={isPopular}
                    onChange={(e) => setIsPopular(e.target.checked)}
                    className="h-4.5 w-4.5 rounded border-stone-300 text-gold accent-gold focus:ring-gold"
                  />
                  <label htmlFor="isPopular" className="font-semibold text-charcoal cursor-pointer">
                    Paket Populer (Rekomendasi)
                  </label>
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="font-semibold text-charcoal">Fasilitas Rias/Makeup (Pisahkan dengan koma)</label>
                  <textarea
                    rows={2}
                    required
                    value={makeupIncludedInput}
                    onChange={(e) => setMakeupIncludedInput(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 focus:outline-none focus:border-gold resize-none"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="font-semibold text-charcoal">Fasilitas Dekorasi Pelaminan</label>
                  <input
                    type="text"
                    required
                    value={decorIncluded}
                    onChange={(e) => setDecorIncluded(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 focus:outline-none focus:border-gold"
                    placeholder="Misal: Dekorasi Pelaminan 6-8m tema bebas..."
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="font-semibold text-charcoal">Inklusi/Fasilitas Tambahan Lainnya (Pisahkan dengan koma)</label>
                  <textarea
                    rows={2}
                    required
                    value={featuresInput}
                    onChange={(e) => setFeaturesInput(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 focus:outline-none focus:border-gold resize-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-gold hover:bg-gold-dark text-white font-bold rounded-xl uppercase tracking-wider shadow-md cursor-pointer"
                >
                  {editingPackage ? 'Simpan Perubahan Paket' : 'Simpan Paket Pernikahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
