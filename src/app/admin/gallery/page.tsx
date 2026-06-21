'use client';

import { useState } from 'react';
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { MOCK_GALLERY } from '@/data/mockData';
import { Gallery } from '@/types';

export default function AdminGallery() {
  const [items, setItems] = useState<Gallery[]>(MOCK_GALLERY);

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus foto portofolio ini?')) {
      setItems(items.filter((item) => item.id !== id));
    }
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
          onClick={() => alert('Fitur upload foto galeri akan dihubungkan ke storage Supabase.')}
          className="px-4 py-2 bg-gold hover:bg-gold-dark text-white rounded-xl font-semibold uppercase tracking-wider flex items-center gap-1.5"
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
                  className="p-1.5 rounded border border-stone-200 hover:border-red-500 hover:bg-red-50 text-stone-500 hover:text-red-700 transition-all"
                  title="Hapus Foto"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
