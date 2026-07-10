'use client';

import { useState, useEffect } from 'react';
import { Dress, MakeupPackage, DecorPackage, WeddingPackage, Testimonial, Gallery, Booking, SystemSettings } from '@/types';
import { supabase } from '@/lib/supabase';

const EMPTY_DRESSES: Dress[] = [];
const EMPTY_MAKEUP: MakeupPackage[] = [];
const EMPTY_DECOR: DecorPackage[] = [];
const EMPTY_PACKAGES: WeddingPackage[] = [];
const EMPTY_TESTIMONIALS: Testimonial[] = [];
const EMPTY_GALLERY: Gallery[] = [];
const EMPTY_BOOKINGS: Booking[] = [];

// Helper to determine if we are in the browser environment
const isBrowser = () => typeof window !== 'undefined';

// Default settings
const DEFAULT_SETTINGS: SystemSettings = {
  shopName: 'Elika Wedding Organizer & Atelier',
  whatsappAdmin: '6281234567890',
  emailAdmin: 'info@elikawedding.com',
  minDpPercent: 30,
  transportBase: 150000,
  address: 'Jl. Kemang Raya No. 12, Mampang Prapatan, Jakarta Selatan, 12730',
  heroImage: ''
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
    availableDates: row.available_dates || [],
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
    name: row.name,
    theme: row.theme,
    price: row.price,
    description: row.description || '',
    venueSize: row.venue_size || '',
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

function mapBookingFromDb(row: any): Booking {
  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
    customerId: row.customer_id,
    customerName: row.customer_name,
    customerWhatsApp: row.customer_whatsapp,
    customerEmail: row.customer_email,
    customerAddress: row.customer_address,
    eventDate: row.event_date,
    eventLocation: row.event_location,
    eventType: row.event_type as any,
    servicesSelected: row.services_selected || {},
    notes: row.notes || '',
    subtotal: row.subtotal,
    additionalFees: row.additional_fees,
    depositRequired: row.deposit_required,
    totalAmount: row.total_amount,
    paymentType: row.payment_type as any,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status as any,
    bookingStatus: row.booking_status as any,
    createdAt: row.created_at
  };
}

function mapBookingToDb(b: Booking): any {
  return {
    id: b.id,
    invoice_number: b.invoiceNumber,
    customer_id: b.customerId,
    customer_name: b.customerName,
    customer_whatsapp: b.customerWhatsApp,
    customer_email: b.customerEmail,
    customer_address: b.customerAddress,
    event_date: b.eventDate,
    event_location: b.eventLocation,
    event_type: b.eventType,
    services_selected: b.servicesSelected,
    notes: b.notes,
    subtotal: b.subtotal,
    additional_fees: b.additionalFees,
    deposit_required: b.depositRequired,
    total_amount: b.totalAmount,
    payment_type: b.paymentType,
    payment_method: b.paymentMethod,
    payment_status: b.paymentStatus,
    booking_status: b.bookingStatus,
    created_at: b.createdAt
  };
}

function mapSettingsFromDb(row: any): SystemSettings {
  return {
    shopName: row.shop_name,
    whatsappAdmin: row.whatsapp_admin,
    emailAdmin: row.email_admin,
    minDpPercent: row.min_dp_percent,
    transportBase: row.transport_base,
    address: row.address,
    heroImage: row.hero_image || ''
  };
}

// ==========================================
// LOCALSTORAGE TO SUPABASE MIGRATION
// ==========================================
async function syncLocalToSupabase() {
  if (!isBrowser()) return;
  const migratedKey = 'elika_db_migrated_v1';
  if (localStorage.getItem(migratedKey)) return;

  try {
    console.log('[Migration] Starting localStorage to Supabase migration...');

    // 1. Dresses
    const localDresses = localStorage.getItem('elika_dresses');
    if (localDresses) {
      try {
        const list = JSON.parse(localDresses) as Dress[];
        if (list.length > 0) {
          const { count } = await supabase.from('dresses').select('*', { count: 'exact', head: true });
          if (count === 0) {
            const rows = list.map(d => ({
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
              available_dates: d.availableDates,
              rating: d.rating,
              review_count: d.reviewCount,
              is_popular: d.isPopular,
              status: d.status
            }));
            await supabase.from('dresses').upsert(rows);
            console.log('[Migration] Migrated dresses:', list.length);
          }
        }
      } catch (e) { console.error(e); }
    }

    // 2. Makeup
    const localMakeup = localStorage.getItem('elika_makeup');
    if (localMakeup) {
      try {
        const list = JSON.parse(localMakeup) as MakeupPackage[];
        if (list.length > 0) {
          const { count } = await supabase.from('makeup_packages').select('*', { count: 'exact', head: true });
          if (count === 0) {
            const rows = list.map(m => ({
              id: m.id,
              name: m.name,
              price: m.price,
              description: m.description,
              features: m.features,
              images: m.images
            }));
            await supabase.from('makeup_packages').upsert(rows);
            console.log('[Migration] Migrated makeup packages:', list.length);
          }
        }
      } catch (e) { console.error(e); }
    }

    // 3. Decor
    const localDecor = localStorage.getItem('elika_decor');
    if (localDecor) {
      try {
        const list = JSON.parse(localDecor) as DecorPackage[];
        if (list.length > 0) {
          const { count } = await supabase.from('decor_packages').select('*', { count: 'exact', head: true });
          if (count === 0) {
            const rows = list.map(d => ({
              id: d.id,
              name: d.name,
              theme: d.theme,
              price: d.price,
              description: d.description,
              venue_size: d.venueSize,
              features: d.features,
              images: d.images
            }));
            await supabase.from('decor_packages').upsert(rows);
            console.log('[Migration] Migrated decor packages:', list.length);
          }
        }
      } catch (e) { console.error(e); }
    }

    // 4. Packages
    const localPackages = localStorage.getItem('elika_packages');
    if (localPackages) {
      try {
        const list = JSON.parse(localPackages) as WeddingPackage[];
        if (list.length > 0) {
          const { count } = await supabase.from('wedding_packages').select('*', { count: 'exact', head: true });
          if (count === 0) {
            const rows = list.map(w => ({
              id: w.id,
              name: w.name,
              price: w.price,
              dresses_included: w.dressesIncluded,
              makeup_included: w.makeupIncluded,
              decor_included: w.decorIncluded,
              features: w.features,
              deposit_required: w.depositRequired,
              is_popular: w.isPopular
            }));
            await supabase.from('wedding_packages').upsert(rows);
            console.log('[Migration] Migrated wedding packages:', list.length);
          }
        }
      } catch (e) { console.error(e); }
    }

    // 5. Gallery
    const localGallery = localStorage.getItem('elika_gallery');
    if (localGallery) {
      try {
        const list = JSON.parse(localGallery) as Gallery[];
        if (list.length > 0) {
          const { count } = await supabase.from('gallery').select('*', { count: 'exact', head: true });
          if (count === 0) {
            const rows = list.map(g => ({
              id: g.id,
              title: g.title,
              category: g.category,
              image: g.image,
              description: g.description
            }));
            await supabase.from('gallery').upsert(rows);
            console.log('[Migration] Migrated gallery items:', list.length);
          }
        }
      } catch (e) { console.error(e); }
    }

    // 6. Testimonials
    const localTestimonials = localStorage.getItem('elika_testimonials');
    if (localTestimonials) {
      try {
        const list = JSON.parse(localTestimonials) as Testimonial[];
        if (list.length > 0) {
          const { count } = await supabase.from('testimonials').select('*', { count: 'exact', head: true });
          if (count === 0) {
            const rows = list.map(t => ({
              id: t.id,
              name: t.name,
              role: t.role,
              rating: t.rating,
              comment: t.comment,
              avatar: t.avatar
            }));
            await supabase.from('testimonials').upsert(rows);
            console.log('[Migration] Migrated testimonials:', list.length);
          }
        }
      } catch (e) { console.error(e); }
    }

    // 7. Bookings
    const localBookings = localStorage.getItem('elika_bookings');
    if (localBookings) {
      try {
        const list = JSON.parse(localBookings) as Booking[];
        if (list.length > 0) {
          const { count } = await supabase.from('bookings').select('*', { count: 'exact', head: true });
          if (count === 0) {
            const rows = list.map(mapBookingToDb);
            await supabase.from('bookings').upsert(rows);
            console.log('[Migration] Migrated bookings:', list.length);
          }
        }
      } catch (e) { console.error(e); }
    }

    // 8. Settings
    const localSettings = localStorage.getItem('elika_settings');
    if (localSettings) {
      try {
        const s = JSON.parse(localSettings) as SystemSettings;
        const row = {
          id: 1,
          shop_name: s.shopName,
          whatsapp_admin: s.whatsappAdmin,
          email_admin: s.emailAdmin,
          min_dp_percent: s.minDpPercent,
          transport_base: s.transportBase,
          address: s.address,
          hero_image: s.heroImage
        };
        await supabase.from('system_settings').upsert(row);
        console.log('[Migration] Migrated settings.');
      } catch (e) { console.error(e); }
    }

    localStorage.setItem(migratedKey, 'true');
    console.log('[Migration] localStorage data successfully migrated to Supabase!');
  } catch (error) {
    console.error('[Migration] Failed to migrate local data:', error);
  }
}

let migrationPromise: Promise<void> | null = null;
function startMigration() {
  if (!migrationPromise && isBrowser()) {
    migrationPromise = syncLocalToSupabase();
  }
  return migrationPromise || Promise.resolve();
}

// ==========================================
// REPOSITORY PATTERN CONNECTED TO SUPABASE
// ==========================================
export const db = {
  // --- Dresses ---
  async getDresses(): Promise<Dress[]> {
    await startMigration();
    const { data, error } = await supabase.from('dresses').select('*').order('name');
    if (error) {
      console.error('Failed to get dresses:', error);
      return EMPTY_DRESSES;
    }
    return (data || []).map(mapDressFromDb);
  },
  async saveDresses(dresses: Dress[]) {
    await startMigration();
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
        available_dates: d.availableDates,
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
    await startMigration();
    const { data, error } = await supabase.from('makeup_packages').select('*').order('name');
    if (error) {
      console.error('Failed to get makeup:', error);
      return EMPTY_MAKEUP;
    }
    return (data || []).map(mapMakeupFromDb);
  },
  async saveMakeup(packages: MakeupPackage[]) {
    await startMigration();
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
    await startMigration();
    const { data, error } = await supabase.from('decor_packages').select('*').order('name');
    if (error) {
      console.error('Failed to get decor:', error);
      return EMPTY_DECOR;
    }
    return (data || []).map(mapDecorFromDb);
  },
  async saveDecor(decorations: DecorPackage[]) {
    await startMigration();
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
        name: d.name,
        theme: d.theme,
        price: d.price,
        description: d.description,
        venue_size: d.venueSize,
        features: d.features,
        images: d.images
      }));
      await supabase.from('decor_packages').upsert(rows);
    }
  },

  // --- Packages ---
  async getPackages(): Promise<WeddingPackage[]> {
    await startMigration();
    const { data, error } = await supabase.from('wedding_packages').select('*').order('name');
    if (error) {
      console.error('Failed to get packages:', error);
      return EMPTY_PACKAGES;
    }
    return (data || []).map(mapPackageFromDb);
  },
  async savePackages(packages: WeddingPackage[]) {
    await startMigration();
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
    await startMigration();
    const { data, error } = await supabase.from('gallery').select('*');
    if (error) {
      console.error('Failed to get gallery:', error);
      return EMPTY_GALLERY;
    }
    return (data || []).map(mapGalleryFromDb);
  },
  async saveGallery(gallery: Gallery[]) {
    await startMigration();
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
    await startMigration();
    const { data, error } = await supabase.from('testimonials').select('*');
    if (error) {
      console.error('Failed to get testimonials:', error);
      return EMPTY_TESTIMONIALS;
    }
    return (data || []).map(mapTestimonialFromDb);
  },
  async saveTestimonials(testimonials: Testimonial[]) {
    await startMigration();
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

  // --- Bookings ---
  async getBookings(): Promise<Booking[]> {
    await startMigration();
    const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Failed to get bookings:', error);
      return EMPTY_BOOKINGS;
    }
    return (data || []).map(mapBookingFromDb);
  },
  async saveBookings(bookings: Booking[]) {
    await startMigration();
    const { data: current } = await supabase.from('bookings').select('id');
    const dbIds = (current || []).map(r => r.id);
    const newIds = bookings.map(b => b.id);
    
    const toDelete = dbIds.filter(id => !newIds.includes(id));
    if (toDelete.length > 0) {
      await supabase.from('bookings').delete().in('id', toDelete);
    }
    
    if (bookings.length > 0) {
      const rows = bookings.map(mapBookingToDb);
      await supabase.from('bookings').upsert(rows);
    }
  },
  async getBookingById(id: string): Promise<Booking | null> {
    await startMigration();
    const { data, error } = await supabase.from('bookings').select('*').eq('id', id).maybeSingle();
    if (error || !data) {
      if (error) console.error('Failed to get booking by ID:', error);
      return null;
    }
    return mapBookingFromDb(data);
  },
  async saveBooking(booking: Booking): Promise<void> {
    await startMigration();
    const row = mapBookingToDb(booking);
    const { error } = await supabase.from('bookings').upsert(row);
    if (error) {
      console.error('Failed to save single booking:', error);
      throw error;
    }
  },

  // --- Settings ---
  async getSettings(): Promise<SystemSettings> {
    await startMigration();
    const { data, error } = await supabase.from('system_settings').select('*').eq('id', 1).maybeSingle();
    if (error || !data) {
      if (error) console.error('Failed to get settings:', error);
      return DEFAULT_SETTINGS;
    }
    return mapSettingsFromDb(data);
  },
  async saveSettings(settings: SystemSettings) {
    await startMigration();
    const row = {
      id: 1,
      shop_name: settings.shopName,
      whatsapp_admin: settings.whatsappAdmin,
      email_admin: settings.emailAdmin,
      min_dp_percent: settings.minDpPercent,
      transport_base: settings.transportBase,
      address: settings.address,
      hero_image: settings.heroImage
    };
    const { error } = await supabase.from('system_settings').upsert(row);
    if (error) {
      console.error('Failed to save settings:', error);
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

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>(EMPTY_BOOKINGS);
  useEffect(() => {
    db.getBookings().then(setBookings);
  }, []);
  const updateBookings = (newBookings: Booking[]) => {
    setBookings(newBookings);
    db.saveBookings(newBookings);
  };
  return [bookings, updateBookings] as const;
}

export function useSettings() {
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  useEffect(() => {
    db.getSettings().then(setSettings);
  }, []);
  const updateSettings = (newSettings: SystemSettings) => {
    setSettings(newSettings);
    db.saveSettings(newSettings);
  };
  return [settings, updateSettings] as const;
}
