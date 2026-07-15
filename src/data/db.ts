'use client';

import { useEffect, useState } from 'react';
import { Dress, MakeupPackage, DecorPackage, WeddingPackage, Testimonial, Gallery, SystemSettings } from '@/types';
import { supabase } from '@/lib/supabase';

const EMPTY_DRESSES: Dress[] = [];
const EMPTY_MAKEUP: MakeupPackage[] = [];
const EMPTY_DECOR: DecorPackage[] = [];
const EMPTY_PACKAGES: WeddingPackage[] = [];
const EMPTY_TESTIMONIALS: Testimonial[] = [];
const EMPTY_GALLERY: Gallery[] = [];

// Default settings
const DEFAULT_SETTINGS: SystemSettings = {
  shopName: 'Ermi Pengantin',
  whatsappAdmin: '6281234567890',
  emailAdmin: '',
  minDpPercent: 30,
  transportBase: 150000,
  address: 'Jl. Kemang Raya No. 12, Mampang Prapatan, Jakarta Selatan, 12730',
  heroImage: '',
  serviceDressImage: '',
  serviceMakeupImage: '',
  serviceDecorImage: '',
  tfEnabled: false,
  tfBankName: '',
  tfAccountNumber: '',
  tfAccountHolder: '',
  qrisEnabled: false,
  qrisImage: ''
};

// ==========================================
// DATABASE MAPPING HELPERS
// ==========================================
function mapDressFromDb(row: any): Dress {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    price: row.price,
    deposit: row.deposit,
    sizes: row.sizes || [],
    colors: row.colors || [],
    images: row.images || [],
    description: row.description || '',
    material: row.material || '',
    rentalDurationDays: row.rental_duration_days || 3,
    rating: Number(row.rating || 5),
    reviewCount: row.review_count || 0,
    isPopular: !!row.is_popular,
    status: row.status as any
  };
}

function mapMakeupFromDb(row: any): MakeupPackage {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    description: row.description || '',
    features: row.features || [],
    images: row.images || []
  };
}

function mapDecorFromDb(row: any): DecorPackage {
  return {
    id: row.id,
    decorType: row.decor_type === 'item' ? 'item' : 'package',
    name: row.name,
    theme: row.theme,
    price: row.price,
    description: row.description || '',
    features: row.features || [],
    images: row.images || []
  };
}

function mapPackageFromDb(row: any): WeddingPackage {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    dressesIncluded: row.dresses_included || 0,
    makeupIncluded: row.makeup_included || [],
    decorIncluded: row.decor_included,
    features: row.features || [],
    depositRequired: row.deposit_required || 0,
    isPopular: !!row.is_popular
  };
}

function mapGalleryFromDb(row: any): Gallery {
  return {
    id: row.id,
    title: row.title,
    category: row.category as any,
    image: row.image,
    description: row.description || ''
  };
}

function mapTestimonialFromDb(row: any): Testimonial {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    rating: row.rating || 5,
    comment: row.comment,
    avatar: row.avatar || ''
  };
}

function mapSettingsFromDb(row: any): SystemSettings {
  const storedShopName = String(row.shop_name || '');
  const storedEmail = String(row.email_admin || '');

  return {
    shopName: /elika/i.test(storedShopName) ? DEFAULT_SETTINGS.shopName : storedShopName || DEFAULT_SETTINGS.shopName,
    whatsappAdmin: row.whatsapp_admin,
    emailAdmin: /elika/i.test(storedEmail) ? DEFAULT_SETTINGS.emailAdmin : storedEmail,
    minDpPercent: row.min_dp_percent,
    transportBase: row.transport_base,
    address: row.address,
    heroImage: row.hero_image || '',
    serviceDressImage: row.service_dress_image || '',
    serviceMakeupImage: row.service_makeup_image || '',
    serviceDecorImage: row.service_decor_image || '',
    tfEnabled: !!row.tf_enabled,
    tfBankName: row.tf_bank_name || '',
    tfAccountNumber: row.tf_account_number || '',
    tfAccountHolder: row.tf_account_holder || '',
    qrisEnabled: !!row.qris_enabled,
    qrisImage: row.qris_image || ''
  };
}

// ==========================================
// REPOSITORY PATTERN CONNECTED TO SUPABASE
// ==========================================
export const db = {
  // --- Dresses ---
  async getDresses(): Promise<Dress[]> {
    const { data, error } = await supabase.from('dresses').select('*').order('name');
    if (error) {
      console.error('Failed to get dresses:', error);
      return EMPTY_DRESSES;
    }
    return (data || []).map(mapDressFromDb);
  },
  async saveDresses(dresses: Dress[]) {
    const { data: current } = await supabase.from('dresses').select('id');
    const dbIds = (current || []).map(r => r.id);
    const newIds = dresses.map(d => d.id);
    
    // Delete items that were removed
    const toDelete = dbIds.filter(id => !newIds.includes(id));
    if (toDelete.length > 0) {
      await supabase.from('dresses').delete().in('id', toDelete);
    }
    
    // Upsert existing & new items
    if (dresses.length > 0) {
      const rows = dresses.map(d => ({
        id: d.id,
        slug: d.slug,
        name: d.name,
        category: d.category,
        price: d.price,
        deposit: d.deposit,
        sizes: d.sizes,
        colors: d.colors,
        images: d.images,
        description: d.description,
        material: d.material,
        rental_duration_days: d.rentalDurationDays,
        rating: d.rating,
        review_count: d.reviewCount,
        is_popular: d.isPopular,
        status: d.status
      }));
      await supabase.from('dresses').upsert(rows);
    }
  },

  // --- Makeup ---
  async getMakeup(): Promise<MakeupPackage[]> {
    const { data, error } = await supabase.from('makeup_packages').select('*').order('name');
    if (error) {
      console.error('Failed to get makeup:', error);
      return EMPTY_MAKEUP;
    }
    return (data || []).map(mapMakeupFromDb);
  },
  async saveMakeup(packages: MakeupPackage[]) {
    const { data: current } = await supabase.from('makeup_packages').select('id');
    const dbIds = (current || []).map(r => r.id);
    const newIds = packages.map(p => p.id);
    
    const toDelete = dbIds.filter(id => !newIds.includes(id));
    if (toDelete.length > 0) {
      await supabase.from('makeup_packages').delete().in('id', toDelete);
    }
    
    if (packages.length > 0) {
      const rows = packages.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        description: p.description,
        features: p.features,
        images: p.images
      }));
      await supabase.from('makeup_packages').upsert(rows);
    }
  },

  // --- Decor ---
  async getDecor(): Promise<DecorPackage[]> {
    const { data, error } = await supabase.from('decor_packages').select('*').order('name');
    if (error) {
      console.error('Failed to get decor:', error);
      return EMPTY_DECOR;
    }
    return (data || []).map(mapDecorFromDb);
  },
  async saveDecor(decorations: DecorPackage[]) {
    const { data: current } = await supabase.from('decor_packages').select('id');
    const dbIds = (current || []).map(r => r.id);
    const newIds = decorations.map(d => d.id);
    
    const toDelete = dbIds.filter(id => !newIds.includes(id));
    if (toDelete.length > 0) {
      await supabase.from('decor_packages').delete().in('id', toDelete);
    }
    
    if (decorations.length > 0) {
      const rows = decorations.map(d => ({
        id: d.id,
        decor_type: d.decorType,
        name: d.name,
        theme: d.theme,
        price: d.price,
        description: d.description,
        features: d.features,
        images: d.images
      }));
      await supabase.from('decor_packages').upsert(rows);
    }
  },

  // --- Packages ---
  async getPackages(): Promise<WeddingPackage[]> {
    const { data, error } = await supabase.from('wedding_packages').select('*').order('name');
    if (error) {
      console.error('Failed to get packages:', error);
      return EMPTY_PACKAGES;
    }
    return (data || []).map(mapPackageFromDb);
  },
  async savePackages(packages: WeddingPackage[]) {
    const { data: current } = await supabase.from('wedding_packages').select('id');
    const dbIds = (current || []).map(r => r.id);
    const newIds = packages.map(p => p.id);
    
    const toDelete = dbIds.filter(id => !newIds.includes(id));
    if (toDelete.length > 0) {
      await supabase.from('wedding_packages').delete().in('id', toDelete);
    }
    
    if (packages.length > 0) {
      const rows = packages.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        dresses_included: p.dressesIncluded,
        makeup_included: p.makeupIncluded,
        decor_included: p.decorIncluded,
        features: p.features,
        deposit_required: p.depositRequired,
        is_popular: p.isPopular
      }));
      await supabase.from('wedding_packages').upsert(rows);
    }
  },

  // --- Gallery ---
  async getGallery(): Promise<Gallery[]> {
    const { data, error } = await supabase.from('gallery').select('*');
    if (error) {
      console.error('Failed to get gallery:', error);
      return EMPTY_GALLERY;
    }
    return (data || []).map(mapGalleryFromDb);
  },
  async saveGallery(gallery: Gallery[]) {
    const { data: current } = await supabase.from('gallery').select('id');
    const dbIds = (current || []).map(r => r.id);
    const newIds = gallery.map(g => g.id);
    
    const toDelete = dbIds.filter(id => !newIds.includes(id));
    if (toDelete.length > 0) {
      await supabase.from('gallery').delete().in('id', toDelete);
    }
    
    if (gallery.length > 0) {
      const rows = gallery.map(g => ({
        id: g.id,
        title: g.title,
        category: g.category,
        image: g.image,
        description: g.description
      }));
      await supabase.from('gallery').upsert(rows);
    }
  },

  // --- Testimonials ---
  async getTestimonials(): Promise<Testimonial[]> {
    const { data, error } = await supabase.from('testimonials').select('*');
    if (error) {
      console.error('Failed to get testimonials:', error);
      return EMPTY_TESTIMONIALS;
    }
    return (data || []).map(mapTestimonialFromDb);
  },
  async saveTestimonials(testimonials: Testimonial[]) {
    const { data: current } = await supabase.from('testimonials').select('id');
    const dbIds = (current || []).map(r => r.id);
    const newIds = testimonials.map(t => t.id);
    
    const toDelete = dbIds.filter(id => !newIds.includes(id));
    if (toDelete.length > 0) {
      await supabase.from('testimonials').delete().in('id', toDelete);
    }
    
    if (testimonials.length > 0) {
      const rows = testimonials.map(t => ({
        id: t.id,
        name: t.name,
        role: t.role,
        rating: t.rating,
        comment: t.comment,
        avatar: t.avatar
      }));
      await supabase.from('testimonials').upsert(rows);
    }
  },

  // --- Settings ---
  async getSettings(): Promise<SystemSettings> {
    const { data, error } = await supabase.from('system_settings').select('*').eq('id', 1).maybeSingle();
    if (error || !data) {
      if (error) console.error('Failed to get settings:', error);
      return DEFAULT_SETTINGS;
    }
    return mapSettingsFromDb(data);
  },
  async saveSettings(settings: SystemSettings): Promise<void> {
    const row = {
      id: 1,
      shop_name: settings.shopName,
      whatsapp_admin: settings.whatsappAdmin,
      email_admin: settings.emailAdmin,
      min_dp_percent: settings.minDpPercent,
      transport_base: settings.transportBase,
      address: settings.address,
      hero_image: settings.heroImage,
      service_dress_image: settings.serviceDressImage,
      service_makeup_image: settings.serviceMakeupImage,
      service_decor_image: settings.serviceDecorImage,
      tf_enabled: settings.tfEnabled,
      tf_bank_name: settings.tfBankName,
      tf_account_number: settings.tfAccountNumber,
      tf_account_holder: settings.tfAccountHolder,
      qris_enabled: settings.qrisEnabled,
      qris_image: settings.qrisImage
    };
    const { error } = await supabase.from('system_settings').upsert(row);
    if (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  }
};

// ==========================================
// REACT HOOKS SUPPORTING ASYNC LOAD
// ==========================================
export function useDresses() {
  const [dresses, setDresses] = useState<Dress[]>(EMPTY_DRESSES);
  useEffect(() => {
    db.getDresses().then(setDresses);
  }, []);
  const updateDresses = (newDresses: Dress[]) => {
    setDresses(newDresses);
    db.saveDresses(newDresses);
  };
  return [dresses, updateDresses] as const;
}

export function useMakeup() {
  const [packages, setPackages] = useState<MakeupPackage[]>(EMPTY_MAKEUP);
  useEffect(() => {
    db.getMakeup().then(setPackages);
  }, []);
  const updateMakeup = (newPackages: MakeupPackage[]) => {
    setPackages(newPackages);
    db.saveMakeup(newPackages);
  };
  return [packages, updateMakeup] as const;
}

export function useDecor() {
  const [decorations, setDecorations] = useState<DecorPackage[]>(EMPTY_DECOR);
  useEffect(() => {
    db.getDecor().then(setDecorations);
  }, []);
  const updateDecor = (newDecorations: DecorPackage[]) => {
    setDecorations(newDecorations);
    db.saveDecor(newDecorations);
  };
  return [decorations, updateDecor] as const;
}

export function usePackages() {
  const [packages, setPackages] = useState<WeddingPackage[]>(EMPTY_PACKAGES);
  useEffect(() => {
    db.getPackages().then(setPackages);
  }, []);
  const updatePackages = (newPackages: WeddingPackage[]) => {
    setPackages(newPackages);
    db.savePackages(newPackages);
  };
  return [packages, updatePackages] as const;
}

export function useGallery() {
  const [gallery, setGallery] = useState<Gallery[]>(EMPTY_GALLERY);
  useEffect(() => {
    db.getGallery().then(setGallery);
  }, []);
  const updateGallery = (newGallery: Gallery[]) => {
    setGallery(newGallery);
    db.saveGallery(newGallery);
  };
  return [gallery, updateGallery] as const;
}

export function useTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(EMPTY_TESTIMONIALS);
  useEffect(() => {
    db.getTestimonials().then(setTestimonials);
  }, []);
  const updateTestimonials = (newTestimonials: Testimonial[]) => {
    setTestimonials(newTestimonials);
    db.saveTestimonials(newTestimonials);
  };
  return [testimonials, updateTestimonials] as const;
}

export function useSettings() {
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    db.getSettings().then((loadedSettings) => {
      setSettings(loadedSettings);
      setIsLoaded(true);
    });
  }, []);
  const updateSettings = async (newSettings: SystemSettings): Promise<void> => {
    await db.saveSettings(newSettings);
    setSettings(newSettings);
    setIsLoaded(true);
  };
  return [settings, updateSettings, isLoaded] as const;
}
