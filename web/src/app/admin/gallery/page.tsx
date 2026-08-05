'use client';

import { useState } from 'react';
import { Plus, Trash2, X, Edit3, Upload, Loader2 } from 'lucide-react';
import { useGallery } from '@/data/db';
import { Gallery } from '@/types';
import ImagePlaceholder from '@/components/ui/ImagePlaceholder';
import { uploadImage, deleteImage } from '@/lib/storage';

export default function AdminGallery() {
  const [items, setItems] = useGallery();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Gallery | null>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'makeup' | 'decor' | 'dress-showcase'>('makeup');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus foto portofolio ini?')) {
      const item = items.find((i) => i.id === id);
      if (item) await deleteImage(item.image);
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setTitle('');
    setCategory('makeup');
    setImage('');
    setDescription('');
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleOpenEditModal = (item: Gallery) => {
    setEditingItem(item);
    setTitle(item.title);
    setCategory(item.category);
    setImage(item.image);
    setDescription(item.description || '');
    setShowAddModal(true);
  };

  const handleImageUpload = async (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return;
    setUploadingImage(true);
    try {
      const url = await uploadImage(file, 'gallery');
      setImage(url);
    } catch (error: any) {
      console.error('Gagal mengunggah gambar:', error);
      alert(error instanceof Error ? error.message : 'Gagal mengunggah gambar. Silakan coba lagi.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmitItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const itemPayload: Gallery = {
      id: editingItem?.id || `gal-${Date.now()}`,
      title,
      category,
      image,
      description: description || undefined
    };

    if (editingItem) {
      setItems(items.map((item) => (item.id === editingItem.id ? itemPayload : item)));
    } else {
      setItems([...items, itemPayload]);
    }

    resetForm();
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
          onClick={handleOpenAddModal}
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
              {item.image ? (
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <ImagePlaceholder label="Foto kosong" />
              )}
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
                  onClick={() => handleOpenEditModal(item)}
                  className="p-1.5 rounded border border-stone-200 hover:border-gold hover:bg-gold/5 text-stone-500 hover:text-gold-dark transition-all cursor-pointer mr-2"
                  title="Edit Foto"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
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
              onClick={() => {
                resetForm();
                setShowAddModal(false);
              }}
              className="absolute top-4 right-4 text-stone-400 hover:text-charcoal transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-serif font-bold text-lg text-charcoal pb-2 border-b border-gold-light/10">
              {editingItem ? 'Edit Foto Portofolio' : 'Unggah Foto Baru'}
            </h3>

            <form onSubmit={handleSubmitItem} className="space-y-4 text-xs">
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
                    onChange={(e) => setCategory(e.target.value as Gallery['category'])}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 focus:outline-none focus:border-gold"
                  >
                    <option value="makeup">Makeup Artist</option>
                    <option value="decor">Dekorasi Pelaminan</option>
                    <option value="dress-showcase">Koleksi Gaun</option>
                  </select>
                </div>

              </div>

              <div className="space-y-2">
                <label className="font-semibold text-charcoal">Foto Portofolio</label>
                <div className="aspect-video overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
                  {image ? (
                    <div className="relative h-full">
                      <img src={image} alt="Preview Portofolio" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImage('')}
                        className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-red-600"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <ImagePlaceholder label="Belum ada foto" />
                  )}
                </div>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-stone-200 bg-stone-50 py-3 text-[10px] font-semibold text-charcoal hover:border-gold">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files?.[0])}
                    className="hidden"
                  />
                  {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin text-gold" /> : <Upload className="h-4 w-4 text-stone-400" />}
                  <span>{uploadingImage ? 'Mengompresi gambar...' : 'Unggah / Ganti Foto'}</span>
                </label>
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
                  {editingItem ? 'Simpan Perubahan Foto' : 'Simpan Foto Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
