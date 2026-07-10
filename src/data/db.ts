'use client';

import { useState, useEffect } from 'react';
import { Dress, MakeupPackage, DecorPackage, WeddingPackage, Testimonial, Gallery, Booking, SystemSettings } from '@/types';
import {
  MOCK_DRESSES,
  MOCK_MAKEUP,
  MOCK_DECOR,
  MOCK_PACKAGES,
  MOCK_TESTIMONIALS,
  MOCK_GALLERY,
  INITIAL_BOOKINGS
} from './mockData';

// Helper to determine if we are in the browser environment
const isBrowser = () => typeof window !== 'undefined';

// Default settings
const DEFAULT_SETTINGS: SystemSettings = {
  shopName: 'Elika Wedding Organizer & Atelier',
  whatsappAdmin: '6281234567890',
  emailAdmin: 'info@elikawedding.com',
  minDpPercent: 30,
  transportBase: 150000,
  address: 'Jl. Kemang Raya No. 12, Mampang Prapatan, Jakarta Selatan, 12730'
};

// Centralized client-side repository
export const db = {
  getDresses(): Dress[] {
    if (!isBrowser()) return MOCK_DRESSES;
    const data = localStorage.getItem('elika_dresses');
    if (!data) {
      localStorage.setItem('elika_dresses', JSON.stringify(MOCK_DRESSES));
      return MOCK_DRESSES;
    }
    try { return JSON.parse(data); } catch { return MOCK_DRESSES; }
  },
  saveDresses(dresses: Dress[]) {
    if (isBrowser()) localStorage.setItem('elika_dresses', JSON.stringify(dresses));
  },

  getMakeup(): MakeupPackage[] {
    if (!isBrowser()) return MOCK_MAKEUP;
    const data = localStorage.getItem('elika_makeup');
    if (!data) {
      localStorage.setItem('elika_makeup', JSON.stringify(MOCK_MAKEUP));
      return MOCK_MAKEUP;
    }
    try { return JSON.parse(data); } catch { return MOCK_MAKEUP; }
  },
  saveMakeup(packages: MakeupPackage[]) {
    if (isBrowser()) localStorage.setItem('elika_makeup', JSON.stringify(packages));
  },

  getDecor(): DecorPackage[] {
    if (!isBrowser()) return MOCK_DECOR;
    const data = localStorage.getItem('elika_decor');
    if (!data) {
      localStorage.setItem('elika_decor', JSON.stringify(MOCK_DECOR));
      return MOCK_DECOR;
    }
    try { return JSON.parse(data); } catch { return MOCK_DECOR; }
  },
  saveDecor(decorations: DecorPackage[]) {
    if (isBrowser()) localStorage.setItem('elika_decor', JSON.stringify(decorations));
  },

  getPackages(): WeddingPackage[] {
    if (!isBrowser()) return MOCK_PACKAGES;
    const data = localStorage.getItem('elika_packages');
    if (!data) {
      localStorage.setItem('elika_packages', JSON.stringify(MOCK_PACKAGES));
      return MOCK_PACKAGES;
    }
    try { return JSON.parse(data); } catch { return MOCK_PACKAGES; }
  },
  savePackages(packages: WeddingPackage[]) {
    if (isBrowser()) localStorage.setItem('elika_packages', JSON.stringify(packages));
  },

  getGallery(): Gallery[] {
    if (!isBrowser()) return MOCK_GALLERY;
    const data = localStorage.getItem('elika_gallery');
    if (!data) {
      localStorage.setItem('elika_gallery', JSON.stringify(MOCK_GALLERY));
      return MOCK_GALLERY;
    }
    try { return JSON.parse(data); } catch { return MOCK_GALLERY; }
  },
  saveGallery(gallery: Gallery[]) {
    if (isBrowser()) localStorage.setItem('elika_gallery', JSON.stringify(gallery));
  },

  getTestimonials(): Testimonial[] {
    if (!isBrowser()) return MOCK_TESTIMONIALS;
    const data = localStorage.getItem('elika_testimonials');
    if (!data) {
      localStorage.setItem('elika_testimonials', JSON.stringify(MOCK_TESTIMONIALS));
      return MOCK_TESTIMONIALS;
    }
    try { return JSON.parse(data); } catch { return MOCK_TESTIMONIALS; }
  },
  saveTestimonials(testimonials: Testimonial[]) {
    if (isBrowser()) localStorage.setItem('elika_testimonials', JSON.stringify(testimonials));
  },

  getBookings(): Booking[] {
    if (!isBrowser()) return INITIAL_BOOKINGS;
    const data = localStorage.getItem('elika_bookings');
    if (!data) {
      localStorage.setItem('elika_bookings', JSON.stringify(INITIAL_BOOKINGS));
      return INITIAL_BOOKINGS;
    }
    try { return JSON.parse(data); } catch { return INITIAL_BOOKINGS; }
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
  const [dresses, setDresses] = useState<Dress[]>(MOCK_DRESSES);
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
  const [packages, setPackages] = useState<MakeupPackage[]>(MOCK_MAKEUP);
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
  const [decorations, setDecorations] = useState<DecorPackage[]>(MOCK_DECOR);
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
  const [packages, setPackages] = useState<WeddingPackage[]>(MOCK_PACKAGES);
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
  const [gallery, setGallery] = useState<Gallery[]>(MOCK_GALLERY);
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
  const [testimonials, setTestimonials] = useState<Testimonial[]>(MOCK_TESTIMONIALS);
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
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
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
