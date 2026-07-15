'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, ArrowUpDown } from 'lucide-react';
import { useDresses } from '@/data/db';
import { DressCategory } from '@/types';
import DressCard from '@/components/DressCard';
import EmptyState from '@/components/ui/EmptyState';
import Breadcrumb from '@/components/Breadcrumb';
import { Button } from '@/components/ui/button';

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

        return matchSearch && matchCategory && matchSize;
      })
      .sort((a, b) => {
        // Sorting
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return b.reviewCount - a.reviewCount;
      });
  }, [dresses, searchQuery, selectedCategory, selectedSize, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedSize('all');
    setSortBy('popular');
  };

  // Render Skeleton during SSR and initial client hydration to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header Skeleton */}
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="h-10 bg-muted/20 animate-pulse rounded-md w-3/4 mx-auto" />
          <div className="h-4 bg-muted/20 animate-pulse rounded-md w-5/6 mx-auto" />
        </div>

        {/* Main Catalog Layout Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Skeleton */}
          <div className="lg:col-span-1 lg:sticky lg:top-24 bg-card p-6 rounded-2xl border border-border shadow-sm h-fit space-y-6 animate-pulse">
            <div className="h-6 bg-muted/20 rounded w-1/2" />
            <div className="space-y-2">
              <div className="h-4 bg-muted/20 rounded w-1/3" />
              <div className="h-8 bg-muted/20 rounded w-full" />
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-muted/20 rounded w-1/3" />
              <div className="flex gap-2 flex-wrap">
                <div className="h-7 bg-muted/20 rounded w-16" />
                <div className="h-7 bg-muted/20 rounded w-20" />
                <div className="h-7 bg-muted/20 rounded w-24" />
              </div>
            </div>
          </div>

          {/* Results Skeleton */}
          <div className="lg:col-span-3 space-y-6">
            <div className="h-12 bg-card rounded-xl border border-border shadow-sm animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="bg-card rounded-3xl overflow-hidden border border-border shadow-sm p-5 space-y-4 animate-pulse">
                  <div className="aspect-[3/4] bg-muted/20 rounded-2xl w-full" />
                  <div className="space-y-2">
                    <div className="h-4 bg-muted/20 rounded-md w-3/4" />
                    <div className="h-3 bg-muted/20 rounded-md w-1/2" />
                    <div className="h-5 bg-muted/20 rounded-md w-1/3" />
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Breadcrumb & Header */}
      <div className="space-y-2">
        <Breadcrumb />
        <div className="text-center max-w-xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-foreground">Koleksi Sewa Baju & Busana</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Sewa gaun pengantin modern, kebaya eksklusif, baju adat nusantara, setelan jas pria premium, dan busana keluarga.
          </p>
        </div>
      </div>

      {/* Main Catalog Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* FILTERS PANEL (Sidebar Desktop / Top Mobile) */}
        <div className="lg:col-span-1 lg:sticky lg:top-24 bg-card p-6 rounded-2xl border border-border shadow-sm h-fit space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-border">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Filter</h3>
            <button
              onClick={handleResetFilters}
              className="text-[10px] uppercase font-bold tracking-wider text-primary hover:text-primary/80 transition-colors"
            >
              Reset All
            </button>
          </div>

          {/* Search Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/80 block">Cari Baju / Busana</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Cari nama/bahan busana..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-muted/20 border border-border focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-xl py-2 px-3 pl-9 text-xs focus:outline-none placeholder:text-muted-foreground/50 text-foreground"
              />
              <Search className="h-4 w-4 text-muted-foreground/60 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground/80 block">Kategori Busana</label>
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
                        ? 'bg-primary/5 border-primary text-primary font-semibold shadow-xs'
                        : 'bg-muted/10 border-border text-muted-foreground hover:border-primary/45 hover:bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 relative z-10">
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${
                        isSelected
                          ? 'border-primary bg-primary text-primary-foreground scale-110'
                          : 'border-muted bg-background group-hover:border-primary'
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-background" />}
                      </div>
                      <span className="text-foreground/90">{cat.label}</span>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full relative z-10 transition-all ${
                      isSelected
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/80 block">Ukuran</label>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="w-full bg-muted/20 border border-border focus:border-primary rounded-xl py-2 px-3 text-xs focus:outline-none text-foreground"
            >
              <option value="all">Semua Ukuran</option>
              {sizes.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

        </div>

        {/* RESULTS GRID */}
        <div className="lg:col-span-3 space-y-6">
          {/* Top Bar (Results count & Sorting) */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm gap-4">
            <span className="text-xs text-muted-foreground font-medium">
              Menampilkan <span className="font-bold text-foreground">{filteredDresses.length}</span> koleksi busana
            </span>
            
            {/* Sorting Dropdown */}
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground/60" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-muted/20 border border-border focus:border-primary rounded-xl py-1.5 px-3 text-xs focus:outline-none w-full sm:w-44 text-foreground"
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
              description="Maaf, tidak ada koleksi busana yang cocok dengan kriteria filter Anda. Silakan reset filter."
              actionText="Reset Filter"
              onAction={handleResetFilters}
            />
          )}
        </div>

      </div>
    </div>
  );
}
