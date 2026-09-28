import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { FilterState } from '../../types';
import { Star, Clock, ArrowUpDown, X, Sparkles, Salad, Check, Heart } from 'lucide-react';

export const DIETARY_OPTIONS = [
  { id: 'Vegan', label: 'Vegan', emoji: '🌱' },
  { id: 'Gluten-Free', label: 'Gluten-Free', emoji: '🌾' },
  { id: 'Keto', label: 'Keto', emoji: '🥑' },
  { id: 'High-Protein', label: 'High-Protein', emoji: '💪' },
  { id: 'Dairy-Free', label: 'Dairy-Free', emoji: '🥛' },
  { id: 'Halal', label: 'Halal', emoji: '🍖' },
];

export const FilterBar: React.FC = () => {
  const { filters, setFilters, currentUser } = useAppStore();

  const activeDiets = filters.dietaryPreferences || [];

  const handleVegToggle = () => {
    setFilters((prev) => ({
      ...prev,
      isVeg: prev.isVeg === true ? null : true,
    }));
  };

  const handleFavoritesToggle = () => {
    setFilters((prev) => ({
      ...prev,
      onlyFavorites: !prev.onlyFavorites,
    }));
  };

  const handleRatingToggle = (val: number) => {
    setFilters((prev) => ({
      ...prev,
      rating: prev.rating === val ? 0 : val,
    }));
  };

  const handleTimeToggle = (val: number) => {
    setFilters((prev) => ({
      ...prev,
      maxDeliveryTime: prev.maxDeliveryTime === val ? 60 : val,
    }));
  };

  const handleDietaryToggle = (dietId: string) => {
    setFilters((prev) => {
      const current = prev.dietaryPreferences || [];
      const exists = current.includes(dietId);
      const next = exists ? current.filter((d) => d !== dietId) : [...current, dietId];
      return {
        ...prev,
        dietaryPreferences: next,
        dietaryPreference: next.length === 1 ? next[0] : next.length === 0 ? 'all' : next.join(','),
      };
    });
  };

  const clearDietaryOnly = () => {
    setFilters((prev) => ({
      ...prev,
      dietaryPreferences: [],
      dietaryPreference: 'all',
    }));
  };

  const hasActiveFilters =
    filters.cuisine !== 'all' ||
    filters.rating > 0 ||
    filters.maxDeliveryTime < 60 ||
    filters.isVeg !== null ||
    !!filters.onlyFavorites ||
    activeDiets.length > 0 ||
    filters.searchQuery !== '';

  const clearAllFilters = () => {
    setFilters({
      cuisine: 'all',
      rating: 0,
      maxDeliveryTime: 60,
      priceRange: 'all',
      isVeg: null,
      dietaryPreference: 'all',
      dietaryPreferences: [],
      onlyFavorites: false,
      sortBy: 'popular',
      searchQuery: '',
    });
  };

  return (
    <div className="space-y-3 my-4">
      {/* Row 1: Primary Discovery Controls & Sorting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2">
        {/* Quick Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Favorites Filter */}
          <button
            onClick={handleFavoritesToggle}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              filters.onlyFavorites
                ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-rose-400'
            }`}
            title="Show only bookmarked favorite restaurants"
          >
            <Heart
              className={`w-3.5 h-3.5 ${
                filters.onlyFavorites ? 'fill-white text-white' : 'text-rose-500 fill-rose-500/20'
              }`}
            />
            <span>Favorites</span>
            {currentUser.favorites.length > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none ${
                  filters.onlyFavorites
                    ? 'bg-white/25 text-white'
                    : 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                }`}
              >
                {currentUser.favorites.length}
              </span>
            )}
          </button>

          {/* Pure Veg Toggle */}
          <button
            onClick={handleVegToggle}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              filters.isVeg === true
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-emerald-500'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white" />
            <span>Pure Veg</span>
          </button>

          {/* Rating 4.0+ */}
          <button
            onClick={() => handleRatingToggle(4.0)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              filters.rating === 4.0
                ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-amber-400'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>Ratings 4.0+</span>
          </button>

          {/* Quick Delivery Under 30 min */}
          <button
            onClick={() => handleTimeToggle(30)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              filters.maxDeliveryTime === 30
                ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-orange-400'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Under 30 mins</span>
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1 text-xs text-rose-500 font-semibold hover:underline px-2"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset All</span>
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-stone-400 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Sort:</span>
          </span>
          <select
            value={filters.sortBy}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                sortBy: e.target.value as FilterState['sortBy'],
              }))
            }
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-orange-500"
          >
            <option value="popular">Popularity & Rating</option>
            <option value="deliveryTime">Fastest Delivery</option>
            <option value="costLowHigh">Cost: Low to High</option>
            <option value="costHighLow">Cost: High to Low</option>
          </select>
        </div>
      </div>

      {/* Row 2: Dietary Preferences Filter System */}
      <div className="p-3 bg-stone-100/80 dark:bg-stone-800/40 rounded-2xl border border-stone-200/80 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 mr-1 text-xs font-bold text-stone-700 dark:text-stone-300">
            <Salad className="w-4 h-4 text-emerald-500" />
            <span>Dietary Preferences:</span>
          </div>

          {DIETARY_OPTIONS.map((diet) => {
            const isSelected = activeDiets.includes(diet.id);
            return (
              <button
                key={diet.id}
                onClick={() => handleDietaryToggle(diet.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-105'
                    : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-emerald-400 dark:hover:border-emerald-600'
                }`}
                title={`Filter restaurants offering ${diet.label}`}
              >
                <span>{diet.emoji}</span>
                <span>{diet.label}</span>
                {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
              </button>
            );
          })}
        </div>

        {activeDiets.length > 0 && (
          <button
            onClick={clearDietaryOnly}
            className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 hover:text-rose-500 flex items-center gap-1 transition-colors"
          >
            <X className="w-3 h-3" />
            <span>Clear Dietary ({activeDiets.length})</span>
          </button>
        )}
      </div>
    </div>
  );
};
