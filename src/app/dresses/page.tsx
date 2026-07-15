'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { useDresses } from '@/data/db';
import { DressCategory } from '@/types';
import DressCard from '@/components/DressCard';
import EmptyState from '@/components/ui/EmptyState';

export default function DressesCatalog() {
  const [dresses] = useDresses();

  // Hydration state
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popular');

  // Dynamic categories based on active dresses in inventory
  const categories = useMemo(() => {
    const activeCats = dresses.map((d) => d.category).filter(Boolean);
    const uniqueCats = Array.from(new Set(activeCats));

    const items = uniqueCats.map((cat) => ({
      label: cat,
      value: cat,
    }));

    return [
      { label: 'Semua Koleksi', value: 'all' },
      ...items,
    ];
  }, [dresses]);

  // Dynamic sizes based on available dresses
  const sizes = useMemo(() => {
    const activeSizes = dresses.flatMap((d) => d.sizes || []);
    const unique = Array.from(
      new Set(activeSizes.map((s) => s.trim().toUpperCase()))
    ).filter(Boolean);

    const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
    return unique.sort((a, b) => {
      const idxA = sizeOrder.indexOf(a);
      const idxB = sizeOrder.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [dresses]);

  // Dynamic colors based on available dresses
  const colors = useMemo(() => {
    const activeColors = dresses.flatMap((d) => d.colors || []);
    const unique = Array.from(
      new Set(
        activeColors.map((c) => {
          const trimmed = c.trim();
          return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
        })
      )
    ).filter(Boolean);

    return unique.sort((a, b) => a.localeCompare(b));
  }, [dresses]);

  // Apply filters
  const filteredDresses = useMemo(() => {
    return dresses
      .filter((dress) => {
        // 1. Search Query
        const matchSearch =
          dress.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dress.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dress.material.toLowerCase().includes(searchQuery.toLowerCase());

        // 2. Category Filter
        const matchCategory =
          selectedCategory === 'all' || dress.category === selectedCategory;

        // 3. Size Filter
        const matchSize =
          selectedSize === 'all' || dress.sizes.includes(selectedSize);

        // 4. Color Filter
        const matchColor =
          selectedColor === 'all' ||
          dress.colors.some((color) =>
            color.toLowerCase().includes(selectedColor.toLowerCase())
          );

        return matchSearch && matchCategory && matchSize && matchColor;
      })
      .sort((a, b) => {
        // Sorting
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        // Default: popular / rating count
        return b.reviewCount - a.reviewCount;
      });
  }, [dresses, searchQuery, selectedCategory, selectedSize, selectedColor, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedSize('all');
    setSelectedColor('all');
    setSortBy('popular');
  };

  // Render Skeleton during SSR and initial client hydration to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header Skeleton */}
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="h-10 bg-stone-150 animate-pulse rounded-md w-3/4 mx-auto" />
          <div className="h-4 bg-stone-150 animate-pulse rounded-md w-5/6 mx-auto" />
        </div>

        {/* Main Catalog Layout Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Skeleton */}
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gold-light/20 shadow-sm space-y-6 h-fit animate-pulse">
            <div className="h-6 bg-stone-150 rounded w-1/2" />
            <div className="space-y-2">
              <div className="h-4 bg-stone-150 rounded w-1/3" />
              <div className="h-8 bg-stone-150 rounded w-full" />
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-stone-150 rounded w-1/3" />
              <div className="flex gap-2 flex-wrap">
                <div className="h-7 bg-stone-150 rounded w-16" />
                <div className="h-7 bg-stone-150 rounded w-20" />
                <div className="h-7 bg-stone-150 rounded w-24" />
              </div>
            </div>
          </div>

          {/* Results Skeleton */}
          <div className="lg:col-span-3 space-y-6">
            <div className="h-12 bg-white rounded-xl border border-gold-light/10 shadow-sm animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="bg-white rounded-3xl overflow-hidden border border-gold-light/10 shadow-sm p-5 space-y-4 animate-pulse">
                  <div className="aspect-[3/4] bg-stone-150 rounded-2xl w-full" />
                  <div className="space-y-2">
                    <div className="h-4 bg-stone-150 rounded-md w-3/4" />
                    <div className="h-3 bg-stone-150 rounded-md w-1/2" />
                    <div className="h-5 bg-stone-150 rounded-md w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-charcoal">Koleksi Sewa Baju & Busana</h1>
        <p className="text-xs text-stone-muted">
          Sewa gaun pengantin modern, kebaya eksklusif, baju adat nusantara, setelan jas pria premium, dan busana keluarga.
        </p>
      </div>

      {/* Main Catalog Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* FILTERS PANEL (Sidebar Desktop / Top Mobile) */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gold-light/20 shadow-sm h-fit space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-gold-light/10">
            <span className="font-serif font-bold text-charcoal flex items-center gap-1.5">
              <SlidersHorizontal className="h-4.5 w-4.5 text-gold-dark" /> Filter Pencarian
            </span>
            <button
              onClick={handleResetFilters}
              className="text-[10px] uppercase font-bold tracking-wider text-gold hover:text-gold-dark"
            >
              Reset All
            </button>
          </div>

          {/* Search Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-charcoal block">Cari Baju / Busana</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Cari nama/bahan busana..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-ivory-light border border-stone-200 focus:border-gold rounded-xl py-2 px-3 pl-9 text-xs focus:outline-none"
              />
              <Search className="h-4 w-4 text-stone-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-charcoal block">Kategori Busana</label>
            <div className="flex flex-col gap-1.5">
              {categories.map((cat) => {
                const count = dresses.filter(
                  (d) => cat.value === 'all' || d.category === cat.value
                ).length;
                const isSelected = selectedCategory === cat.value;

                return (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`w-full flex items-center justify-between py-2 px-3 rounded-xl border text-[11px] font-medium transition-all duration-200 group relative overflow-hidden ${
                      isSelected
                        ? 'bg-gold-light/10 border-gold text-gold-dark font-semibold shadow-xs'
                        : 'bg-stone-50/50 border-stone-200/60 text-stone-600 hover:border-gold-light/60 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 relative z-10">
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${
                        isSelected
                          ? 'border-gold bg-gold text-white scale-110'
                          : 'border-stone-300 bg-white group-hover:border-gold'
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <span>{cat.label}</span>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full relative z-10 transition-all ${
                      isSelected
                        ? 'bg-gold text-white shadow-xs'
                        : 'bg-stone-150 text-stone-500 group-hover:bg-gold-light/20 group-hover:text-gold-dark'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>


          {/* Size Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-charcoal block">Ukuran</label>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="w-full bg-ivory-light border border-stone-200 focus:border-gold rounded-xl py-2 px-3 text-xs focus:outline-none"
            >
              <option value="all">Semua Ukuran</option>
              {sizes.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Color Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-charcoal block">Warna Utama</label>
            <select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-full bg-ivory-light border border-stone-200 focus:border-gold rounded-xl py-2 px-3 text-xs focus:outline-none"
            >
              <option value="all">Semua Warna</option>
              {colors.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

        </div>

        {/* RESULTS GRID */}
        <div className="lg:col-span-3 space-y-6">
          {/* Top Bar (Results count & Sorting) */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl border border-gold-light/10 shadow-sm gap-4">
            <span className="text-xs text-stone-500 font-medium">
              Menampilkan <span className="font-bold text-charcoal">{filteredDresses.length}</span> koleksi busana
            </span>
            
            {/* Sorting Dropdown */}
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <ArrowUpDown className="h-4 w-4 text-stone-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-ivory-light border border-stone-200 focus:border-gold rounded-xl py-1.5 px-3 text-xs focus:outline-none w-full sm:w-44"
              >
                <option value="popular">Tingkat Populer</option>
                <option value="price-asc">Harga: Terendah</option>
                <option value="price-desc">Harga: Tertinggi</option>
                <option value="rating">Rating Klien</option>
              </select>
            </div>
          </div>

          {/* Catalog Cards Grid */}
          {filteredDresses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDresses.map((dress) => (
                <DressCard key={dress.id} dress={dress} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Busana Tidak Ditemukan"
              description="Maaf, tidak ada koleksi busana yang cocok dengan kriteria filter atau tanggal yang Anda tentukan. Silakan sesuaikan filter Anda."
              actionText="Reset Filter"
              onAction={handleResetFilters}
            />
          )}
        </div>

      </div>
    </div>
  );
}
