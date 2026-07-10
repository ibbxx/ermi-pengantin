'use client';

import { useState, useEffect } from 'react';
import { Dress, MakeupPackage, DecorPackage, WeddingPackage, Testimonial, Gallery, Booking, SystemSettings } from '@/types';

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

// Centralized client-side repository
export const db = {
  getDresses(): Dress[] {
    if (!isBrowser()) return EMPTY_DRESSES;
    const data = localStorage.getItem('elika_dresses');
    if (!data) {
      localStorage.setItem('elika_dresses', JSON.stringify(EMPTY_DRESSES));
      return EMPTY_DRESSES;
    }
    try { return JSON.parse(data); } catch { return EMPTY_DRESSES; }
  },
  saveDresses(dresses: Dress[]) {
    if (isBrowser()) localStorage.setItem('elika_dresses', JSON.stringify(dresses));
  },

  getMakeup(): MakeupPackage[] {
    if (!isBrowser()) return EMPTY_MAKEUP;
    const data = localStorage.getItem('elika_makeup');
    if (!data) {
      localStorage.setItem('elika_makeup', JSON.stringify(EMPTY_MAKEUP));
      return EMPTY_MAKEUP;
    }
    try { return JSON.parse(data); } catch { return EMPTY_MAKEUP; }
  },
  saveMakeup(packages: MakeupPackage[]) {
    if (isBrowser()) localStorage.setItem('elika_makeup', JSON.stringify(packages));
  },

  getDecor(): DecorPackage[] {
    if (!isBrowser()) return EMPTY_DECOR;
    const data = localStorage.getItem('elika_decor');
    if (!data) {
      localStorage.setItem('elika_decor', JSON.stringify(EMPTY_DECOR));
      return EMPTY_DECOR;
    }
    try { return JSON.parse(data); } catch { return EMPTY_DECOR; }
  },
  saveDecor(decorations: DecorPackage[]) {
    if (isBrowser()) localStorage.setItem('elika_decor', JSON.stringify(decorations));
  },

  getPackages(): WeddingPackage[] {
    if (!isBrowser()) return EMPTY_PACKAGES;
    const data = localStorage.getItem('elika_packages');
    if (!data) {
      localStorage.setItem('elika_packages', JSON.stringify(EMPTY_PACKAGES));
      return EMPTY_PACKAGES;
    }
    try { return JSON.parse(data); } catch { return EMPTY_PACKAGES; }
  },
  savePackages(packages: WeddingPackage[]) {
    if (isBrowser()) localStorage.setItem('elika_packages', JSON.stringify(packages));
  },

  getGallery(): Gallery[] {
    if (!isBrowser()) return EMPTY_GALLERY;
    const data = localStorage.getItem('elika_gallery');
    if (!data) {
      localStorage.setItem('elika_gallery', JSON.stringify(EMPTY_GALLERY));
      return EMPTY_GALLERY;
    }
    try { return JSON.parse(data); } catch { return EMPTY_GALLERY; }
  },
  saveGallery(gallery: Gallery[]) {
    if (isBrowser()) localStorage.setItem('elika_gallery', JSON.stringify(gallery));
  },

  getTestimonials(): Testimonial[] {
    if (!isBrowser()) return EMPTY_TESTIMONIALS;
    const data = localStorage.getItem('elika_testimonials');
    if (!data) {
      localStorage.setItem('elika_testimonials', JSON.stringify(EMPTY_TESTIMONIALS));
      return EMPTY_TESTIMONIALS;
    }
    try { return JSON.parse(data); } catch { return EMPTY_TESTIMONIALS; }
  },
  saveTestimonials(testimonials: Testimonial[]) {
    if (isBrowser()) localStorage.setItem('elika_testimonials', JSON.stringify(testimonials));
  },

  getBookings(): Booking[] {
    if (!isBrowser()) return EMPTY_BOOKINGS;
    const data = localStorage.getItem('elika_bookings');
    if (!data) {
      localStorage.setItem('elika_bookings', JSON.stringify(EMPTY_BOOKINGS));
      return EMPTY_BOOKINGS;
    }
    try { return JSON.parse(data); } catch { return EMPTY_BOOKINGS; }
  },
  saveBookings(bookings: Booking[]) {
    if (isBrowser()) localStorage.setItem('elika_bookings', JSON.stringify(bookings));
  },

  getSettings(): SystemSettings {
    if (!isBrowser()) return DEFAULT_SETTINGS;
    const data = localStorage.getItem('elika_settings');
    if (!data) {
      localStorage.setItem('elika_settings', JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    try { return JSON.parse(data); } catch { return DEFAULT_SETTINGS; }
  },
  saveSettings(settings: SystemSettings) {
    if (isBrowser()) localStorage.setItem('elika_settings', JSON.stringify(settings));
  }
};

// React Custom Hooks for easy integration and hydration compatibility
export function useDresses() {
  const [dresses, setDresses] = useState<Dress[]>(EMPTY_DRESSES);
  useEffect(() => {
    setDresses(db.getDresses());
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
    setPackages(db.getMakeup());
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
    setDecorations(db.getDecor());
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
    setPackages(db.getPackages());
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
    setGallery(db.getGallery());
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
    setTestimonials(db.getTestimonials());
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
    setBookings(db.getBookings());
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
    setSettings(db.getSettings());
  }, []);
  const updateSettings = (newSettings: SystemSettings) => {
    setSettings(newSettings);
    db.saveSettings(newSettings);
  };
  return [settings, updateSettings] as const;
}
