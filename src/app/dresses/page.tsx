'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, SlidersHorizontal, Calendar, ArrowUpDown } from 'lucide-react';
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
  const [checkDate, setCheckDate] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('popular');

  // Dynamic categories based on active dresses in inventory
  const categories = useMemo(() => {
    const activeCats = isMounted ? dresses.map(d => d.category).filter(Boolean) : [];
    const uniqueCats = Array.from(new Set(activeCats));

    const labelMapping: Record<string, string> = {
      'Gaun Pengantin Modern': 'Gaun Modern',
      'Kebaya Pengantin': 'Kebaya Pengantin',
      'Baju Adat': 'Baju Adat',
      'Jas Pengantin Pria': 'Jas Pria',
      'Bridesmaid': 'Bridesmaid',
      'Family Dress': 'Family Dress'
    };

    const items = uniqueCats.map(cat => ({
      label: labelMapping[cat] || cat,
      value: cat
    }));

    return [
      { label: 'Semua Koleksi', value: 'all' },
      ...items
    ];
  }, [dresses, isMounted]);

  // Dynamic sizes based on available dresses
  const sizes = useMemo(() => {
    const defaultSizes = ['S', 'M', 'L', 'XL', 'XXL'];
    const activeSizes = isMounted ? dresses.flatMap(d => d.sizes || []) : [];
    const unique = Array.from(new Set([
      ...defaultSizes,
      ...activeSizes.map(s => s.trim().toUpperCase())
    ].filter(Boolean)));

    const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
    return unique.sort((a, b) => {
      const idxA = sizeOrder.indexOf(a);
      const idxB = sizeOrder.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [dresses, isMounted]);

  // Dynamic colors based on available dresses
  const colors = useMemo(() => {
    const defaultColors = ['Ivory', 'White', 'Champagne', 'Gold', 'Nude', 'Red', 'Green', 'Gray', 'Black'];
    const activeColors = isMounted ? dresses.flatMap(d => d.colors || []) : [];
    const unique = Array.from(new Set([
      ...defaultColors,
      ...activeColors.map(c => {
        const trimmed = c.trim();
        return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
      })
    ].filter(Boolean)));
    
    return unique.sort((a, b) => a.localeCompare(b));
  }, [dresses, isMounted]);

  // Apply filters
  const filteredDresses = useMemo(() => {
    return dresses.filter((dress) => {
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
        dress.colors.some((color) => color.toLowerCase().includes(selectedColor.toLowerCase()));

      // 5. Date Availability Check
      // If a date is selected, check if it's available (i.e. present in dress.availableDates)
      const matchDate =
        !checkDate || dress.availableDates.includes(checkDate);

      return matchSearch && matchCategory && matchSize && matchColor && matchDate;
    }).sort((a, b) => {
      // Sorting
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      // Default: popular / rating count
      return b.reviewCount - a.reviewCount;
    });
  }, [searchQuery, selectedCategory, selectedSize, selectedColor, checkDate, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedSize('all');
    setSelectedColor('all');
    setCheckDate('');
    setSortBy('popular');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-charcoal">Koleksi Gaun Pengantin</h1>
        <p className="text-xs text-stone-muted">
          Sewa gaun pengantin modern, kebaya eksklusif, baju adat nusantara, dan setelan jas pengantin pria premium.
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
            <label className="text-xs font-semibold text-charcoal block">Cari Gaun</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Cari nama/bahan gaun..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-ivory-light border border-stone-200 focus:border-gold rounded-xl py-2 px-3 pl-9 text-xs focus:outline-none"
              />
              <Search className="h-4 w-4 text-stone-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-charcoal block">Kategori</label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`text-[10px] px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
                    selectedCategory === cat.value
                      ? 'bg-gold border-gold text-white shadow-sm'
                      : 'bg-white border-stone-200 text-stone-600 hover:border-gold-light'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Picker Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-charcoal block flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-gold-dark" /> Cek Tanggal Acara
            </label>
            <input
              type="date"
              value={checkDate}
              onChange={(e) => setCheckDate(e.target.value)}
              className="w-full bg-ivory-light border border-stone-200 focus:border-gold rounded-xl py-2 px-3 text-xs focus:outline-none"
            />
            <p className="text-[10px] text-stone-400 italic">Hanya tampilkan gaun yang free di tanggal ini.</p>
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
              {!isMounted ? (
                <span className="inline-block w-36 h-4 bg-stone-150 animate-pulse rounded-md align-middle" />
              ) : (
                <>
                  Menampilkan <span className="font-bold text-charcoal">{filteredDresses.length}</span> gaun pengantin
                </>
              )}
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
          {!isMounted ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="bg-white rounded-3xl overflow-hidden border border-gold-light/10 shadow-sm animate-pulse space-y-4 p-5">
                  <div className="aspect-[3/4] bg-stone-150 rounded-2xl w-full" />
                  <div className="space-y-2">
                    <div className="h-4.5 bg-stone-150 rounded-md w-3/4" />
                    <div className="h-3.5 bg-stone-150 rounded-md w-1/2" />
                    <div className="h-5 bg-stone-150 rounded-md w-1/3 pt-1" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredDresses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDresses.map((dress) => (
                <DressCard key={dress.id} dress={dress} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Gaun Tidak Ditemukan"
              description="Maaf, tidak ada gaun pengantin yang cocok dengan kriteria filter atau tanggal yang Anda tentukan. Silakan sesuaikan filter Anda."
              actionText="Reset Filter"
              onAction={handleResetFilters}
            />
          )}
        </div>

      </div>
    </div>
  );
}
