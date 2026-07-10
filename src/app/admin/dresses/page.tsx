'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Trash2, Edit3, Scissors, Check, X, Upload, Loader2 } from 'lucide-react';
import { useDresses } from '@/data/db';
import { Dress, DressCategory } from '@/types';

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Max dimension 1200px (very sharp for standard web, but small file size)
        const MAX_DIM = 1200;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Compress to JPEG with quality.
        // Try quality 0.82 (very sharp)
        let quality = 0.82;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);
        
        // Check size: base64 size is approx 1.33 * actual byte size.
        // 500 KB in base64 string length is roughly 512,000 * 1.37 = 701,440 characters.
        while (dataUrl.length > 680000 && quality > 0.3) {
          quality -= 0.08;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export default function AdminDresses() {
  const [dresses, setDresses] = useDresses();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Hydration state
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Dress form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<DressCategory>('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [price, setPrice] = useState(2500000);
  const [deposit, setDeposit] = useState(1000000);
  const [sizeInput, setSizeInput] = useState('S, M, L');
  const [colorInput, setColorInput] = useState('Ivory, White');
  const [description, setDescription] = useState('');
  const [material, setMaterial] = useState('Sutera, Tulle');
  const [isPopular, setIsPopular] = useState(false);
  const [status, setStatus] = useState<'available' | 'rented' | 'maintenance'>('available');
  const [imagesList, setImagesList] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Get all unique categories currently in the inventory
  const uniqueCategories = useMemo(() => {
    const activeCats = dresses.map((d) => d.category).filter(Boolean);
    return Array.from(new Set(activeCats));
  }, [dresses]);

  // Edit Dress tracking
  const [editingDress, setEditingDress] = useState<Dress | null>(null);

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus gaun ini dari inventaris?')) {
      setDresses(dresses.filter((d) => d.id !== id));
    }
  };

  const handleOpenAddModal = () => {
    setEditingDress(null);
    setName('');
    const defaultCat = uniqueCategories[0] || 'custom';
    setCategory(defaultCat);
    setIsCustomCategory(defaultCat === 'custom');
    setCustomCategory('');
    setPrice(2500000);
    setDeposit(1000000);
    setSizeInput('S, M, L');
    setColorInput('Ivory, White');
    setMaterial('Sutera, Tulle');
    setDescription('');
    setImagesList(['https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=800&q=80']);
    setStatus('available');
    setIsPopular(false);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (dress: Dress) => {
    setEditingDress(dress);
    setName(dress.name);
    setCategory(dress.category);
    setIsCustomCategory(false);
    setCustomCategory('');
    setPrice(dress.price);
    setDeposit(dress.deposit);
    setSizeInput(dress.sizes.join(', '));
    setColorInput(dress.colors.join(', '));
    setMaterial(dress.material);
    setDescription(dress.description || '');
    setImagesList(dress.images || []);
    setStatus(dress.status);
    setIsPopular(dress.isPopular || false);
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalCategory = category === 'custom' ? customCategory.trim() : category;
    if (!finalCategory) {
      alert('Kategori harus dipilih atau diisi.');
      return;
    }

    const sizesArray = sizeInput.split(',').map((s) => s.trim()).filter(Boolean);
    const colorsArray = colorInput.split(',').map((c) => c.trim()).filter(Boolean);

    if (editingDress) {
      // Edit Mode
      const updatedDress: Dress = {
        ...editingDress,
        name,
        category: finalCategory,
        price,
        deposit,
        sizes: sizesArray,
        colors: colorsArray,
        images: imagesList.length > 0 ? imagesList : ['https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=800&q=80'],
        description,
        material,
        status,
        isPopular
      };

      setDresses(dresses.map((d) => d.id === editingDress.id ? updatedDress : d));
    } else {
      // Add Mode
      const newDress: Dress = {
        id: `dress-${Date.now()}`,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name,
        category: finalCategory,
        price,
        deposit,
        sizes: sizesArray,
        colors: colorsArray,
        images: imagesList.length > 0 ? imagesList : ['https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=800&q=80'],
        description,
        material,
        rentalDurationDays: 3,
        availableDates: [],
        rating: 5.0,
        reviewCount: 0,
        isPopular,
        status
      };

      setDresses([newDress, ...dresses]);
    }

    setShowAddModal(false);
    setEditingDress(null);
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingImage(true);

    try {
      const newImages: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;
        const compressed = await compressImage(file);
        newImages.push(compressed);
      }
      setImagesList((prev) => [...prev, ...newImages]);
    } catch (error) {
      console.error('Gagal mengompresi gambar:', error);
      alert('Gagal memuat gambar. Silakan coba berkas lain.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    handleImageUpload(e.dataTransfer.files);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageUpload(e.target.files);
  };

  const removeImage = (indexToRemove: number) => {
    setImagesList((prev) => prev.filter((_, i) => i !== indexToRemove));
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

  // Render Skeleton during SSR and initial client hydration to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="space-y-6">
        {/* Top Banner stats skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-pulse">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs h-20" />
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs h-20" />
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs h-20" />
        </div>

        {/* Header controls skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white p-4 rounded-xl border border-stone-200 shadow-xs animate-pulse h-16" />

        {/* Dresses List Table skeleton */}
        <div className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-md animate-pulse p-6 space-y-4">
          <div className="h-6 bg-stone-150 rounded w-1/4" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="h-12 bg-stone-150 rounded w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

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
          onClick={handleOpenAddModal}
          className="px-4 py-2 bg-gold hover:bg-gold-dark text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
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
                  <td className="p-4 md:p-5 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="p-1.5 rounded border border-stone-200 hover:border-gold hover:bg-gold/5 text-stone-500 hover:text-gold-dark transition-all inline-block cursor-pointer"
                      title="Edit Gaun"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded border border-stone-200 hover:border-red-500 hover:bg-red-50 text-stone-500 hover:text-red-700 transition-all inline-block cursor-pointer"
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

      {/* Add/Edit Dress Modal simulation */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-gold-light/20 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowAddModal(false);
                setEditingDress(null);
              }}
              className="absolute top-4 right-4 text-stone-400 hover:text-charcoal transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-serif font-bold text-lg text-charcoal pb-2 border-b border-gold-light/10">
              {editingDress ? 'Edit Inventaris Gaun' : 'Tambah Inventaris Gaun'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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
                    onChange={(e) => {
                      const val = e.target.value;
                      setCategory(val);
                      if (val === 'custom') {
                        setIsCustomCategory(true);
                      } else {
                        setIsCustomCategory(false);
                      }
                    }}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 focus:outline-none focus:border-gold"
                  >
                    {uniqueCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="custom">+ Tambah Kategori Baru...</option>
                  </select>
                </div>

                {isCustomCategory && (
                  <div className="col-span-2 space-y-1">
                    <label className="font-semibold text-charcoal">Nama Kategori Baru</label>
                    <input
                      type="text"
                      required
                      placeholder="Masukkan nama kategori baru..."
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 focus:outline-none focus:border-gold"
                    />
                  </div>
                )}

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

                <div className="space-y-1">
                  <label className="font-semibold text-charcoal">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 focus:outline-none focus:border-gold"
                  >
                    <option value="available">Ready</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="rented">Sewa (Rented)</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2 pt-5">
                  <input
                    type="checkbox"
                    id="isPopular"
                    checked={isPopular}
                    onChange={(e) => setIsPopular(e.target.checked)}
                    className="h-4.5 w-4.5 rounded border-stone-300 text-gold accent-gold focus:ring-gold cursor-pointer"
                  />
                  <label htmlFor="isPopular" className="font-semibold text-charcoal cursor-pointer">
                    Tampilkan di Halaman Utama
                  </label>
                </div>

                <div className="col-span-2 space-y-1.5">
                  <label className="font-semibold text-charcoal block">Foto Gaun (Maks. 500 KB per gambar)</label>
                  
                  {/* Drag & Drop Box */}
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="border-2 border-dashed border-stone-200 hover:border-gold rounded-2xl p-6 transition-colors flex flex-col items-center justify-center bg-stone-50/50 cursor-pointer relative"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <input
                      type="file"
                      id="file-upload"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    
                    {uploadingImage ? (
                      <div className="flex flex-col items-center space-y-2 py-2">
                        <Loader2 className="h-8 w-8 text-gold animate-spin" />
                        <span className="text-stone-500 text-[11px] font-medium">Mengompresi gambar...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center space-y-1 text-center py-2">
                        <Upload className="h-7 w-7 text-stone-400" />
                        <p className="font-semibold text-charcoal text-xs">Tarik & lepas berkas di sini atau klik untuk memilih</p>
                        <p className="text-[9px] text-stone-400">Mendukung JPEG, PNG, WEBP. Kompresi otomatis berkualitas tinggi.</p>
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Previews */}
                  {imagesList.length > 0 && (
                    <div className="grid grid-cols-4 gap-3 pt-2">
                      {imagesList.map((imgUrl, index) => (
                        <div key={index} className="relative aspect-[3/4] rounded-lg overflow-hidden border border-stone-150 group bg-stone-50">
                          <img
                            src={imgUrl}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeImage(index);
                            }}
                            className="absolute top-1 right-1 bg-black/60 hover:bg-red-600 text-white rounded-full p-1 transition-colors cursor-pointer"
                            title="Hapus gambar"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
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
                  className="w-full py-3 bg-gold hover:bg-gold-dark text-white font-bold rounded-xl uppercase tracking-wider shadow-md cursor-pointer"
                >
                  {editingDress ? 'Simpan Perubahan Gaun' : 'Simpan Gaun Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
