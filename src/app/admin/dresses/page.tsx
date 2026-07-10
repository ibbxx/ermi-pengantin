'use client';

import { useState, useMemo } from 'react';
import { Search, Plus, Trash2, Edit3, Scissors, Check, X } from 'lucide-react';
import { useDresses } from '@/data/db';
import { Dress, DressCategory } from '@/types';

export default function AdminDresses() {
  const [dresses, setDresses] = useDresses();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Dress form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<DressCategory>('Gaun Pengantin Modern');
  const [price, setPrice] = useState(2500000);
  const [deposit, setDeposit] = useState(1000000);
  const [sizeInput, setSizeInput] = useState('S, M, L');
  const [colorInput, setColorInput] = useState('Ivory, White');
  const [description, setDescription] = useState('');
  const [material, setMaterial] = useState('Sutera, Tulle');

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus gaun ini dari inventaris?')) {
      setDresses(dresses.filter((d) => d.id !== id));
    }
  };

  const handleAddDress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newDress: Dress = {
      id: `dress-${Date.now()}`,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name,
      category,
      price,
      deposit,
      sizes: sizeInput.split(',').map((s) => s.trim()),
      colors: colorInput.split(',').map((c) => c.trim()),
      images: ['https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=800&q=80'],
      description,
      material,
      rentalDurationDays: 3,
      availableDates: [],
      rating: 5.0,
      reviewCount: 0,
      isPopular: false,
      status: 'available'
    };

    setDresses([newDress, ...dresses]);
    
    // Reset states
    setName('');
    setDescription('');
    setSizeInput('S, M, L');
    setColorInput('Ivory, White');
    setPrice(2500000);
    setDeposit(1000000);
    setShowAddModal(false);
  };

  const filteredDresses = useMemo(() => {
    return dresses.filter((d) => {
      return d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.category.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [dresses, searchQuery]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] text-stone-400 block font-bold uppercase">Total Gaun Butik</span>
          <span className="text-xl font-black text-charcoal">{dresses.length} Item Gaun</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] text-stone-400 block font-bold uppercase">Gaun Ready</span>
          <span className="text-xl font-black text-emerald-600">
            {dresses.filter((d) => d.status === 'available').length} Gaun
          </span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] text-stone-400 block font-bold uppercase">Gaun Maintenance</span>
          <span className="text-xl font-black text-red-500">
            {dresses.filter((d) => d.status === 'maintenance').length} Item
          </span>
        </div>
      </div>

      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
        
        {/* Search */}
        <div className="relative flex-grow max-w-md">
          <input
            type="text"
            placeholder="Cari gaun berdasarkan nama/kategori..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 focus:border-gold rounded-xl py-2 px-3 pl-9 text-xs focus:outline-none"
          />
          <Search className="h-4 w-4 text-stone-400 absolute left-3 top-2.5" />
        </div>

        {/* Add Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-gold hover:bg-gold-dark text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Plus className="h-4 w-4" /> Tambah Gaun Baru
        </button>

      </div>

      {/* Dresses List Table */}
      <div className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 font-serif font-bold text-charcoal">
                <th className="p-4 md:p-5">Foto & Nama Gaun</th>
                <th className="p-4 md:p-5">Kategori</th>
                <th className="p-4 md:p-5">Ukuran</th>
                <th className="p-4 md:p-5">Harga Sewa</th>
                <th className="p-4 md:p-5">Deposit Jaminan</th>
                <th className="p-4 md:p-5">Status</th>
                <th className="p-4 md:p-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-150">
              {filteredDresses.map((item) => (
                <tr key={item.id} className="hover:bg-ivory-light/35 transition-colors">
                  <td className="p-4 md:p-5 flex items-center space-x-3">
                    <img src={item.images[0]} alt={item.name} className="w-12 h-16 rounded object-cover" />
                    <div>
                      <p className="font-bold text-charcoal leading-tight">{item.name}</p>
                      <span className="text-[9px] text-stone-400">{item.material}</span>
                    </div>
                  </td>
                  <td className="p-4 md:p-5 font-semibold text-stone-600">{item.category}</td>
                  <td className="p-4 md:p-5 text-charcoal">{item.sizes.join(', ')}</td>
                  <td className="p-4 md:p-5 font-bold text-gold-dark">{formatPrice(item.price)}</td>
                  <td className="p-4 md:p-5 text-stone-500">{formatPrice(item.deposit)}</td>
                  <td className="p-4 md:p-5">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      item.status === 'available' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                    }`}>
                      {item.status === 'available' ? 'Ready' : 'Maintenance'}
                    </span>
                  </td>
                  <td className="p-4 md:p-5 text-right">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded border border-stone-200 hover:border-red-500 hover:bg-red-50 text-stone-500 hover:text-red-700 transition-all inline-block"
                      title="Hapus Gaun"
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

      {/* Add Dress Modal simulation */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-gold-light/20 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-charcoal transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-serif font-bold text-lg text-charcoal pb-2 border-b border-gold-light/10">
              Tambah Inventaris Gaun
            </h3>

            <form onSubmit={handleAddDress} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <label className="font-semibold text-charcoal">Nama Gaun / Busana</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-charcoal">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as DressCategory)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 focus:outline-none focus:border-gold"
                  >
                    <option value="Gaun Pengantin Modern">Gaun Pengantin Modern</option>
                    <option value="Kebaya Pengantin">Kebaya Pengantin</option>
                    <option value="Baju Adat">Baju Adat</option>
                    <option value="Jas Pengantin Pria">Jas Pengantin Pria</option>
                    <option value="Bridesmaid">Bridesmaid</option>
                    <option value="Family Dress">Family Dress</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-charcoal">Bahan Utama</label>
                  <input
                    type="text"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-charcoal">Harga Sewa (3 Hari)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-charcoal">Uang Jaminan (Deposit)</label>
                  <input
                    type="number"
                    value={deposit}
                    onChange={(e) => setDeposit(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-charcoal">Ukuran (Pisahkan dengan koma)</label>
                  <input
                    type="text"
                    value={sizeInput}
                    onChange={(e) => setSizeInput(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-charcoal">Warna (Pisahkan dengan koma)</label>
                  <input
                    type="text"
                    value={colorInput}
                    onChange={(e) => setColorInput(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 focus:outline-none"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="font-semibold text-charcoal">Deskripsi Gaun</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 focus:outline-none resize-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-gold hover:bg-gold-dark text-white font-bold rounded-xl uppercase tracking-wider shadow-md"
                >
                  Simpan Gaun Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
