'use client';

import { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { useGallery } from '@/data/db';
import { Gallery } from '@/types';

export default function AdminGallery() {
  const [items, setItems] = useGallery();
  const [showAddModal, setShowAddModal] = useState(false);

  // New gallery item states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'makeup' | 'decor' | 'dress-showcase'>('makeup');
  const [image, setImage] = useState('https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80');
  const [description, setDescription] = useState('');

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus foto portofolio ini?')) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !image.trim()) return;

    const newItem: Gallery = {
      id: `gal-${Date.now()}`,
      title,
      category,
      image,
      description: description || undefined
    };

    setItems([...items, newItem]);

    // Reset fields
    setTitle('');
    setCategory('makeup');
    setImage('https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80');
    setDescription('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 text-xs">
      
      {/* Header controls */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="font-serif font-bold text-base text-charcoal">Galeri Portofolio Hasil Kerja</h2>
          <p className="text-[10px] text-stone-400">Unggah dokumentasi foto makeup pengantin, model gaun terbaru, atau dekorasi pelaminan.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-gold hover:bg-gold-dark text-white rounded-xl font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Unggah Foto Baru
        </button>
      </div>

      {/* Grid of gallery assets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm flex flex-col justify-between">
            <div className="relative aspect-square bg-stone-100 overflow-hidden">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
            </div>
            
            <div className="p-4 space-y-2 flex-grow flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-bold text-gold-dark uppercase tracking-wider block mb-1">
                  Kategori: {item.category}
                </span>
                <h4 className="font-serif font-bold text-sm text-charcoal leading-tight truncate">{item.title}</h4>
              </div>
              
              <div className="flex justify-end pt-3 border-t border-stone-100 mt-2">
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded border border-stone-200 hover:border-red-500 hover:bg-red-50 text-stone-500 hover:text-red-700 transition-all cursor-pointer"
                  title="Hapus Foto"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
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
              Unggah Foto Baru
            </h3>

            <form onSubmit={handleAddItem} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-charcoal">Judul / Nama Foto</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 focus:outline-none focus:border-gold"
                  placeholder="Misal: Flawless Makeup Pengantin Sunda"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-charcoal">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 focus:outline-none focus:border-gold"
                  >
                    <option value="makeup">Makeup Artist</option>
                    <option value="decor">Dekorasi Pelaminan</option>
                    <option value="dress-showcase">Koleksi Gaun</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-charcoal">Foto URL (Unsplash/Imgur)</label>
                  <input
                    type="text"
                    required
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-charcoal">Deskripsi Pendek</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 focus:outline-none focus:border-gold resize-none"
                  placeholder="Keterangan foto MUA, tema pakaian..."
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-gold hover:bg-gold-dark text-white font-bold rounded-xl uppercase tracking-wider shadow-md cursor-pointer"
                >
                  Simpan Foto Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
