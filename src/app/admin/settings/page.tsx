'use client';

import { useState, useEffect } from 'react';
import { Save, Settings, Info, Upload, X, Loader2 } from 'lucide-react';
import { useSettings } from '@/data/db';
import { uploadImage } from '@/lib/storage';

export default function AdminSettings() {
  const [settings, setSettings] = useSettings();

  // Local state for form fields to handle user input before saving
  const [shopName, setShopName] = useState(settings.shopName);
  const [whatsappAdmin, setWhatsappAdmin] = useState(settings.whatsappAdmin);
  const [emailAdmin, setEmailAdmin] = useState(settings.emailAdmin);
  const [minDpPercent, setMinDpPercent] = useState(settings.minDpPercent);
  const [transportBase, setTransportBase] = useState(settings.transportBase);
  const [address, setAddress] = useState(settings.address);
  const [heroImage, setHeroImage] = useState(settings.heroImage || '');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Sync local fields when settings is loaded/changed
  useEffect(() => {
    setShopName(settings.shopName);
    setWhatsappAdmin(settings.whatsappAdmin);
    setEmailAdmin(settings.emailAdmin);
    setMinDpPercent(settings.minDpPercent);
    setTransportBase(settings.transportBase);
    setAddress(settings.address);
    setHeroImage(settings.heroImage || '');
  }, [settings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSettings({
      shopName,
      whatsappAdmin,
      emailAdmin,
      minDpPercent,
      transportBase,
      address,
      heroImage
    });
    alert('Pengaturan butik telah berhasil diperbarui secara lokal!');
  };

  return (
    <div className="max-w-2xl bg-white p-6 md:p-8 rounded-3xl border border-stone-200 shadow-md space-y-6 text-xs animate-fade-in">
      
      <div>
        <h2 className="font-serif font-bold text-base text-charcoal flex items-center gap-1.5 border-b border-stone-150 pb-3">
          <Settings className="h-5 w-5 text-gold-dark" /> Pengaturan Sistem & Metadata Butik
        </h2>
        <p className="text-[10px] text-stone-400 mt-1">Konfigurasi info kontak dasar butik, jam operasional, kalkulasi minimal uang muka (DP), dan alamat pengantaran.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        
        {/* Row 1: Business name & info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="font-semibold text-charcoal block">Nama Bisnis / Toko</label>
            <input
              type="text"
              required
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 focus:outline-none focus:border-gold"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-charcoal block">Nomor WhatsApp Admin (Untuk Tombol WA)</label>
            <input
              type="text"
              required
              value={whatsappAdmin}
              onChange={(e) => setWhatsappAdmin(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 focus:outline-none focus:border-gold"
              placeholder="Contoh: 6281234567890 (Gunakan kode negara)"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-charcoal block">Email Bisnis</label>
            <input
              type="email"
              required
              value={emailAdmin}
              onChange={(e) => setEmailAdmin(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 focus:outline-none focus:border-gold"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-charcoal block">Persentase DP Minimum (%)</label>
            <input
              type="number"
              required
              value={minDpPercent}
              onChange={(e) => setMinDpPercent(Number(e.target.value))}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 focus:outline-none focus:border-gold"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="font-semibold text-charcoal block">Alamat Kantor / Galeri Butik</label>
            <textarea
              rows={2}
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 focus:outline-none focus:border-gold resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-charcoal block">Tarif Dasar Transportasi Alat (Rp)</label>
            <input
              type="number"
              required
              value={transportBase}
              onChange={(e) => setTransportBase(Number(e.target.value))}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 focus:outline-none focus:border-gold"
            />
          </div>

          {/* Hero Image Section Upload */}
          <div className="space-y-1 sm:col-span-2 border-t border-stone-150 pt-4 mt-2">
            <label className="font-semibold text-charcoal block">Gambar Latar Hero Section Utama (Beranda)</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mt-1.5">
              
              {/* Image Preview */}
              <div className="md:col-span-1 relative h-32 bg-stone-100 rounded-xl overflow-hidden border border-stone-200 flex items-center justify-center">
                {heroImage ? (
                  <>
                    <img
                      src={heroImage}
                      alt="Hero Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setHeroImage('')}
                      className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : (
                  <span className="text-[10px] text-stone-400">Belum ada gambar</span>
                )}
              </div>

              {/* Upload Input */}
              <div className="md:col-span-2">
                <label className="border-2 border-dashed border-stone-200 hover:border-gold rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all hover:bg-stone-50/50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUploadingImage(true);
                      try {
                        const url = await uploadImage(file, 'settings');
                        setHeroImage(url);
                      } catch (error) {
                        console.error('Failed to upload image:', error);
                        alert('Gagal mengunggah gambar.');
                      } finally {
                        setUploadingImage(false);
                      }
                    }}
                    className="hidden"
                  />
                  {uploadingImage ? (
                    <>
                      <Loader2 className="h-5 w-5 text-gold animate-spin" />
                      <span className="text-[10px] text-stone-500 font-medium">Sedang mengunggah...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5 text-stone-400" />
                      <span className="text-[10px] font-semibold text-charcoal">Unggah Foto Hero Baru</span>
                      <span className="text-[8px] text-stone-400">Format JPEG/PNG, rasio 16:9 direkomendasikan</span>
                    </>
                  )}
                </label>
              </div>

            </div>
          </div>
        </div>

        {/* Security / Backup stamp */}
        <div className="flex gap-2 items-start bg-ivory p-4 rounded-2xl border border-gold-light/20 text-[10px] text-stone-500 leading-normal">
          <Info className="h-4.5 w-4.5 text-gold-dark flex-shrink-0 mt-0.5" />
          <p>
            Perubahan konfigurasi di halaman ini secara langsung memengaruhi logika kalkulasi pada halaman form booking serta kontak nomor tujuan tombol konsultasi melayang secara dinamis.
          </p>
        </div>

        {/* Save Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-gold hover:bg-gold-dark text-white font-bold rounded-xl uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-md cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>Simpan Perubahan</span>
          </button>
        </div>

      </form>
    </div>
  );
}
