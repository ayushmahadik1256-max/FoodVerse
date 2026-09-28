import React from 'react';
import { MenuItem } from '../../types';
import { Star, Plus, Minus, Flame, SlidersHorizontal, Image as ImageIcon } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface DishCardProps {
  item: MenuItem;
}

export const DishCard: React.FC<DishCardProps> = ({ item }) => {
  const { cart, addToCart, updateCartQuantity, open3DViewer, openCustomizationModal } = useAppStore();

  const cartItem = cart.find((i) => i.menuItemId === item.id);
  const quantity = cartItem?.quantity || 0;

  return (
    <div
      className="group relative flex flex-col justify-between bg-white dark:bg-stone-900 rounded-3xl p-4 border border-stone-200/80 dark:border-stone-800 shadow-3d-card"
    >
      <div>
        {/* Dish Actual Image with Zoom & 3D Lighting Sheen on Hover */}
        <div
          onClick={() => open3DViewer(item)}
          className="relative w-full h-44 rounded-2xl overflow-hidden mb-3.5 bg-stone-100 dark:bg-stone-800 cursor-pointer shadow-sm group-hover:shadow-md transition-shadow"
        >
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-110 group-hover:brightness-105 transition-all duration-700 ease-out"
            referrerPolicy="no-referrer"
          />

          {/* Subtle gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Veg / Non-Veg Indicator */}
          <div className="absolute top-3 left-3 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md p-1 rounded-md border border-stone-200 dark:border-stone-700 shadow-md z-10">
            <span
              className={`block w-3 h-3 rounded-full border ${
                item.isVeg ? 'bg-emerald-500 border-emerald-600' : 'bg-rose-500 border-rose-600'
              }`}
            />
          </div>

          {/* Bestseller Badge */}
          {item.isBestSeller && (
            <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md z-10">
              Bestseller
            </div>
          )}

          {/* View Actual Photo Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              open3DViewer(item);
            }}
            className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900/85 hover:bg-orange-500 text-white backdrop-blur-md font-semibold text-xs shadow-lg shadow-black/40 hover:shadow-orange-500/40 transition-all hover:scale-105 active:scale-95 z-10 border border-white/10"
            title="Inspect dish image and ingredients"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>View Dish</span>
          </button>
        </div>

        {/* Dish Title & Meta */}
        <div className="flex items-start justify-between gap-2">
          <h4
            onClick={() => open3DViewer(item)}
            className="text-base font-bold text-stone-900 dark:text-stone-100 group-hover:text-orange-500 transition-colors line-clamp-1 cursor-pointer"
            title={item.name}
          >
            {item.name}
          </h4>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold shrink-0 shadow-sm">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{item.rating}</span>
          </div>
        </div>

        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-2 leading-relaxed">
          {item.description}
        </p>

        {/* Nutritional & Calories Tag */}
        {item.calories && (
          <div className="flex items-center gap-2 text-[11px] text-stone-400 mt-2 font-medium">
            <div className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>{item.calories} kcal</span>
            </div>
            <span>•</span>
            <span>{item.preparationTime || '15 min'}</span>
          </div>
        )}
      </div>

      {/* Price & Add / Customize Controls */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-stone-100 dark:border-stone-800/80">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-black text-stone-900 dark:text-stone-100">₹{item.price}</span>
            {item.originalPrice && (
              <span className="text-xs text-stone-400 line-through">₹{item.originalPrice}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Customize Button */}
          <button
            onClick={() => openCustomizationModal(item)}
            className="px-2.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/30 text-stone-700 dark:text-stone-300 text-xs font-bold transition-all flex items-center gap-1 shadow-sm hover:shadow active:scale-95"
            title="Customize size, add-ons & spice level"
          >
            <SlidersHorizontal className="w-3 h-3 text-orange-500" />
            <span className="hidden sm:inline">Custom</span>
          </button>

          {quantity > 0 ? (
            <div className="flex items-center gap-1.5 bg-orange-500 text-white rounded-xl p-1 shadow-lg shadow-orange-500/30">
              <button
                onClick={() => updateCartQuantity(item.id, -1)}
                className="w-6 h-6 rounded-lg hover:bg-white/20 active:scale-90 flex items-center justify-center transition-all"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-xs font-bold px-1">{quantity}</span>
              <button
                onClick={() => updateCartQuantity(item.id, 1)}
                className="w-6 h-6 rounded-lg hover:bg-white/20 active:scale-90 flex items-center justify-center transition-all"
                aria-label="Increase quantity"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => addToCart(item)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/25 hover:shadow-lg hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
