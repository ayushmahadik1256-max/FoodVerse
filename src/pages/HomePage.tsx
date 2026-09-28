import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { MOCK_CATEGORIES } from '../data/mockData';
import { Hero3DScene } from '../three/Hero3DScene';
import { CuisineCategoryBar } from '../components/food/CuisineCategoryBar';
import { FilterBar } from '../components/food/FilterBar';
import { RestaurantCard } from '../components/food/RestaurantCard';
import { DishCard } from '../components/food/DishCard';
import { RestaurantDiscoveryMap } from '../components/food/RestaurantDiscoveryMap';
import { HandsScrollSequence } from '../components/HandsScrollSequence';
import {
  Sparkles,
  Utensils,
  Award,
  Flame,
  ArrowRight,
  Heart,
  LayoutGrid,
  MapPin,
  Compass,
} from 'lucide-react';

interface HomePageProps {
  onSelectRestaurant: (restaurantId: string) => void;
  onExploreDishes: () => void;
  onViewFavorites?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onSelectRestaurant, onViewFavorites }) => {
  const { restaurants, menuItems, currentUser, filters, setFilters } = useAppStore();
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [headingTilt, setHeadingTilt] = useState<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });

  const handleHeadingMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setHeadingTilt({ x: -(y * 14), y: x * 16, active: true });
  };

  const handleHeadingMouseLeave = () => {
    setHeadingTilt({ x: 0, y: 0, active: false });
  };

  // Favorite restaurants for current user
  const favoriteRestaurants = restaurants.filter(
    (r) => r.isApproved && currentUser.favorites.includes(r.id)
  );

  // Filter restaurants
  const filteredRestaurants = restaurants.filter((r) => {
    if (!r.isApproved) return false;
    if (filters.onlyFavorites && !currentUser.favorites.includes(r.id)) {
      return false;
    }
    if (filters.cuisine !== 'all' && !r.cuisines.some((c) => c.toLowerCase().includes(filters.cuisine.toLowerCase()))) {
      return false;
    }
    if (filters.rating > 0 && r.rating < filters.rating) return false;
    if (filters.maxDeliveryTime < 60 && r.deliveryTime > filters.maxDeliveryTime) return false;
    if (filters.isVeg === true && !r.isVegOnly) {
      // Check if it has veg items
      const hasVegItems = menuItems.some((m) => m.restaurantId === r.id && m.isVeg);
      if (!hasVegItems) return false;
    }
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const matchesRest = r.name.toLowerCase().includes(q) || r.cuisines.some((c) => c.toLowerCase().includes(q));
      const matchesMenu = menuItems.some((m) => m.restaurantId === r.id && m.name.toLowerCase().includes(q));
      if (!matchesRest && !matchesMenu) return false;
    }

    // Dietary preference filtering (e.g. Vegan, Gluten-Free, Keto, High-Protein, Dairy-Free, Halal)
    const activeDietary =
      filters.dietaryPreferences && filters.dietaryPreferences.length > 0
        ? filters.dietaryPreferences
        : filters.dietaryPreference && filters.dietaryPreference !== 'all'
        ? [filters.dietaryPreference]
        : [];

    if (activeDietary.length > 0) {
      const restDiets = (r.dietaryPreferences || []).map((d) => d.toLowerCase());
      const matchesAllDiets = activeDietary.every((diet) => {
        const dLower = diet.toLowerCase();
        // Check restaurant level tags
        if (restDiets.some((rd) => rd.includes(dLower))) return true;
        if (dLower === 'vegan' && r.isVegOnly) return true;
        // Check menu item level tags
        return menuItems.some(
          (m) =>
            m.restaurantId === r.id &&
            ((m.dietaryPreferences || []).some((md) => md.toLowerCase().includes(dLower)) ||
              (dLower === 'vegan' && (m.name.toLowerCase().includes('vegan') || m.description.toLowerCase().includes('vegan'))) ||
              (dLower === 'gluten-free' && (m.name.toLowerCase().includes('gluten-free') || m.description.toLowerCase().includes('gluten-free'))) ||
              (dLower === 'keto' && (m.name.toLowerCase().includes('keto') || m.description.toLowerCase().includes('keto'))))
        );
      });
      if (!matchesAllDiets) return false;
    }

    return true;
  });

  // Sort restaurants
  const sortedRestaurants = [...filteredRestaurants].sort((a, b) => {
    if (filters.sortBy === 'deliveryTime') return a.deliveryTime - b.deliveryTime;
    if (filters.sortBy === 'costLowHigh') return a.priceForTwo - b.priceForTwo;
    if (filters.sortBy === 'costHighLow') return b.priceForTwo - a.priceForTwo;
    return b.rating - a.rating;
  });

  // Featured signature dishes for spotlight section
  const featuredDishes = menuItems.filter((item) => item.isBestSeller || item.rating >= 4.8);

  // Dedicated Sweets delicacies
  const sweetItems = menuItems.filter(
    (item) => item.category === 'Sweets' || item.category === 'Mithai & Desserts'
  );

  return (
    <div className="space-y-12 pb-16">
      <HandsScrollSequence />

      {/* 1. HERO SECTION WITH FRESH GOURMET SHOWCASE */}
      <section className="relative pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-6">
            {/* 3D Perspective Container with Reactive Hover Tilt */}
            <div className="perspective-1000 group/title-container w-full transition-transform duration-500 ease-out hover:[transform:perspective(1000px)_rotateX(2.5deg)_rotateY(-3deg)] transform-gpu">
              {/* 3D Title Div with Infinite Floating Animation and Mouse Parallax */}
              <div
                onMouseMove={handleHeadingMouseMove}
                onMouseLeave={handleHeadingMouseLeave}
                style={{
                  transform: headingTilt.active
                    ? `perspective(1000px) rotateX(${headingTilt.x}deg) rotateY(${headingTilt.y}deg) scale3d(1.025, 1.025, 1.025)`
                    : 'perspective(1000px) rotateX(1.5deg) rotateY(-1.2deg)',
                  transition: headingTilt.active
                    ? 'transform 0.12s ease-out'
                    : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                  transformStyle: 'preserve-3d',
                }}
                className="relative group p-1 -m-1 rounded-3xl cursor-default animate-in fade-in zoom-in duration-1000 animate-float-3d"
              >
                {/* Dynamic 3D Ambient Glow Orb */}
                <div
                  className="ambient-glow-orb w-64 h-36 bg-gradient-to-r from-orange-500/20 via-amber-500/25 to-rose-500/15 -top-6 -left-6"
                  style={{
                    transform: headingTilt.active
                      ? `translate3d(${headingTilt.y * 3}px, ${-headingTilt.x * 3}px, 0)`
                      : 'none',
                  }}
                />

                {/* Floating 3D Badge */}
                <div className="relative inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-gradient-to-r from-orange-500/15 via-amber-500/20 to-rose-500/15 text-orange-600 dark:text-orange-400 border border-orange-300/80 dark:border-orange-500/30 text-xs font-black shadow-lg shadow-orange-500/10 backdrop-blur-md mb-3 transform hover:scale-105 transition-transform">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                  <span>India's Premium Gourmet FoodVerse</span>
                  <span className="px-1.5 py-0.5 rounded bg-orange-500 text-white text-[10px] font-black uppercase">140+ Dishes</span>
                </div>

                {/* 3D Extruded Heading */}
                <h1 className="relative text-3xl sm:text-4xl md:text-5xl lg:text-[3.45rem] font-black tracking-tight leading-[1.07] select-none">
                  <span className="block text-stone-900 dark:text-stone-100 text-3d-title drop-shadow-sm">
                    Taste The
                  </span>
                  <span className="block text-3d-gradient mt-1">
                    Extraordinary.
                  </span>
                  <span className="block text-stone-900 dark:text-stone-100 text-3d-title text-2xl sm:text-3xl md:text-4xl lg:text-[2.65rem] font-extrabold mt-1">
                    Delivered in <span className="text-orange-500 underline decoration-orange-400 decoration-wavy decoration-3 underline-offset-8">3D Real-Time</span>.
                  </span>
                </h1>
              </div>
            </div>

            <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base leading-relaxed">
              Indulge in royal dum biryanis, authentic clay-oven butter chicken, crisp ghee roast dosas, smash burgers, and decadent mithai. Inspect authentic ingredients, live courier dispatch, and enjoy instant loyalty savings.
            </p>

            {/* 3D Interactive Flavor Badges */}
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() => {
                  setFilters((prev) => ({ ...prev, cuisine: 'Sweets' }));
                  const el = document.getElementById('cuisines-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/10 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/50 text-amber-800 dark:text-amber-200 text-xs font-black shadow-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>🍯 Royal Sweets ({sweetItems.length} Delicacies)</span>
              </button>
              <span className="px-3 py-1 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/80 text-orange-700 dark:text-orange-300 text-xs font-bold shadow-xs">
                🍛 Dum Handi Biryani
              </span>
              <span className="px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-700 dark:text-amber-300 text-xs font-bold shadow-xs">
                🧈 Pure Desi Ghee
              </span>
              <span className="px-3 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 text-xs font-bold shadow-xs">
                🍕 Woodfired Sourdough
              </span>
              <span className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold shadow-xs">
                🪙 ₹1 = 1 Pt Rewards
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  const el = document.getElementById('restaurants-grid');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-5 sm:px-6 py-3 sm:py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm shadow-xl shadow-orange-500/25 transition-all flex items-center gap-2 active:scale-95"
              >
                <span>Order Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('cuisines-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-5 sm:px-6 py-3 sm:py-3.5 rounded-2xl bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold text-xs sm:text-sm border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700 transition-all flex items-center gap-2 shadow-sm"
              >
                <Utensils className="w-4 h-4 text-orange-500" />
                <span>Explore Cuisines</span>
              </button>

              <button
                onClick={() => {
                  setViewMode('map');
                  const el = document.getElementById('restaurants-grid');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-5 sm:px-6 py-3 sm:py-3.5 rounded-2xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-bold text-xs sm:text-sm border border-orange-200 dark:border-orange-800/60 transition-all flex items-center gap-2 shadow-sm"
              >
                <MapPin className="w-4 h-4 text-orange-500" />
                <span>Proximity Map</span>
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 border-t border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300">
              <div>
                <div className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100">25m</div>
                <div className="text-[10px] sm:text-[11px] text-stone-400">Avg Delivery</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100">4.9★</div>
                <div className="text-[10px] sm:text-[11px] text-stone-400">Customer Rating</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100">100%</div>
                <div className="text-[10px] sm:text-[11px] text-stone-400">Fresh Prepared</div>
              </div>
            </div>
          </div>

          {/* Interactive 3D Canvas Scene */}
          <div className="lg:col-span-7">
            <Hero3DScene
              onFoodSelect={(foodName) => {
                setFilters((prev) => ({ ...prev, searchQuery: foodName.split(' ')[0] }));
              }}
            />
          </div>
        </div>
      </section>

      {/* 2. EXPLORE BY CUISINE (Clean, Fast & Fully Responsive) */}
      <section id="cuisines-section" className="scroll-mt-24">
        <CuisineCategoryBar
          categories={MOCK_CATEGORIES}
          selectedCuisine={filters.cuisine}
          onSelectCategory={(cuisineName) => {
            setFilters((prev) => ({
              ...prev,
              cuisine: cuisineName,
            }));
          }}
        />
      </section>

      {/* DEDICATED ROYAL SWEETS & HERITAGE MITHAI SHOWCASE (27+ Delicacies) */}
      <section id="sweets-showcase-section" className="space-y-4 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent dark:from-amber-950/30 dark:via-stone-900 dark:to-transparent p-5 rounded-3xl border border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-amber-500/25">
              🍯
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100">
                  Royal Sweets & Heritage Mithai
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm">
                  {sweetItems.length} Delicacies
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Pure Desi Gir cow ghee confections, melt-in-mouth Kaju Katli, saffron Rasmalai, and artisan festive boxes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setFilters((prev) => ({
                  ...prev,
                  cuisine: prev.cuisine === 'Sweets' ? 'all' : 'Sweets',
                }));
                const el = document.getElementById('restaurants-grid');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm ${
                filters.cuisine === 'Sweets'
                  ? 'bg-amber-500 text-white ring-2 ring-amber-500/30 shadow-amber-500/25'
                  : 'bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-amber-400'
              }`}
            >
              <span>{filters.cuisine === 'Sweets' ? '✓ Showing Sweets Kitchens' : 'View Sweets Kitchens'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Sweets Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {sweetItems.slice(0, 8).map((item) => (
            <DishCard key={item.id} item={item} />
          ))}
        </div>

        {sweetItems.length > 8 && (
          <div className="text-center pt-2">
            <button
              onClick={() => {
                setFilters((prev) => ({ ...prev, cuisine: 'Sweets' }));
                const el = document.getElementById('restaurants-grid');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold transition-all shadow-md shadow-amber-500/25 hover:shadow-lg hover:shadow-amber-500/35 hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer"
            >
              <span>Explore All {sweetItems.length} Royal Sweets & Confectioneries</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>

      {/* 3. FEATURED SIGNATURE CREATIONS (with photo detail modal) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-stone-900 dark:text-stone-100">
                Chef's Signature Creations
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Tap 'View Photo' on any creation to inspect authentic photos, ingredients, and nutritional breakdown
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredDishes.slice(0, 4).map((item) => (
            <DishCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* 4. FAVORITE RESTAURANTS SECTION (On HomePage) */}
      {favoriteRestaurants.length > 0 && !filters.onlyFavorites && (
        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-extrabold text-stone-900 dark:text-stone-100">
                    Your Favorite Kitchens
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                    {favoriteRestaurants.length} saved
                  </span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Quick access to your bookmarked culinary destinations
                </p>
              </div>
            </div>

            {onViewFavorites && (
              <button
                onClick={onViewFavorites}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 font-bold text-xs border border-rose-200 dark:border-rose-800 transition-colors group"
              >
                <span>Manage in Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteRestaurants.slice(0, 3).map((restaurant) => (
              <RestaurantCard
                key={`fav_${restaurant.id}`}
                restaurant={restaurant}
                onClick={() => onSelectRestaurant(restaurant.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* 5. RESTAURANTS LIST WITH FILTERS & TOGGLEABLE MAP VIEW */}
      <section id="restaurants-grid" className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-stone-900 dark:text-stone-100">
                Top Gourmet Kitchens ({sortedRestaurants.length})
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Handcrafted menus curated for discerning tastes
              </p>
            </div>
          </div>

          {/* View Mode Toggle (Grid vs Leaflet Map) */}
          <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-2xl border border-stone-200 dark:border-stone-700 self-start sm:self-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid View</span>
            </button>

            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'map'
                  ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/25'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Interactive Map</span>
            </button>
          </div>
        </div>

        {/* Filter Controls (Available in both views) */}
        <FilterBar />

        {/* Active Favorites Filter Banner */}
        {filters.onlyFavorites && (
          <div className="flex items-center justify-between bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-2xl px-4 py-2.5 my-3 text-xs">
            <div className="flex items-center gap-2 text-rose-900 dark:text-rose-200">
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              <span className="font-bold">Showing Bookmarked Favorites Only:</span>
              <span className="text-rose-600 dark:text-rose-400 font-medium">
                ({sortedRestaurants.length} kitchen{sortedRestaurants.length === 1 ? '' : 's'})
              </span>
            </div>
            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  onlyFavorites: false,
                }))
              }
              className="text-rose-700 dark:text-rose-400 hover:underline font-bold text-[11px]"
            >
              Show All Kitchens
            </button>
          </div>
        )}

        {/* Active Dietary Filter Summary Badge */}
        {filters.dietaryPreferences && filters.dietaryPreferences.length > 0 && (
          <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl px-4 py-2.5 my-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
              <span className="font-bold">Active Dietary Filtering:</span>
              <div className="flex flex-wrap gap-1.5">
                {filters.dietaryPreferences.map((d) => (
                  <span
                    key={d}
                    className="px-2 py-0.5 rounded-lg bg-emerald-600 text-white font-semibold text-[11px]"
                  >
                    {d}
                  </span>
                ))}
              </div>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                ({sortedRestaurants.length} kitchen{sortedRestaurants.length === 1 ? '' : 's'} match)
              </span>
            </div>
            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  dietaryPreferences: [],
                  dietaryPreference: 'all',
                }))
              }
              className="text-emerald-700 dark:text-emerald-400 hover:underline font-bold text-[11px]"
            >
              Clear
            </button>
          </div>
        )}

        {/* Map View vs Grid View Render */}
        {viewMode === 'map' ? (
          <RestaurantDiscoveryMap
            restaurants={sortedRestaurants}
            onSelectRestaurant={onSelectRestaurant}
          />
        ) : sortedRestaurants.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-2xl mb-3">
              {filters.onlyFavorites ? '💔' : '🔍'}
            </div>
            <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200">
              {filters.onlyFavorites ? 'No bookmarked favorites found' : 'No restaurants match your filters'}
            </h3>
            <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
              {filters.onlyFavorites
                ? 'Tap the heart icon on any restaurant card to save your favorite eateries here.'
                : 'Try adjusting your search query, easing dietary tags, or resetting all filters.'}
            </p>
            <button
              onClick={() =>
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
                })
              }
              className="mt-4 px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                onClick={() => onSelectRestaurant(restaurant.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
