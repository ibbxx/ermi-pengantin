'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { Save, Settings, Info, Upload, X, Loader2 } from 'lucide-react';
import { useSettings } from '@/data/db';
import {
  deleteImage,
  uploadHomepageThumbnail,
  uploadImage,
  type HomepageThumbnailUploadResult,
} from '@/lib/storage';
import ImagePlaceholder from '@/components/ui/ImagePlaceholder';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { SystemSettings } from '@/types';

type SettingsImageField = 'heroImage' | 'serviceDressImage' | 'serviceMakeupImage' | 'serviceDecorImage' | 'qrisImage';
const SETTINGS_IMAGE_FIELDS: SettingsImageField[] = [
  'heroImage',
  'serviceDressImage',
  'serviceMakeupImage',
  'serviceDecorImage',
  'qrisImage',
];

interface ServiceThumbnailCardProps {
  id: string;
  title: string;
  image: string;
  isDirty: boolean;
  isUploading: boolean;
  uploadResult?: HomepageThumbnailUploadResult;
  onUpload: (file: File) => Promise<void>;
  onRemove: () => void;
}

function ServiceThumbnailCard({
  id,
  title,
  image,
  isDirty,
  isUploading,
  uploadResult,
  onUpload,
  onRemove,
}: ServiceThumbnailCardProps) {
  const formatBytes = (bytes: number) => {
    if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} MB`;
    return `${Math.round(bytes / 1_000).toLocaleString('id-ID')} KB`;
  };
  const uploadSummary = uploadResult
    ? uploadResult.compressed
      ? `${formatBytes(uploadResult.originalBytes)} → ${formatBytes(uploadResult.uploadedBytes)}`
      : `${formatBytes(uploadResult.uploadedBytes)} · file asli, tanpa kompresi`
    : null;
  const status = isUploading
    ? 'Mengoptimalkan dan mengunggah...'
    : uploadSummary
      ? uploadSummary
    : isDirty
      ? image ? 'Perubahan belum disimpan' : 'Gambar akan dihapus saat disimpan'
      : image ? 'Tersimpan' : 'Belum diatur';

  return (
    <Card size="sm" className="gap-3 bg-white py-3 ring-stone-200">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="text-[10px]">Rasio tampilan 4:3 · gambar akan dipotong otomatis.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-stone-200 bg-stone-100">
          {image ? (
            <Image src={image} alt={`Preview thumbnail ${title}`} fill sizes="(min-width: 768px) 220px, 100vw" className="object-cover" />
          ) : (
            <ImagePlaceholder label="Belum ada thumbnail" />
          )}
          {isUploading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/75" aria-live="polite">
              <Loader2 className="size-5 animate-spin text-gold-dark" />
            </div>
          ) : null}
        </div>

        <p className="min-h-4 text-[10px] text-stone-500" aria-live="polite">{status}</p>

        <div className="flex flex-wrap gap-2">
          <input
            id={id}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={isUploading}
            onChange={async (event) => {
              const file = event.target.files?.[0];
              event.target.value = '';
              if (file) await onUpload(file);
            }}
            className="sr-only"
          />
          <Button asChild variant="outline" size="sm" className="cursor-pointer">
            <label htmlFor={id} aria-disabled={isUploading}>
              {isUploading ? <Loader2 className="animate-spin" /> : <Upload />}
              {image ? 'Ganti' : 'Unggah'}
            </label>
          </Button>
          <Button type="button" variant="destructive" size="sm" disabled={!image || isUploading} onClick={onRemove}>
            <X /> Hapus
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface AdminSettingsFormProps {
  settings: SystemSettings;
  saveSettings: (settings: SystemSettings) => Promise<void>;
}

function AdminSettingsForm({ settings, saveSettings }: AdminSettingsFormProps) {

  // Local state for form fields to handle user input before saving
  const [shopName, setShopName] = useState(settings.shopName);
  const [whatsappAdmin, setWhatsappAdmin] = useState(settings.whatsappAdmin);
  const [emailAdmin, setEmailAdmin] = useState(settings.emailAdmin);
  const [minDpPercent, setMinDpPercent] = useState(settings.minDpPercent);
  const [transportBase, setTransportBase] = useState(settings.transportBase);
  const [address, setAddress] = useState(settings.address);
  const [heroImage, setHeroImage] = useState(settings.heroImage || '');
  const [serviceDressImage, setServiceDressImage] = useState(settings.serviceDressImage || '');
  const [serviceMakeupImage, setServiceMakeupImage] = useState(settings.serviceMakeupImage || '');
  const [serviceDecorImage, setServiceDecorImage] = useState(settings.serviceDecorImage || '');
  const [tfEnabled, setTfEnabled] = useState(settings.tfEnabled || false);
  const [tfBankName, setTfBankName] = useState(settings.tfBankName || '');
  const [tfAccountNumber, setTfAccountNumber] = useState(settings.tfAccountNumber || '');
  const [tfAccountHolder, setTfAccountHolder] = useState(settings.tfAccountHolder || '');
  const [qrisEnabled, setQrisEnabled] = useState(settings.qrisEnabled || false);
  const [qrisImage, setQrisImage] = useState(settings.qrisImage || '');
  const [uploadingImages, setUploadingImages] = useState<Partial<Record<SettingsImageField, boolean>>>({});
  const [thumbnailUploadResults, setThumbnailUploadResults] = useState<Partial<Record<SettingsImageField, HomepageThumbnailUploadResult>>>({});
  const [isSaving, setIsSaving] = useState(false);
  const pendingUploads = useRef(new Set<string>());

  useEffect(() => {
    const uploadedUrls = pendingUploads.current;
    return () => {
      uploadedUrls.forEach((url) => void deleteImage(url));
    };
  }, []);

  const getImageValue = (field: SettingsImageField) => {
    switch (field) {
      case 'heroImage': return heroImage;
      case 'serviceDressImage': return serviceDressImage;
      case 'serviceMakeupImage': return serviceMakeupImage;
      case 'serviceDecorImage': return serviceDecorImage;
      case 'qrisImage': return qrisImage;
    }
  };

  const updateImageValue = (field: SettingsImageField, value: string) => {
    switch (field) {
      case 'heroImage': setHeroImage(value); break;
      case 'serviceDressImage': setServiceDressImage(value); break;
      case 'serviceMakeupImage': setServiceMakeupImage(value); break;
      case 'serviceDecorImage': setServiceDecorImage(value); break;
      case 'qrisImage': setQrisImage(value); break;
    }
  };

  const handleImageUpload = async (field: SettingsImageField, folder: string, file: File) => {
    setUploadingImages((current) => ({ ...current, [field]: true }));
    try {
      const url = await uploadImage(file, folder);
      const replacedUrl = getImageValue(field);
      if (pendingUploads.current.delete(replacedUrl)) {
        await deleteImage(replacedUrl);
      }
      pendingUploads.current.add(url);
      updateImageValue(field, url);
    } catch (error: unknown) {
      console.error('Failed to upload image:', error);
      alert(error instanceof Error ? error.message : 'Gagal mengunggah gambar.');
    } finally {
      setUploadingImages((current) => ({ ...current, [field]: false }));
    }
  };

  const handleImageRemove = (field: SettingsImageField) => {
    const currentUrl = getImageValue(field);
    if (pendingUploads.current.delete(currentUrl)) {
      void deleteImage(currentUrl);
    }
    updateImageValue(field, '');
    setThumbnailUploadResults((current) => ({ ...current, [field]: undefined }));
  };

  const handleThumbnailUpload = async (field: SettingsImageField, folder: string, file: File) => {
    setUploadingImages((current) => ({ ...current, [field]: true }));
    setThumbnailUploadResults((current) => ({ ...current, [field]: undefined }));
    try {
      const result = await uploadHomepageThumbnail(file, folder);
      const replacedUrl = getImageValue(field);
      if (pendingUploads.current.delete(replacedUrl)) {
        await deleteImage(replacedUrl);
      }
      pendingUploads.current.add(result.url);
      updateImageValue(field, result.url);
      setThumbnailUploadResults((current) => ({ ...current, [field]: result }));
    } catch (error: unknown) {
      console.error('Failed to upload homepage thumbnail:', error);
      alert(error instanceof Error ? error.message : 'Gagal mengunggah thumbnail.');
    } finally {
      setUploadingImages((current) => ({ ...current, [field]: false }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const nextSettings = {
        shopName,
        whatsappAdmin,
        emailAdmin,
        minDpPercent,
        transportBase,
        address,
        heroImage,
        serviceDressImage,
        serviceMakeupImage,
        serviceDecorImage,
        tfEnabled,
        tfBankName,
        tfAccountNumber,
        tfAccountHolder,
        qrisEnabled,
        qrisImage,
      };

      await saveSettings(nextSettings);

      const retainedUrls = new Set([
        nextSettings.heroImage,
        nextSettings.serviceDressImage,
        nextSettings.serviceMakeupImage,
        nextSettings.serviceDecorImage,
        nextSettings.qrisImage,
      ]);
      const replacedUrls = new Set(SETTINGS_IMAGE_FIELDS
        .map((field) => settings[field])
        .filter((url) => url && !retainedUrls.has(url)));
      await Promise.all(Array.from(replacedUrls).map(deleteImage));
      pendingUploads.current.clear();
      alert('Pengaturan butik berhasil disimpan ke Supabase.');
    } catch (error: unknown) {
      console.error('Failed to save settings:', error);
      await Promise.all(Array.from(pendingUploads.current).map(deleteImage));
      pendingUploads.current.clear();
      setHeroImage(settings.heroImage || '');
      setServiceDressImage(settings.serviceDressImage || '');
      setServiceMakeupImage(settings.serviceMakeupImage || '');
      setServiceDecorImage(settings.serviceDecorImage || '');
      setQrisImage(settings.qrisImage || '');
      setThumbnailUploadResults({});
      const message = error instanceof Error
        ? error.message
        : 'Gagal menyimpan pengaturan ke Supabase.';
      alert(message);
    } finally {
      setIsSaving(false);
    }
  };

  const isUploading = Object.values(uploadingImages).some(Boolean);

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
                    <Image
                      src={heroImage}
                      alt="Hero Preview"
                      fill
                      sizes="(min-width: 768px) 220px, 100vw"
                      className="object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon-xs"
                      aria-label="Hapus gambar hero"
                      disabled={uploadingImages.heroImage}
                      onClick={() => handleImageRemove('heroImage')}
                      className="absolute right-2 top-2"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </>
                ) : (
                  <ImagePlaceholder />
                )}
              </div>

              {/* Upload Input */}
              <div className="md:col-span-2">
                <label className="border-2 border-dashed border-stone-200 hover:border-gold rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all hover:bg-stone-50/50">
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingImages.heroImage}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      e.target.value = '';
                      if (!file) return;
                      await handleImageUpload('heroImage', 'settings', file);
                    }}
                    className="hidden"
                  />
                  {uploadingImages.heroImage ? (
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

          <section className="sm:col-span-2 space-y-3 border-t border-stone-150 pt-4 mt-2" aria-labelledby="service-thumbnail-heading">
            <div>
              <h3 id="service-thumbnail-heading" className="font-semibold text-charcoal">Thumbnail Layanan Beranda</h3>
              <p className="mt-1 text-[10px] leading-normal text-stone-400">
                Atur gambar khusus untuk tiga kartu layanan. Gambar baru tampil di beranda setelah tombol Simpan Perubahan ditekan.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <ServiceThumbnailCard
                id="service-dress-image"
                title="Busana Pengantin"
                image={serviceDressImage}
                isDirty={serviceDressImage !== settings.serviceDressImage}
                isUploading={Boolean(uploadingImages.serviceDressImage)}
                uploadResult={thumbnailUploadResults.serviceDressImage}
                onUpload={(file) => handleThumbnailUpload('serviceDressImage', 'settings/service-thumbnails/dresses', file)}
                onRemove={() => handleImageRemove('serviceDressImage')}
              />
              <ServiceThumbnailCard
                id="service-makeup-image"
                title="Makeup"
                image={serviceMakeupImage}
                isDirty={serviceMakeupImage !== settings.serviceMakeupImage}
                isUploading={Boolean(uploadingImages.serviceMakeupImage)}
                uploadResult={thumbnailUploadResults.serviceMakeupImage}
                onUpload={(file) => handleThumbnailUpload('serviceMakeupImage', 'settings/service-thumbnails/makeup', file)}
                onRemove={() => handleImageRemove('serviceMakeupImage')}
              />
              <ServiceThumbnailCard
                id="service-decor-image"
                title="Dekorasi"
                image={serviceDecorImage}
                isDirty={serviceDecorImage !== settings.serviceDecorImage}
                isUploading={Boolean(uploadingImages.serviceDecorImage)}
                uploadResult={thumbnailUploadResults.serviceDecorImage}
                onUpload={(file) => handleThumbnailUpload('serviceDecorImage', 'settings/service-thumbnails/decor', file)}
                onRemove={() => handleImageRemove('serviceDecorImage')}
              />
            </div>
          </section>

          <section className="sm:col-span-2 space-y-4 border-t border-stone-150 pt-4 mt-2">
            <div>
              <h3 className="font-semibold text-charcoal">Konfigurasi Metode Pembayaran</h3>
              <p className="mt-1 text-[10px] leading-normal text-stone-400">
                Aktifkan dan atur opsi Transfer Bank dan QRIS yang akan ditampilkan kepada pelanggan di halaman booking.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Transfer Bank Card */}
              <div className="p-5 bg-stone-50/50 rounded-2xl border border-stone-200 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-serif font-bold text-charcoal text-sm">Opsi Transfer Bank</h4>
                    <p className="text-[9px] text-stone-400">Tampilkan rekening bank untuk transfer manual</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tfEnabled}
                      onChange={(e) => setTfEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="relative w-9 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold"></div>
                  </label>
                </div>

                {tfEnabled && (
                  <div className="space-y-3 animate-fade-in">
                    <div className="space-y-1">
                      <label className="font-semibold text-charcoal block text-[10px] uppercase">Nama Bank</label>
                      <input
                        type="text"
                        required={tfEnabled}
                        placeholder="e.g. Bank BCA, Bank Mandiri"
                        value={tfBankName}
                        onChange={(e) => setTfBankName(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-xl py-1.5 px-3 focus:outline-none focus:border-gold text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-charcoal block text-[10px] uppercase">Nomor Rekening</label>
                      <input
                        type="text"
                        required={tfEnabled}
                        placeholder="Masukkan nomor rekening..."
                        value={tfAccountNumber}
                        onChange={(e) => setTfAccountNumber(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-xl py-1.5 px-3 focus:outline-none focus:border-gold text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-charcoal block text-[10px] uppercase">Pemilik Rekening (Atas Nama)</label>
                      <input
                        type="text"
                        required={tfEnabled}
                        placeholder="e.g. Ermi Pengantin"
                        value={tfAccountHolder}
                        onChange={(e) => setTfAccountHolder(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-xl py-1.5 px-3 focus:outline-none focus:border-gold text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* QRIS Card */}
              <div className="p-5 bg-stone-50/50 rounded-2xl border border-stone-200 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-serif font-bold text-charcoal text-sm">Opsi QRIS</h4>
                    <p className="text-[9px] text-stone-400">Tampilkan scan code QRIS untuk e-wallet</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={qrisEnabled}
                      onChange={(e) => setQrisEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="relative w-9 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold"></div>
                  </label>
                </div>

                {qrisEnabled && (
                  <div className="space-y-3 animate-fade-in">
                    <label className="font-semibold text-charcoal block text-[10px] uppercase">Gambar QRIS Code</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                      {/* QRIS Preview */}
                      <div className="relative h-24 bg-white rounded-xl overflow-hidden border border-stone-200 flex items-center justify-center">
                        {qrisImage ? (
                          <>
                            <Image
                              src={qrisImage}
                              alt="QRIS Preview"
                              fill
                              sizes="100px"
                              className="object-contain p-1"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon-xs"
                              aria-label="Hapus gambar QRIS"
                              disabled={uploadingImages.qrisImage}
                              onClick={() => handleImageRemove('qrisImage')}
                              className="absolute right-1 top-1"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </>
                        ) : (
                          <ImagePlaceholder label="No QRIS" />
                        )}
                      </div>

                      {/* QRIS Upload Input */}
                      <div className="sm:col-span-2">
                        <label className="border border-dashed border-stone-200 hover:border-gold rounded-xl p-3 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all hover:bg-stone-50 bg-white">
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploadingImages.qrisImage}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              e.target.value = '';
                              if (!file) return;
                              await handleImageUpload('qrisImage', 'settings/payment', file);
                            }}
                            className="hidden"
                          />
                          {uploadingImages.qrisImage ? (
                            <>
                              <Loader2 className="h-4 w-4 text-gold animate-spin" />
                              <span className="text-[9px] text-stone-500">Mengunggah...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 text-stone-400" />
                              <span className="text-[9px] font-semibold text-charcoal">Pilih File QRIS</span>
                              <span className="text-[7px] text-stone-400">JPG/PNG/WEBP</span>
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
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
          <Button
            type="submit"
            disabled={isSaving || isUploading}
            className="h-10 px-6 bg-gold hover:bg-gold-dark text-white font-bold uppercase tracking-wider shadow-md cursor-pointer"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>{isSaving ? 'Menyimpan...' : isUploading ? 'Menunggu unggahan...' : 'Simpan Perubahan'}</span>
          </Button>
        </div>

      </form>
    </div>
  );
}

export default function AdminSettings() {
  const [settings, saveSettings, isLoaded] = useSettings();

  if (!isLoaded) {
    return (
      <Card className="max-w-2xl bg-white ring-stone-200">
        <CardContent className="flex items-center gap-2 py-8 text-xs text-stone-500" aria-live="polite">
          <Loader2 className="size-4 animate-spin text-gold-dark" /> Memuat pengaturan...
        </CardContent>
      </Card>
    );
  }

  return <AdminSettingsForm settings={settings} saveSettings={saveSettings} />;
}
