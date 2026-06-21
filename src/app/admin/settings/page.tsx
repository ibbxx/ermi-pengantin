'use client';

import { useState } from 'react';
import { Save, Shield, Settings, Info } from 'lucide-react';

export default function AdminSettings() {
  const [shopName, setShopName] = useState('Elika Wedding Organizer & Atelier');
  const [whatsappAdmin, setWhatsappAdmin] = useState('081234567890');
  const [emailAdmin, setEmailAdmin] = useState('info@elikawedding.com');
  const [minDpPercent, setMinDpPercent] = useState(30);
  const [transportBase, setTransportBase] = useState(150000);
  const [address, setAddress] = useState('Jl. Kemang Raya No. 12, Mampang Prapatan, Jakarta Selatan, 12730');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Pengaturan butik telah berhasil diperbarui secara lokal!');
  };

  return (
    <div className="max-w-2xl bg-white p-6 md:p-8 rounded-3xl border border-stone-200 shadow-md space-y-6 text-xs">
      
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
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 focus:outline-none focus:border-gold"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-charcoal block">Nomor WhatsApp Admin (Tombol WA)</label>
            <input
              type="text"
              value={whatsappAdmin}
              onChange={(e) => setWhatsappAdmin(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 focus:outline-none focus:border-gold"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-charcoal block">Email Bisnis</label>
            <input
              type="email"
              value={emailAdmin}
              onChange={(e) => setEmailAdmin(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-charcoal block">Persentase DP Minimum (%)</label>
            <input
              type="number"
              value={minDpPercent}
              onChange={(e) => setMinDpPercent(Number(e.target.value))}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 focus:outline-none"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="font-semibold text-charcoal block">Alamat Kantor / Galeri Butik</label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 focus:outline-none resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-charcoal block">Tarif Dasar Transportasi Alat (Rp)</label>
            <input
              type="number"
              value={transportBase}
              onChange={(e) => setTransportBase(Number(e.target.value))}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 focus:outline-none"
            />
          </div>
        </div>

        {/* Security / Backup stamp */}
        <div className="flex gap-2 items-start bg-ivory p-4 rounded-2xl border border-gold-light/20 text-[10px] text-stone-500 leading-normal">
          <Info className="h-4 w-4 text-gold-dark flex-shrink-0 mt-0.5" />
          <p>
            Perubahan konfigurasi di halaman ini secara langsung memengaruhi logika kalkulasi pada halaman form booking serta kontak nomor tujuan tombol konsultasi melayang secara dinamis.
          </p>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3.5 bg-gold hover:bg-gold-dark text-white font-bold rounded-xl uppercase tracking-wider shadow-sm flex items-center justify-center gap-1.5"
          >
            <Save className="h-4 w-4" /> Simpan Pengaturan
          </button>
        </div>

      </form>

    </div>
  );
}
