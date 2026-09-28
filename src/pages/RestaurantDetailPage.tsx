import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { DishCard } from '../components/food/DishCard';
import { LeafletMap } from '../components/common/LeafletMap';
import { WriteReviewModal } from '../components/reviews/WriteReviewModal';
import {
  ArrowLeft,
  Star,
  Clock,
  MapPin,
  Heart,
  Share2,
  Sparkles,
  MessageSquare,
  ThumbsUp,
  Tag,
  ShieldCheck,
  Plus,
  Filter,
} from 'lucide-react';

interface RestaurantDetailPageProps {
  restaurantId: string;
  onBack: () => void;
}

export const RestaurantDetailPage: React.FC<RestaurantDetailPageProps> = ({
  restaurantId,
  onBack,
}) => {
  const {
    restaurants,
    menuItems,
    currentUser,
    toggleFavorite,
    addNotification,
    reviews,
    voteHelpful,
    coupons,
    applyCoupon,
  } = useAppStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [showMap, setShowMap] = useState<boolean>(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const restaurant = restaurants.find((r) => r.id === restaurantId) || restaurants[0];
  const items = menuItems.filter((m) => m.restaurantId === restaurant.id);
  const isFav = currentUser.favorites.includes(restaurant.id);

  // Reviews for this restaurant
  const restaurantReviews = reviews.filter((rev) => rev.restaurantId === restaurant.id);

  // Extract unique categories
  const categories = ['all', ...Array.from(new Set(items.map((i) => i.category)))];

  const filteredItems = items.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (dietaryFilter === 'veg' && !item.isVeg) return false;
    if (dietaryFilter === 'non-veg' && item.isVeg) return false;
    return true;
  });

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      addNotification('Link Copied', 'Restaurant link copied to clipboard', 'info');
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Restaurants</span>
      </button>

      {/* Hero Restaurant Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-stone-900 shadow-xl border border-stone-200/60 dark:border-stone-800">
        <div className="relative h-64 sm:h-80 w-full overflow-hidden">
          <img
            src={restaurant.banner || restaurant.image}
            alt={restaurant.name}
            className="w-full h-full object-cover opacity-80"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent" />

          {/* Quick Actions (Favorite & Share) */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <button
              onClick={() => toggleFavorite(restaurant.id)}
              className="w-10 h-10 rounded-full bg-white/90 dark:bg-stone-900/90 backdrop-blur-md flex items-center justify-center text-stone-700 dark:text-stone-300 shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              <Heart
                className={`w-5 h-5 ${
                  isFav ? 'fill-rose-500 text-rose-500' : 'text-stone-600 dark:text-stone-400'
                }`}
              />
            </button>
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-full bg-white/90 dark:bg-stone-900/90 backdrop-blur-md flex items-center justify-center text-stone-700 dark:text-stone-300 shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* Banner Info Content */}
          <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-orange-500 text-white font-bold text-[10px] tracking-wider uppercase">
                Verified Artisan Kitchen
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-semibold">
                Open {restaurant.openingHours.open} - {restaurant.openingHours.close}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/80 backdrop-blur-md text-[10px] font-bold">
                ● Accepting Orders Now
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black">{restaurant.name}</h1>
            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
              {restaurant.description}
            </p>

            {/* Quick Metrics Bar */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-semibold">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500 text-white font-black">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{restaurant.rating}</span>
                <span className="opacity-80 text-[10px]">({restaurant.reviewCount} reviews)</span>
              </div>

              <div className="flex items-center gap-1.5 text-stone-300">
                <Clock className="w-4 h-4 text-orange-400" />
                <span>{restaurant.deliveryTime} mins dispatch</span>
              </div>

              <div className="flex items-center gap-1.5 text-stone-300">
                <MapPin className="w-4 h-4 text-orange-400" />
                <span>{restaurant.location.address}</span>
              </div>

              <div className="text-stone-300">
                ₹{restaurant.priceForTwo} for two
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Promotional Offers Banner */}
      <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-rose-500/10 border border-orange-500/20 rounded-3xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-black">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-stone-900 dark:text-stone-100">
              Kitchen Offers & Coupons
            </h3>
            <p className="text-xs text-stone-500">
              Get flat 50% off on first order or ₹100 off on gourmet feasts!
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {coupons.slice(0, 3).map((cp) => (
            <button
              key={cp.code}
              onClick={() => {
                applyCoupon(cp.code);
              }}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 border border-orange-300 dark:border-orange-700/60 text-orange-600 dark:text-orange-400 text-xs font-bold hover:bg-orange-500 hover:text-white transition-all shadow-sm flex items-center gap-1"
            >
              <span>{cp.code}</span>
              <span className="text-[10px] opacity-75">({cp.discountPercentage}% OFF)</span>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Map & Kitchen Location Dropdown */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-orange-500" />
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Kitchen Dispatch Location & Live Geofence
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {restaurant.location.address}, {restaurant.location.city} (Leaflet OpenStreetMap)
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowMap(!showMap)}
            className="text-xs font-semibold text-orange-500 hover:underline"
          >
            {showMap ? 'Hide Map' : 'View On Map'}
          </button>
        </div>

        {showMap && (
          <LeafletMap
            center={restaurant.location.coordinates}
            restaurantLocation={restaurant.location.coordinates}
            restaurantName={restaurant.name}
            className="h-60 w-full rounded-2xl"
          />
        )}
      </div>

      {/* Sticky Filter Bar (Category Tabs & Veg/Non-Veg Toggles) */}
      <div className="sticky top-20 z-20 bg-stone-50/95 dark:bg-stone-950/95 backdrop-blur-md py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 border-y border-stone-200/80 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none flex-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold capitalize transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                  : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              {cat === 'all' ? 'All Dishes' : cat}
            </button>
          ))}
        </div>

        {/* Dietary Switch */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-stone-900 p-1 rounded-2xl border border-stone-200 dark:border-stone-800 shrink-0">
          <button
            onClick={() => setDietaryFilter('all')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
              dietaryFilter === 'all'
                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setDietaryFilter('veg')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              dietaryFilter === 'veg'
                ? 'bg-emerald-600 text-white'
                : 'text-stone-500 hover:text-emerald-600'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Pure Veg</span>
          </button>
          <button
            onClick={() => setDietaryFilter('non-veg')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              dietaryFilter === 'non-veg'
                ? 'bg-rose-600 text-white'
                : 'text-stone-500 hover:text-rose-600'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Non-Veg</span>
          </button>
        </div>
      </div>

      {/* Menu Dishes Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <span>Menu Dishes</span>
            <span className="text-xs font-normal text-stone-400">({filteredItems.length} items)</span>
          </h2>
          <span className="text-xs text-stone-400">Click dish or customize button to adjust recipe</span>
        </div>

        {filteredItems.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800">
            <p className="text-sm text-stone-400">No dishes available for current filter selection.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <DishCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* Customer Reviews & Ratings Section */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 dark:border-stone-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-900 dark:text-stone-100">
                Customer Reviews & Ratings
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Verified reviews from recent diners
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-black text-stone-900 dark:text-stone-100 flex items-center gap-1 justify-end">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span>{restaurant.rating}</span>
              </div>
              <div className="text-[11px] text-stone-400">
                {restaurant.reviewCount + restaurantReviews.length} total ratings
              </div>
            </div>

            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/25 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Write a Review</span>
            </button>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {restaurantReviews.length === 0 ? (
            <div className="text-center py-8 text-stone-400 text-xs">
              Be the first to review dishes from {restaurant.name}!
            </div>
          ) : (
            restaurantReviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 sm:p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={rev.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                      alt={rev.userName}
                      className="w-9 h-9 rounded-full object-cover border border-stone-200 dark:border-stone-700"
                    />
                    <div>
                      <div className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                        <span>{rev.userName}</span>
                        <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 text-[9px] font-black uppercase">
                          Verified Diner
                        </span>
                      </div>
                      <div className="text-[10px] text-stone-400">
                        {new Date(rev.createdAt || rev.date || Date.now()).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                        {rev.dishName && ` • Ordered: ${rev.dishName}`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-lg">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{rev.rating}.0</span>
                  </div>
                </div>

                <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-medium">
                  {rev.comment}
                </p>

                {/* Sub-ratings Pills */}
                {(rev.foodRating || rev.deliveryRating || rev.packagingRating) && (
                  <div className="flex flex-wrap gap-2 text-[10px] text-stone-500">
                    {rev.foodRating && <span>Taste: ⭐ {rev.foodRating}/5</span>}
                    {rev.deliveryRating && <span>Speed: ⭐ {rev.deliveryRating}/5</span>}
                    {rev.packagingRating && <span>Eco-Packaging: ⭐ {rev.packagingRating}/5</span>}
                  </div>
                )}

                {/* Attached Food Photos */}
                {rev.photos && rev.photos.length > 0 && (
                  <div className="flex gap-2 pt-1">
                    {rev.photos.map((photo, pIdx) => (
                      <img
                        key={pIdx}
                        src={photo}
                        alt="Customer meal"
                        className="w-16 h-16 rounded-xl object-cover border border-stone-200 dark:border-stone-700"
                      />
                    ))}
                  </div>
                )}

                {/* Owner Reply if present */}
                {rev.ownerReply && (
                  <div className="p-3 rounded-xl bg-orange-50/60 dark:bg-orange-950/20 border-l-2 border-orange-500 text-xs space-y-0.5">
                    <span className="font-bold text-orange-700 dark:text-orange-400 text-[11px]">
                      Response from Chef Marco (Owner):
                    </span>
                    <p className="text-stone-600 dark:text-stone-300">
                      {typeof rev.ownerReply === 'string' ? rev.ownerReply : rev.ownerReply.text}
                    </p>
                  </div>
                )}

                {/* Helpful Button */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-200/60 dark:border-stone-800 text-[11px] text-stone-400">
                  <button
                    onClick={() => voteHelpful(rev.id)}
                    className="flex items-center gap-1.5 hover:text-orange-500 transition-colors"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Helpful ({rev.helpfulVotes || 0})</span>
                  </button>
                  <span>Verified Purchase</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Write Review Modal */}
      {isReviewModalOpen && (
        <WriteReviewModal
          restaurant={restaurant}
          onClose={() => setIsReviewModalOpen(false)}
        />
      )}
    </div>
  );
};
