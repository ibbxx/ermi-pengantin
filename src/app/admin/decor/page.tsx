'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plus, Trash2, X, Edit3, Upload, Loader2 } from 'lucide-react';
import { useDecor } from '@/data/db';
import { DecorPackage } from '@/types';
import ImagePlaceholder from '@/components/ui/ImagePlaceholder';
import { uploadImage, deleteImage } from '@/lib/storage';

export default function AdminDecor() {
  const [decorations, setDecorations] = useDecor();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDecor, setEditingDecor] = useState<DecorPackage | null>(null);

  const [decorType, setDecorType] = useState<DecorPackage['decorType']>('package');
  const [name, setName] = useState('');
  const [theme, setTheme] = useState('');
  const [price, setPrice] = useState(0);
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
    if (confirm('Apakah Anda yakin ingin menghapus dekorasi ini dari katalog?')) {
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
    setDecorType('package');
    setName('');
    setTheme('');
    setPrice(0);
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
    setDecorType(decor.decorType);
    setName(decor.name);
    setTheme(decor.theme);
    setPrice(decor.price);
    setDescription(decor.description);
    setFeaturesInput(decor.features.join('\n'));
    setImagesList(decor.images || []);
    setShowAddModal(true);
  };

  const handleImageUpload = async (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return;
    setUploadingImage(true);
    try {
      const url = await uploadImage(file, 'decor');
      setImagesList([url]);
    } catch (error: unknown) {
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
      decorType,
      name,
      theme,
      price,
      description,
      features: featuresInput.split('\n').map((detail) => detail.trim()).filter(Boolean),
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
          <h2 className="font-serif font-bold text-base text-charcoal">Katalog Dekorasi</h2>
          <p className="text-[10px] text-stone-400">Kelola paket lengkap dan item dekorasi satuan yang tampil di katalog.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2 bg-gold hover:bg-gold-dark text-white rounded-xl font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Tambah Dekorasi
        </button>
      </div>

      {/* Grid List Decorations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {decorations.map((pkg) => (
          <div key={pkg.id} className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-stone-150">
                {pkg.images[0] ? (
                  <Image src={pkg.images[0]} alt={pkg.name} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
                ) : (
                  <ImagePlaceholder label="Foto dekor kosong" />
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-gold/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-gold-dark">
                    {pkg.decorType === 'package' ? 'Paket Dekorasi' : 'Item Dekorasi'}
                  </span>
                  <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-stone-500">
                    {pkg.theme}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <h3 className="font-serif font-bold text-sm text-charcoal leading-tight">{pkg.name}</h3>
                  <span className="text-right font-bold text-gold-dark">Mulai {formatPrice(pkg.price)}</span>
                </div>
              </div>

              <p className="text-[11px] text-stone-500 leading-normal">{pkg.description}</p>
              
              <div className="space-y-1 pt-1">
                <span className="font-bold text-stone-400 block uppercase text-[9px]">Detail:</span>
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
                title="Edit Dekorasi"
              >
                <Edit3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(pkg.id)}
                className="p-1.5 rounded border border-stone-200 hover:border-red-500 hover:bg-red-50 text-stone-500 hover:text-red-700 transition-all cursor-pointer"
                title="Hapus Dekorasi"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {decorations.length === 0 && (
        <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-10 text-center">
          <p className="font-serif text-lg font-bold text-charcoal">Katalog dekorasi masih kosong</p>
          <p className="mt-1 text-[11px] text-stone-500">Tambahkan paket atau item dekorasi pertama dari tombol di atas.</p>
        </div>
      )}

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
              {editingDecor ? 'Edit Dekorasi' : 'Tambah Dekorasi'}
            </h3>

            <form onSubmit={handleSubmitDecor} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-charcoal">Tipe Dekorasi</label>
                <select
                  value={decorType}
                  onChange={(e) => setDecorType(e.target.value as DecorPackage['decorType'])}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 focus:outline-none focus:border-gold"
                >
                  <option value="package">Paket Dekorasi</option>
                  <option value="item">Item Dekorasi</option>
                </select>
                <p className="text-[9px] leading-relaxed text-stone-400">
                  Paket dapat dibooking langsung. Item dipesan melalui WhatsApp.
                </p>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-charcoal">Nama Dekorasi</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 focus:outline-none focus:border-gold"
                  placeholder="Misal: Paket Rustic Romance atau Vas Bunga Meja"
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
                    min={1}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-charcoal">Daftar Detail (Satu detail per baris)</label>
                <textarea
                  rows={5}
                  required
                  value={featuresInput}
                  onChange={(e) => setFeaturesInput(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 focus:outline-none focus:border-gold resize-none"
                  placeholder={'Ukuran: 40 × 60 cm\nMaterial: Kayu dan bunga artificial\nWarna: Ivory\nArea pemasangan: Meja penerima tamu'}
                />
              </div>

              <div className="space-y-2">
                <label className="font-semibold text-charcoal">Foto Utama Dekorasi</label>
                <div className="h-36 overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
                  {imagesList[0] ? (
                    <div className="relative h-full">
                      <Image src={imagesList[0]} alt="Preview Dekorasi" fill sizes="448px" className="object-cover" />
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
                  {editingDecor ? 'Simpan Perubahan' : 'Simpan Dekorasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
