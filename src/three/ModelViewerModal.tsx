import React, { useState, useEffect } from 'react';
import { MenuItem } from '../types';
import {
  X,
  Flame,
  Clock,
  Plus,
  Minus,
  Check,
  Star,
  Sparkles,
  Maximize2,
  ZoomIn,
  ZoomOut,
  ShieldCheck,
  Heart,
  Share2,
  Utensils,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

interface ModelViewerModalProps {
  item: MenuItem | null;
  onClose: () => void;
  onAddToCart?: (item: MenuItem) => void;
}

export const ModelViewerModal: React.FC<ModelViewerModalProps> = ({ item, onClose, onAddToCart }) => {
  const { cart, addToCart, updateCartQuantity, addNotification } = useAppStore();
  const [added, setAdded] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  useEffect(() => {
    // Reset states when item changes
    if (item) {
      setQuantity(1);
      setIsZoomed(false);
      setImageLoaded(false);
    }
  }, [item?.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!item) return null;

  const handleAdd = () => {
    for (let i = 0; i < quantity; i++) {
      if (onAddToCart) {
        onAddToCart(item);
      } else {
        addToCart(item);
      }
    }
    setAdded(true);
    addNotification('Added to Order', `${quantity}x ${item.name} added to your tray!`, 'success');
    setTimeout(() => setAdded(false), 1800);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      addNotification('Dish Link Copied', `Link to ${item.name} copied to clipboard`, 'info');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-white dark:bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col md:flex-row max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Actual Photograph Column (Left on desktop) */}
        <div className="relative w-full md:w-1/2 h-64 sm:h-80 md:h-auto bg-stone-950 overflow-hidden flex items-center justify-center select-none group">
          {/* Skeleton placeholder while image loads */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-stone-800 animate-pulse flex items-center justify-center text-stone-500 text-xs">
              Loading fresh dish image...
            </div>
          )}

          <img
            src={item.image}
            alt={item.name}
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              isZoomed ? 'scale-150 cursor-zoom-out' : 'scale-100 cursor-zoom-in'
            } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => setIsZoomed(!isZoomed)}
            referrerPolicy="no-referrer"
          />

          {/* Image overlays */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-black/20 md:to-transparent" />

          {/* Top Badges */}
          <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2 pointer-events-none">
            {/* Veg / Non-Veg Indicator */}
            <div className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-md px-2.5 py-1 rounded-xl border border-stone-200/60 dark:border-stone-700/60 flex items-center gap-1.5 shadow-md">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
              <span className="text-[11px] font-bold text-stone-800 dark:text-stone-200">
                {item.isVeg ? 'Pure Veg' : 'Non-Veg'}
              </span>
            </div>

            {item.isBestSeller && (
              <span className="bg-amber-500 text-stone-950 font-black text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-xl shadow-md">
                Bestseller
              </span>
            )}

            <span className="bg-orange-600/90 text-white font-bold text-[10px] px-2.5 py-1 rounded-xl shadow-md backdrop-blur-sm">
              Authentic Photo
            </span>
          </div>

          {/* Bottom Zoom & Action Controls */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs pointer-events-auto">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10">
              <button
                onClick={() => setIsZoomed(!isZoomed)}
                className="hover:text-orange-400 transition-colors flex items-center gap-1 font-semibold text-[11px]"
                title="Toggle Zoom"
              >
                {isZoomed ? (
                  <>
                    <ZoomOut className="w-3.5 h-3.5" />
                    <span>Zoom Out</span>
                  </>
                ) : (
                  <>
                    <ZoomIn className="w-3.5 h-3.5" />
                    <span>Click to Zoom</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsFavorite(!isFavorite);
                  addNotification(
                    isFavorite ? 'Removed from favorites' : 'Saved to favorites',
                    `${item.name} ${isFavorite ? 'removed from' : 'added to'} your wishlist`,
                    'info'
                  );
                }}
                className={`w-8 h-8 rounded-xl flex items-center justify-center backdrop-blur-md border transition-all ${
                  isFavorite
                    ? 'bg-rose-500 text-white border-rose-600'
                    : 'bg-black/60 text-white/80 hover:text-white border-white/10'
                }`}
                title="Favorite"
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </button>

              <button
                onClick={handleShare}
                className="w-8 h-8 rounded-xl bg-black/60 hover:bg-black/80 text-white/80 hover:text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition-colors"
                title="Share dish"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Dish Details Column (Right on desktop) */}
        <div className="w-full md:w-1/2 p-5 sm:p-7 pr-14 sm:pr-16 flex flex-col justify-between overflow-y-auto bg-white dark:bg-stone-900">
          <div className="space-y-4">
            {/* Category & Rating Row */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-extrabold text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded-lg">
                  {item.category}
                </span>
                {item.dietaryPreferences && item.dietaryPreferences.length > 0 && (
                  <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                    • {item.dietaryPreferences.join(', ')}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/60 font-bold text-xs">
                <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                <span>{item.rating || 4.8}</span>
                <span className="text-stone-400 font-normal">({item.ratingCount || 120})</span>
              </div>
            </div>

            {/* Title & Description */}
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 leading-tight">
                {item.name}
              </h2>
              <p className="text-stone-600 dark:text-stone-300 text-xs sm:text-sm mt-2 leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] text-stone-400">Energy</div>
                  <div className="text-sm font-extrabold text-stone-800 dark:text-stone-200">
                    {item.calories || 480} kcal
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] text-stone-400">Prep Time</div>
                  <div className="text-sm font-extrabold text-stone-800 dark:text-stone-200">
                    {item.preparationTime || '15-20 min'}
                  </div>
                </div>
              </div>
            </div>

            {/* Fresh Ingredients List */}
            {item.ingredients && item.ingredients.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2 flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-orange-500" />
                  <span>Fresh Ingredients</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {item.ingredients.map((ing) => (
                    <span
                      key={ing}
                      className="px-2.5 py-1 rounded-xl text-xs bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium border border-stone-200/60 dark:border-stone-700/60"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quality & Freshness Guarantee */}
            <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-800/50 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Prepared fresh upon order with certified premium ingredients.</span>
            </div>
          </div>

          {/* Action Row & Quantity Selector */}
          <div className="pt-5 mt-4 border-t border-stone-100 dark:border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold text-stone-400">Total Price</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-stone-900 dark:text-stone-100">
                    ₹{item.price * quantity}
                  </span>
                  {item.originalPrice && (
                    <span className="text-xs text-stone-400 line-through">
                      ₹{item.originalPrice * quantity}
                    </span>
                  )}
                  {quantity > 1 && (
                    <span className="text-[11px] text-stone-400">
                      (₹{item.price} each)
                    </span>
                  )}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-2 bg-stone-100 dark:bg-stone-800 p-1 rounded-2xl border border-stone-200/80 dark:border-stone-700">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-xl bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-200 hover:bg-stone-200 flex items-center justify-center font-bold text-xs transition-colors shadow-xs"
                  aria-label="Decrease count"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center text-xs font-black text-stone-900 dark:text-stone-100">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  className="w-8 h-8 rounded-xl bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-200 hover:bg-stone-200 flex items-center justify-center font-bold text-xs transition-colors shadow-xs"
                  aria-label="Increase count"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <button
              onClick={handleAdd}
              className={`w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-bold text-sm transition-all shadow-md active:scale-98 ${
                added
                  ? 'bg-emerald-600 text-white shadow-emerald-600/25'
                  : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/25'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added {quantity}x to Order!</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add {quantity > 1 ? `${quantity}x ` : ''}to Order • ₹{item.price * quantity}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Close Button - Guaranteed topmost z-index */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-3.5 right-3.5 z-50 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-stone-900/80 hover:bg-stone-950 text-white dark:bg-stone-800/90 dark:hover:bg-stone-700 flex items-center justify-center transition-all shadow-xl active:scale-90 cursor-pointer pointer-events-auto border border-white/20"
          aria-label="Close dish preview"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
