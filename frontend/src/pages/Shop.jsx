import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import SkeletonCard from '../components/SkeletonCard';
import { Search, SlidersHorizontal, RefreshCw, Star, ChevronLeft, ChevronRight, X, ArrowUpDown } from 'lucide-react';

const Shop = ({ filters, setFilters, setSelectedMedicineId, setCurrentPage }) => {
  const { addToCart } = useApp();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(filters.search || '');
  const [category, setCategory] = useState(filters.category || '');
  const [priceMax, setPriceMax] = useState(2500);
  const [rxToggle, setRxToggle] = useState('');
  const [sort, setSort] = useState('priceAsc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const categories = ['Tablets', 'Syrups', 'Vitamins', 'Skincare', 'Devices', 'Baby Care', 'Surgical', 'Ayurvedic'];

  const categoryEmojis = {
    Tablets: '💊', Syrups: '🧪', Vitamins: '🥝', Skincare: '🧴',
    Devices: '🎛️', 'Baby Care': '👶', Surgical: '🩹', Ayurvedic: '🍃'
  };

  useEffect(() => {
    if (filters.category !== undefined) setCategory(filters.category);
    if (filters.search !== undefined) setSearch(filters.search);
    setPage(1);
  }, [filters]);

  const fetchFilteredMedicines = async () => {
    setLoading(true);
    try {
      let url = `/api/medicines?page=${page}&limit=8&sort=${sort}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (category) url += `&category=${encodeURIComponent(category)}`;
      if (priceMax < 2500) url += `&priceMax=${priceMax}`;
      if (rxToggle) url += `&rxRequired=${rxToggle}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setMedicines(data.medicines);
        setTotalPages(data.pagination.pages || 1);
        setTotalCount(data.pagination.total || 0);
      }
    } catch (err) {
      console.error("Error fetching shop data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFilteredMedicines(); }, [page, sort, category, priceMax, rxToggle]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchFilteredMedicines();
  };

  const handleResetFilters = () => {
    setSearch(''); setCategory(''); setPriceMax(2500);
    setRxToggle(''); setSort('priceAsc'); setPage(1);
    setFilters({});
    setShowMobileFilters(false);
  };

  const handleCardClick = (id) => {
    setSelectedMedicineId(id);
    setCurrentPage('detail');
  };

  const activeFiltersCount = [category, rxToggle, priceMax < 2500 ? '1' : ''].filter(Boolean).length;

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Category */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Category</h3>
        <div className="space-y-1.5">
          <button
            onClick={() => { setCategory(''); setPage(1); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${!category ? 'bg-primary text-white font-semibold shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
          >
            All Categories
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); setPage(1); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${category === cat ? 'bg-primary text-white font-semibold shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
            >
              <span>{categoryEmojis[cat]}</span>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Max Price: <span className="text-primary dark:text-secondary font-bold">₹{priceMax}</span>
        </h3>
        <input
          type="range"
          min={50} max={2500} step={50}
          value={priceMax}
          onChange={e => { setPriceMax(Number(e.target.value)); setPage(1); }}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
          <span>₹50</span><span>₹2500</span>
        </div>
      </div>

      {/* Rx Filter */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Prescription</h3>
        <div className="flex flex-col gap-1.5">
          {[['', 'All Medicines'], ['false', 'OTC Only'], ['true', 'Rx Required']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => { setRxToggle(val); setPage(1); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${rxToggle === val ? 'bg-primary text-white font-semibold shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Reset */}
      {activeFiltersCount > 0 && (
        <button
          onClick={handleResetFilters}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-500 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <RefreshCw className="h-4 w-4" /> Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 animate-slide-up">

      {/* Header */}
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white">Medicine Shop</h1>
        <p className="text-slate-400 text-sm">{totalCount > 0 ? `${totalCount} products found` : 'Browse our complete catalog'}</p>
      </div>

      {/* Search + Sort bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearchSubmit} className="flex flex-grow bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1.5 shadow-sm search-glow">
          <div className="flex items-center flex-grow pl-3 gap-2">
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search medicines, brands, salts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-transparent text-slate-700 dark:text-slate-200 text-sm outline-none"
            />
            {search && (
              <button type="button" onClick={() => { setSearch(''); setPage(1); }}>
                <X className="h-4 w-4 text-slate-400 hover:text-red-500" />
              </button>
            )}
          </div>
          <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-semibold btn-scale">
            Search
          </button>
        </form>

        {/* Sort selector */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 shadow-sm">
          <ArrowUpDown className="h-4 w-4 text-slate-400 shrink-0" />
          <select
            value={sort}
            onChange={e => { setSort(e.target.value); setPage(1); }}
            className="bg-transparent text-slate-700 dark:text-slate-200 text-sm outline-none cursor-pointer"
          >
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
            <option value="discount">Best Discount</option>
            <option value="newest">Newest First</option>
          </select>
        </div>

        {/* Mobile filter toggle */}
        <button
          onClick={() => setShowMobileFilters(true)}
          className="md:hidden flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm text-slate-700 dark:text-slate-300 text-sm font-medium"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="px-1.5 py-0.5 bg-primary text-white text-[10px] font-bold rounded-full">{activeFiltersCount}</span>
          )}
        </button>
      </div>

      {/* Active category chip */}
      {category && (
        <div className="flex flex-wrap gap-2 mb-5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary dark:text-secondary dark:bg-secondary/10 text-xs font-semibold rounded-full border border-primary/20 dark:border-secondary/20">
            {categoryEmojis[category]} {category}
            <button onClick={() => { setCategory(''); setPage(1); }}>
              <X className="h-3.5 w-3.5 hover:text-red-500" />
            </button>
          </span>
        </div>
      )}

      {/* Main grid: sidebar + products */}
      <div className="flex gap-7">

        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block w-52 lg:w-60 shrink-0">
          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-5 shadow-sm sticky top-20">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-primary dark:text-secondary" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-primary text-white text-[10px] font-bold rounded-full">{activeFiltersCount}</span>
                )}
              </h2>
            </div>
            <FilterPanel />
          </div>
        </aside>

        {/* Product Grid */}
        <main className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : medicines.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <span className="text-5xl mb-4">🔍</span>
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">No medicines found</h3>
              <p className="text-slate-400 text-sm mb-5">Try changing filters or search query</p>
              <button onClick={handleResetFilters} className="px-5 py-2 bg-primary text-white rounded-xl font-semibold text-sm btn-scale">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {medicines.map((med, i) => (
                <div key={med._id} className="animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                  {/* Medicine Card */}
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm hover-lift group flex flex-col h-full">
                    {/* Image */}
                    <div
                      className="relative h-40 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 overflow-hidden cursor-pointer shrink-0"
                      onClick={() => handleCardClick(med._id)}
                    >
                      <img
                        src={med.image} alt={med.name} loading="lazy"
                        className="w-full h-full object-cover card-img-zoom mix-blend-multiply dark:mix-blend-normal"
                      />
                      {med.discount > 0 && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full shadow">
                          {med.discount}% OFF
                        </span>
                      )}
                      {med.rxRequired && (
                        <span className="absolute top-2 right-2 bg-amber-500 text-white font-bold text-[9px] px-2 py-0.5 rounded-full animate-heartbeat shadow">
                          Rx
                        </span>
                      )}
                      {med.stock < 10 && med.stock > 0 && (
                        <span className="absolute bottom-2 left-2 bg-orange-500 text-white font-bold text-[9px] px-2 py-0.5 rounded-full status-live">
                          Only {med.stock} left
                        </span>
                      )}
                      {med.stock === 0 && (
                        <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
                          <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">Out of Stock</span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 flex flex-col flex-grow">
                      <div className="cursor-pointer" onClick={() => handleCardClick(med._id)}>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{med.brand}</p>
                        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 mt-0.5 line-clamp-1 hover:text-primary dark:hover:text-secondary transition-colors">
                          {med.name}
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1 italic">{med.salt}</p>
                      </div>

                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100 dark:border-slate-700">
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-extrabold text-slate-800 dark:text-white">₹{med.price}</span>
                            {med.discount > 0 && (
                              <span className="text-xs text-slate-400 line-through">₹{med.mrp}</span>
                            )}
                          </div>
                          <div className="flex items-center text-amber-500 text-[10px] gap-0.5 mt-0.5">
                            <Star className="h-3 w-3 fill-amber-500" />
                            <span className="font-semibold">{med.rating}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => addToCart(med._id, 1)}
                          disabled={med.stock === 0}
                          className="px-3.5 py-1.5 bg-primary hover:bg-primary-dark disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-700 text-white rounded-lg font-bold text-xs btn-scale ripple-btn shadow-sm shadow-primary/20 transition-all"
                        >
                          {med.stock === 0 ? 'OOS' : '+ Cart'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-9 h-9 rounded-lg text-sm font-bold transition-all btn-scale ${page === i + 1 ? 'bg-primary text-white shadow-md shadow-primary/30' : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filter Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex items-end md:hidden" onClick={() => setShowMobileFilters(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative w-full bg-white dark:bg-slate-800 rounded-t-3xl p-6 shadow-2xl max-h-[80vh] overflow-y-auto animate-bounce-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-slate-800 dark:text-white">Filters</h2>
              <button onClick={() => setShowMobileFilters(false)}>
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <FilterPanel />
            <button
              onClick={() => setShowMobileFilters(false)}
              className="w-full mt-5 py-3 bg-primary text-white rounded-xl font-bold text-sm btn-scale"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
