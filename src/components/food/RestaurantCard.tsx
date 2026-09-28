import React from 'react';
import { Restaurant } from '../../types';
import { Star, Clock, Heart, Sparkles, MapPin } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick: () => void;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, onClick }) => {
  const { currentUser, toggleFavorite } = useAppStore();
  const isFav = currentUser.favorites.includes(restaurant.id);

  return (
    <div
      onClick={onClick}
      className="group relative bg-white dark:bg-stone-900 rounded-3xl overflow-hidden border border-stone-200/80 dark:border-stone-800 shadow-3d-card cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Banner with Tags and Image Zoom */}
        <div className="relative w-full h-48 overflow-hidden bg-stone-100 dark:bg-stone-800">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-110 group-hover:brightness-105 transition-all duration-700 ease-out"
            referrerPolicy="no-referrer"
          />

          {/* Promoted Tag */}
          {restaurant.isPromoted && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900/90 backdrop-blur-md text-white font-bold text-[10px] tracking-wider uppercase shadow-lg border border-white/10">
              <Sparkles className="w-3 h-3 text-orange-400" />
              <span>Featured</span>
            </div>
          )}

          {/* Favorite Toggle Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(restaurant.id);
            }}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 dark:bg-stone-900/95 backdrop-blur-md flex items-center justify-center text-stone-700 dark:text-stone-300 shadow-md hover:shadow-lg hover:scale-115 active:scale-95 transition-all z-10"
            aria-label="Toggle favorite"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isFav ? 'fill-rose-500 text-rose-500' : 'text-stone-600 dark:text-stone-400'
              }`}
            />
          </button>

          {/* Delivery Time & Distance Float */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 dark:bg-stone-900/95 backdrop-blur-md text-xs font-semibold text-stone-800 dark:text-stone-200 shadow-md">
              <Clock className="w-3.5 h-3.5 text-orange-500" />
              <span>{restaurant.deliveryTime} mins</span>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-white/95 dark:bg-stone-900/95 backdrop-blur-md text-xs font-semibold text-stone-800 dark:text-stone-200 shadow-md">
              ₹{restaurant.deliveryFee === 0 ? 'Free Delivery' : `₹${restaurant.deliveryFee} fee`}
            </span>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 group-hover:text-orange-500 transition-colors line-clamp-1">
              {restaurant.name}
            </h3>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500 text-white text-xs font-black shadow-sm shrink-0">
              <Star className="w-3 h-3 fill-current" />
              <span>{restaurant.rating}</span>
            </div>
          </div>

          <p className="text-xs font-medium text-stone-500 dark:text-stone-400 line-clamp-1 mb-2">
            {restaurant.cuisines.join(' • ')}
          </p>

          {/* Dietary Badges */}
          {restaurant.dietaryPreferences && restaurant.dietaryPreferences.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2.5">
              {restaurant.dietaryPreferences.slice(0, 3).map((diet) => (
                <span
                  key={diet}
                  className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50"
                >
                  {diet}
                </span>
              ))}
              {restaurant.dietaryPreferences.length > 3 && (
                <span className="text-[10px] text-stone-400 font-medium self-center">
                  +{restaurant.dietaryPreferences.length - 3}
                </span>
              )}
            </div>
          )}

          <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed mb-3">
            {restaurant.description}
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-5 pb-5 pt-3 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
        <div className="flex items-center gap-1 truncate max-w-[170px]">
          <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <span className="truncate">{restaurant.location.city}</span>
        </div>
        <div className="font-semibold text-stone-700 dark:text-stone-300">
          ₹{restaurant.priceForTwo} for two
        </div>
      </div>
    </div>
  );
};
