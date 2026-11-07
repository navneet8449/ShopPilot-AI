import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Product } from '../types/index.ts';
import { ProductCard } from '../components/ProductCard.tsx';
import { 
  Search, 
  SlidersHorizontal, 
  Filter, 
  X, 
  Bot, 
  ArrowUpDown, 
  Sparkles,
  Check
} from 'lucide-react';

export const CatalogView: React.FC = () => {
  const { formatPrice, setInitialChatPrompt, setActiveView } = useApp();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(200000);
  const [minRating, setMinRating] = useState<number>(0);
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    async function loadCatalog() {
      try {
        setLoading(true);
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadCatalog();
  }, []);

  // Compute available brands
  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    products.forEach(p => brands.add(p.brand));
    return Array.from(brands).sort();
  }, [products]);

  // Filter & sort products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Category filter
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }
      // Brand filter
      if (selectedBrand !== 'all' && product.brand !== selectedBrand) {
        return false;
      }
      // Price filter
      if (product.price > maxPrice) {
        return false;
      }
      // Rating filter
      if (product.rating < minRating) {
        return false;
      }
      // In stock
      if (onlyInStock && product.availability !== 'in_stock') {
        return false;
      }
      // Text query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesBrand = product.brand.toLowerCase().includes(q);
        const matchesDesc = product.description.toLowerCase().includes(q);
        const matchesSpecs = Object.values(product.specs).some(v => v.toLowerCase().includes(q));
        if (!matchesName && !matchesBrand && !matchesDesc && !matchesSpecs) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0; // featured default
    });
  }, [products, searchQuery, selectedCategory, selectedBrand, maxPrice, minRating, onlyInStock, sortBy]);

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'laptops', label: 'Laptops' },
    { id: 'smartphones', label: 'Smartphones' },
    { id: 'headphones', label: 'Headphones' },
    { id: 'monitors', label: 'Monitors' },
    { id: 'accessories', label: 'Accessories' }
  ];

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedBrand('all');
    setMaxPrice(200000);
    setMinRating(0);
    setOnlyInStock(false);
    setSortBy('featured');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header with Search and AI Prompt */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Explore Verified Products Catalog
            </h1>
            <p className="text-xs text-slate-500">
              Showing {filteredProducts.length} of {products.length} benchmark devices with real specs and price checks.
            </p>
          </div>

          {/* Ask AI button for this view */}
          <button
            onClick={() => {
              setInitialChatPrompt(searchQuery ? `Find me the best option for "${searchQuery}" in our catalog` : 'Help me pick the best device from the catalog');
              setActiveView('assistant');
            }}
            className="px-4 py-2.5 rounded-2xl bg-[#0B132B] hover:bg-indigo-600 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95 shrink-0 self-start md:self-auto"
          >
            <Bot className="w-4 h-4 text-cyan-400" />
            <span>Ask ShopPilot to Filter</span>
          </button>
        </div>

        {/* Search Bar + Sort row */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by model, brand, processor, OLED, 16GB RAM, noise cancelling..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-transparent border-none text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured Relevance</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="md:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Quick Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === c.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Catalog Layout with Sidebar & Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        
        {/* Desktop Sidebar Filters */}
        <div className={`md:block ${mobileFilterOpen ? 'block' : 'hidden'} md:col-span-1 bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm space-y-6`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">Filters</h3>
            </div>
            <button
              onClick={handleResetFilters}
              className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Reset All
            </button>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Max Budget:</span>
              <span className="font-extrabold text-indigo-600">
                {formatPrice(maxPrice, Math.round(maxPrice / 83))}
              </span>
            </div>
            <input
              type="range"
              min="5000"
              max="200000"
              step="5000"
              value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>₹5,000</span>
              <span>₹1,00,000</span>
              <span>₹2,00,000</span>
            </div>
          </div>

          {/* Brand Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">Brand</label>
            <select
              value={selectedBrand}
              onChange={e => setSelectedBrand(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Brands ({availableBrands.length})</option>
              {availableBrands.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Minimum Rating */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">Customer Rating</label>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              {[
                { val: 0, label: 'All' },
                { val: 4.3, label: '★ 4.3+' },
                { val: 4.7, label: '★ 4.7+' }
              ].map(r => (
                <button
                  key={r.val}
                  onClick={() => setMinRating(r.val)}
                  className={`py-1.5 px-2 rounded-xl font-bold transition-all border ${
                    minRating === r.val
                      ? 'bg-indigo-50 border-indigo-400 text-indigo-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Availability Toggle */}
          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={e => setOnlyInStock(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-pointer"
              />
              <span>In Stock Only</span>
            </label>
          </div>

          {/* AI Tip Callout */}
          <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-[11px] text-slate-600 space-y-1">
            <div className="font-bold text-indigo-900 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Agent Advice</span>
            </div>
            <p>
              Looking for programming? Filter laptops with at least 16GB RAM and multicore processor for smooth IDE execution.
            </p>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="md:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 h-80 animate-pulse flex flex-col justify-between">
                  <div className="w-full h-40 bg-slate-100 rounded-xl mb-3"></div>
                  <div className="space-y-2">
                    <div className="w-2/3 h-4 bg-slate-100 rounded"></div>
                    <div className="w-full h-3 bg-slate-100 rounded"></div>
                  </div>
                  <div className="w-1/3 h-5 bg-slate-100 rounded"></div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-900">No matching products found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try adjusting your filters, expanding your budget limit, or clearing the search keywords.
                </p>
              </div>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl bg-[#0B132B] text-white text-xs font-bold hover:bg-indigo-600 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
