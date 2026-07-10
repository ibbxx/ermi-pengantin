'use client';

import { useState } from 'react';
import { Plus, Trash2, X, Edit3, Upload, Loader2 } from 'lucide-react';
import { useDecor } from '@/data/db';
import { DecorPackage } from '@/types';
import ImagePlaceholder from '@/components/ui/ImagePlaceholder';
import { uploadImage, deleteImage } from '@/lib/storage';

export default function AdminDecor() {
  const [decorations, setDecorations] = useDecor();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDecor, setEditingDecor] = useState<DecorPackage | null>(null);

  const [name, setName] = useState('');
  const [theme, setTheme] = useState('');
  const [price, setPrice] = useState(0);
  const [venueSize, setVenueSize] = useState('');
  const [description, setDescription] = useState('');
  const [featuresInput, setFeaturesInput] = useState('');
  const [imagesList, setImagesList] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus tema dekorasi ini dari katalog?')) {
      const decor = decorations.find((d) => d.id === id);
      if (decor) {
        for (const img of decor.images) {
          await deleteImage(img);
        }
      }
      setDecorations(decorations.filter((d) => d.id !== id));
    }
  };

  const resetForm = () => {
    setEditingDecor(null);
    setName('');
    setTheme('');
    setPrice(0);
    setVenueSize('');
    setDescription('');
    setFeaturesInput('');
    setImagesList([]);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleOpenEditModal = (decor: DecorPackage) => {
    setEditingDecor(decor);
    setName(decor.name);
    setTheme(decor.theme);
    setPrice(decor.price);
    setVenueSize(decor.venueSize);
    setDescription(decor.description);
    setFeaturesInput(decor.features.join(', '));
    setImagesList(decor.images || []);
    setShowAddModal(true);
  };

  const handleImageUpload = async (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return;
    setUploadingImage(true);
    try {
      const url = await uploadImage(file, 'decor');
      setImagesList([url]);
    } catch (error: any) {
      console.error('Gagal mengunggah gambar:', error);
      alert(error instanceof Error ? error.message : 'Gagal mengunggah gambar. Silakan coba lagi.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmitDecor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const decorPayload: DecorPackage = {
      id: editingDecor?.id || `decor-${Date.now()}`,
      name,
      theme,
      price,
      description,
      venueSize,
      features: featuresInput.split(',').map((f) => f.trim()).filter(Boolean),
      images: imagesList
    };

    if (editingDecor) {
      setDecorations(decorations.map((decor) => (decor.id === editingDecor.id ? decorPayload : decor)));
    } else {
      setDecorations([...decorations, decorPayload]);
    }

    resetForm();
    setShowAddModal(false);
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
          onClick={handleOpenAddModal}
          className="px-4 py-2 bg-gold hover:bg-gold-dark text-white rounded-xl font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
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
                {pkg.images[0] ? (
                  <img src={pkg.images[0]} alt={pkg.name} className="w-full h-full object-cover" />
                ) : (
                  <ImagePlaceholder label="Foto dekor kosong" />
                )}
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-serif font-bold text-sm text-charcoal leading-tight">{pkg.name}</h3>
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
                onClick={() => handleOpenEditModal(pkg)}
                className="p-1.5 rounded border border-stone-200 hover:border-gold hover:bg-gold/5 text-stone-500 hover:text-gold-dark transition-all cursor-pointer"
                title="Edit Tema"
              >
                <Edit3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(pkg.id)}
                className="p-1.5 rounded border border-stone-200 hover:border-red-500 hover:bg-red-50 text-stone-500 hover:text-red-700 transition-all cursor-pointer"
                title="Hapus Tema"
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
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-gold-light/20 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
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
              {editingDecor ? 'Edit Tema Dekorasi' : 'Tambah Tema Dekorasi'}
            </h3>

            <form onSubmit={handleSubmitDecor} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-charcoal">Nama Tema Dekorasi</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 focus:outline-none focus:border-gold"
                  placeholder="Misal: Rustic Forest Romance"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-charcoal">Tema / Gaya</label>
                  <input
                    type="text"
                    required
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 focus:outline-none focus:border-gold"
                    placeholder="Misal: Modern, Rustic, Adat Bugis"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-charcoal">Harga Mulai Dari (Rp)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-charcoal">Kapasitas / Ukuran Venue</label>
                <input
                  type="text"
                  required
                  value={venueSize}
                  onChange={(e) => setVenueSize(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 focus:outline-none focus:border-gold"
                  placeholder="Misal: Indoor Ballroom (300-800 tamu)"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-charcoal">Fasilitas / Detail Dekorasi (Pisahkan dengan koma)</label>
                <textarea
                  rows={2}
                  required
                  value={featuresInput}
                  onChange={(e) => setFeaturesInput(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 focus:outline-none focus:border-gold resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="font-semibold text-charcoal">Foto Tema Dekorasi</label>
                <div className="h-36 overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
                  {imagesList[0] ? (
                    <div className="relative h-full">
                      <img src={imagesList[0]} alt="Preview Dekorasi" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImagesList([])}
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
                <label className="font-semibold text-charcoal">Deskripsi</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 focus:outline-none focus:border-gold resize-none"
                  placeholder="Detail penataan panggung..."
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-gold hover:bg-gold-dark text-white font-bold rounded-xl uppercase tracking-wider shadow-md cursor-pointer"
                >
                  {editingDecor ? 'Simpan Perubahan Tema' : 'Simpan Tema Dekorasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
