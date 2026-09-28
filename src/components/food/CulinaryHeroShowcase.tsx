import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Star, Flame, Clock, Plus, Eye, Check, Sparkles } from 'lucide-react';

interface ShowcaseDish {
  id: string;
  name: string;
  category: string;
  tabLabel: string;
  icon: string;
  price: number;
  rating: number;
  calories: number;
  prepTime: string;
  image: string;
  description: string;
  tags: string[];
}

const SHOWCASE_DISHES: ShowcaseDish[] = [
  {
    id: 'menu_11',
    name: 'Royal Shahi Dum Mutton Biryani',
    category: 'Biryani',
    tabLabel: 'Shahi Biryani',
    icon: '🍲',
    price: 499,
    rating: 4.9,
    calories: 720,
    prepTime: '25-30 min',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
    description: 'Aged long-grain Basmati rice dum-cooked in sealed clay handi with saffron, whole aromatic spices, and melt-in-mouth tender cuts.',
    tags: ['Clay Handi', 'Kashmiri Saffron', 'Tender Cuts'],
  },
  {
    id: 'menu_1',
    name: 'Classic Double Smash Cheeseburger',
    category: 'Burgers',
    tabLabel: 'Smash Burger',
    icon: '🍔',
    price: 349,
    rating: 4.9,
    calories: 680,
    prepTime: '15-20 min',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
    description: 'Two seared prime beef patties, double American cheddar, caramelized onions, dill pickles, and signature house sauce on toasted brioche.',
    tags: ['Prime Beef', 'Aged Cheddar', 'Crispy Brioche'],
  },
  {
    id: 'menu_5',
    name: 'Truffle Burrata & Wild Mushroom Pizza',
    category: 'Pizza',
    tabLabel: 'Truffle Pizza',
    icon: '🍕',
    price: 529,
    rating: 4.9,
    calories: 780,
    prepTime: '18-22 min',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
    description: 'Hand-stretched sourdough, roasted wild porcini mushrooms, creamy whole burrata heart, and cold-pressed white truffle glaze.',
    tags: ['Sourdough', 'Whole Burrata', 'Truffle Glaze'],
  },
  {
    id: 'menu_17',
    name: 'Crispy Carnitas Street Tacos (Trio)',
    category: 'Mexican',
    tabLabel: 'Street Tacos',
    icon: '🌮',
    price: 349,
    rating: 4.8,
    calories: 520,
    prepTime: '12-15 min',
    image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&auto=format&fit=crop&q=80',
    description: 'Triple soft-shell corn tortillas filled with slow-cooked shredded pork, charred pineapple relish, salsa verde, and fresh cilantro.',
    tags: ['Handmade Tortillas', 'Slow Braised', 'Salsa Verde'],
  },
  {
    id: 'menu_21',
    name: 'Glazed Belgian Dark Chocolate Donut',
    category: 'Desserts',
    tabLabel: 'Artisan Donut',
    icon: '🍩',
    price: 189,
    rating: 4.9,
    calories: 420,
    prepTime: '5-10 min',
    image: 'https://images.unsplash.com/photo-1527515862127-a4fc05baf7a5?w=800&auto=format&fit=crop&q=80',
    description: 'Fluffy 24-hr fermented brioche dough dipped in 70% Belgian dark chocolate ganache, topped with gold leaf dust and sea salt flakes.',
    tags: ['70% Belgian Cocoa', '24-hr Brioche', 'Sea Salt Flakes'],
  },
  {
    id: 'menu_23',
    name: 'Warm Gulab Jamun with Malai Rabri',
    category: 'Sweets',
    tabLabel: 'Shahi Sweets',
    icon: '🍯',
    price: 159,
    rating: 4.95,
    calories: 420,
    prepTime: '5-8 min',
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&auto=format&fit=crop&q=80',
    description: 'Slow-fried soft khoya spheres immersed in saffron rose-cardamom syrup, served with chilled creamy malai rabri and pistachio flakes.',
    tags: ['Pure Desi Ghee', 'Kashmiri Saffron', 'Chilled Rabri'],
  },
];

interface CulinaryHeroShowcaseProps {
  onFoodSelect?: (foodName: string) => void;
}

export const CulinaryHeroShowcase: React.FC<CulinaryHeroShowcaseProps> = ({ onFoodSelect }) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [added, setAdded] = useState<boolean>(false);
  const [isAutoCycling, setIsAutoCycling] = useState<boolean>(true);
  const { menuItems, open3DViewer, addToCart, addNotification } = useAppStore();

  // Auto-cycle through dishes every 5 seconds
  useEffect(() => {
    if (!isAutoCycling) return;
    const timer = setInterval(() => {
      setSelectedIndex((prev) => (prev + 1) % SHOWCASE_DISHES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoCycling]);

  const selectedDish = SHOWCASE_DISHES[selectedIndex];
  const fullMenuItem = menuItems.find((m) => m.id === selectedDish.id) || {
    id: selectedDish.id,
    restaurantId: 'rest_1',
    name: selectedDish.name,
    description: selectedDish.description,
    price: selectedDish.price,
    category: selectedDish.category,
    isVeg: false,
    isAvailable: true,
    rating: selectedDish.rating,
    ratingCount: 420,
    image: selectedDish.image,
    calories: selectedDish.calories,
    preparationTime: selectedDish.prepTime,
  };

  const handleInspect = () => {
    open3DViewer(fullMenuItem);
    if (onFoodSelect) {
      onFoodSelect(selectedDish.name);
    }
  };

  const handleOrder = () => {
    addToCart(fullMenuItem);
    setAdded(true);
    addNotification('Added to Order', `${selectedDish.name} added to your tray!`, 'success');
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <div
      onMouseEnter={() => setIsAutoCycling(false)}
      onMouseLeave={() => setIsAutoCycling(true)}
      className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-br from-stone-900 via-stone-900 to-stone-950 border border-stone-800 shadow-3d-frame p-4 sm:p-6 text-white"
    >
      {/* Top Header & Dish Category Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-stone-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400">
              Fresh Kitchen Spotlight
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">
            Gourmet Culinary Showcase
          </h3>
        </div>

        {/* Category Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {SHOWCASE_DISHES.map((dish, idx) => (
            <button
              key={dish.id}
              onClick={() => {
                setSelectedIndex(idx);
                if (onFoodSelect) onFoodSelect(dish.name);
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 select-none ${
                selectedIndex === idx
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30 scale-105'
                  : 'bg-stone-800/80 hover:bg-stone-700 text-stone-300'
              }`}
            >
              <span>{dish.icon}</span>
              <span className="hidden md:inline">{dish.tabLabel}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Photographic Stage */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Actual Photograph Card (with Continuous Looping Steam Effect & Rotation) */}
        <div
          onClick={handleInspect}
          className="md:col-span-7 relative h-64 sm:h-72 lg:h-80 rounded-2xl overflow-hidden cursor-pointer group shadow-xl border border-stone-800 bg-stone-950"
        >
          {/* Continuous Steam Effect Rising from Primary Hero Dish */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 pointer-events-none z-30 flex gap-4">
            <svg
              className="w-12 h-20 animate-steam-1 text-white/50"
              viewBox="0 0 40 80"
              fill="none"
            >
              <path
                d="M15 80C10 60 30 45 15 25C5 10 20 0 25 0"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </svg>
            <svg
              className="w-12 h-20 animate-steam-2 text-orange-200/40 -mt-2"
              viewBox="0 0 40 80"
              fill="none"
            >
              <path
                d="M20 80C25 55 5 40 22 20C32 5 18 0 15 0"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
            <svg
              className="w-12 h-20 animate-steam-3 text-white/40"
              viewBox="0 0 40 80"
              fill="none"
            >
              <path
                d="M18 80C12 65 28 50 16 30C8 15 22 0 20 0"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <img
            src={selectedDish.image}
            alt={selectedDish.name}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
            referrerPolicy="no-referrer"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Floating High-Res Photo Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-orange-400 border border-white/10 flex items-center gap-1 shadow-md">
              <Sparkles className="w-3 h-3 text-orange-400" />
              <span>Authentic Dish Photo</span>
            </span>
          </div>

          {/* Floating Inspect Pill */}
          <div className="absolute top-3 right-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleInspect();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500 text-white font-bold text-xs shadow-lg shadow-orange-500/40 hover:bg-orange-600 transition-all hover:scale-105"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Inspect Photo</span>
            </button>
          </div>

          {/* Bottom Info inside image */}
          <div className="absolute bottom-3 left-3 right-3 text-white">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 mb-1">
              <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10">
                <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
                <span>{selectedDish.rating} Rating</span>
              </div>
              <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span>{selectedDish.calories} kcal</span>
              </div>
            </div>
            <h4 className="text-base sm:text-lg font-black line-clamp-1 drop-shadow-md">
              {selectedDish.name}
            </h4>
          </div>
        </div>

        {/* Dish Details & Instant Action Column */}
        <div className="md:col-span-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400">
                {selectedDish.category}
              </span>
              <span className="text-xs text-stone-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                <span>{selectedDish.prepTime}</span>
              </span>
            </div>

            <h4 className="text-lg sm:text-xl font-black text-white mt-1 leading-snug">
              {selectedDish.name}
            </h4>

            <p className="text-stone-300 text-xs sm:text-sm mt-2 leading-relaxed line-clamp-3">
              {selectedDish.description}
            </p>

            {/* Tags / Ingredients */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {selectedDish.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-stone-800 text-stone-300 border border-stone-700/60"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Pricing & CTA buttons */}
          <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-stone-400">Price</div>
              <div className="text-2xl font-black text-white">₹{selectedDish.price}</div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleInspect}
                className="px-3.5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold border border-stone-700 flex items-center gap-1.5 transition-colors"
                title="View actual photo and fresh ingredients"
              >
                <Eye className="w-4 h-4 text-orange-400" />
                <span className="hidden sm:inline">Details</span>
              </button>

              <button
                onClick={handleOrder}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0.5 ${
                  added
                    ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                    : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/30'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added!</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add to Order</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
