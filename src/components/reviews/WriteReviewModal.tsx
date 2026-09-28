import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Restaurant } from '../../types';
import { X, Star, Upload, Image as ImageIcon, CheckCircle2, ShieldCheck, Heart } from 'lucide-react';

interface WriteReviewModalProps {
  restaurant: Restaurant | null;
  onClose: () => void;
}

export const WriteReviewModal: React.FC<WriteReviewModalProps> = ({ restaurant, onClose }) => {
  const { currentUser, menuItems, addReview } = useAppStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!restaurant) return null;

  const restaurantDishes = menuItems.filter((m) => m.restaurantId === restaurant.id);

  const [rating, setRating] = useState(5);
  const [foodRating, setFoodRating] = useState(5);
  const [deliveryRating, setDeliveryRating] = useState(5);
  const [packagingRating, setPackagingRating] = useState(5);
  const [dishName, setDishName] = useState(restaurantDishes[0]?.name || '');
  const [comment, setComment] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80',
  ]);
  const [showPhotoUploader, setShowPhotoUploader] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    addReview({
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      restaurantId: restaurant.id,
      rating,
      foodRating,
      deliveryRating,
      packagingRating,
      comment: comment.trim(),
      dishName: dishName || undefined,
      photos: uploadedPhotos.length > 0 ? uploadedPhotos : undefined,
    });

    onClose();
  };

  const StarSelector: React.FC<{
    value: number;
    onChange: (val: number) => void;
    label: string;
  }> = ({ value, onChange, label }) => (
    <div className="flex items-center justify-between">
      <span className="text-xs font-bold text-stone-700 dark:text-stone-300">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 text-stone-300 hover:text-amber-400 transition-colors"
          >
            <Star
              className={`w-5 h-5 ${
                star <= value ? 'text-amber-400 fill-amber-400' : 'text-stone-300 dark:text-stone-600'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[88vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-900/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm">⭐</span>
              <span className="text-[10px] font-black tracking-widest uppercase text-amber-600 dark:text-amber-400">
                Verified Diner Review
              </span>
            </div>
            <h2 className="text-base font-black text-stone-900 dark:text-stone-100 mt-0.5">
              Review {restaurant.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            aria-label="Close review modal"
            className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center text-stone-500 transition-colors cursor-pointer pointer-events-auto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Overall Rating Banner */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300">
              Overall Culinary Experience
            </span>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating ? 'text-amber-400 fill-amber-400 drop-shadow' : 'text-stone-300 dark:text-stone-700'
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="text-xs font-bold text-amber-800 dark:text-amber-200">
              {rating === 5 && 'Outstanding Taste & Presentation (5/5)'}
              {rating === 4 && 'Very Delicious & Recommended (4/5)'}
              {rating === 3 && 'Good, Met Expectations (3/5)'}
              {rating <= 2 && 'Needs Improvement (1-2/5)'}
            </div>
          </div>

          {/* Sub-ratings Breakdown */}
          <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-2.5">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-stone-400">
              Detailed Criteria
            </h4>
            <StarSelector label="Food Flavor & Freshness" value={foodRating} onChange={setFoodRating} />
            <StarSelector label="Delivery Partner Speed & Politeness" value={deliveryRating} onChange={setDeliveryRating} />
            <StarSelector label="Eco Thermal Packaging & Spillage Control" value={packagingRating} onChange={setPackagingRating} />
          </div>

          {/* Dish Tag */}
          <div>
            <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider mb-1">
              Which Dish Did You Enjoy?
            </label>
            <select
              value={dishName}
              onChange={(e) => setDishName(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-900 dark:text-stone-100"
            >
              {restaurantDishes.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name} (₹{d.price})
                </option>
              ))}
              <option value="Chef's Special Tasting Menu">Chef's Special Tasting Menu</option>
            </select>
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider mb-1">
              Your Honest Review
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What made this dish special? Tell other food lovers about the flavors, crispness, and aroma..."
              rows={3}
              required
              className="w-full p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            />
          </div>

          {/* Photos */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider">
                Photos from Your Meal
              </label>
              <button
                type="button"
                onClick={() => setShowPhotoUploader(!showPhotoUploader)}
                className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                <Upload className="w-3 h-3" />
                <span>Add Photo</span>
              </button>
            </div>

            {uploadedPhotos.length > 0 && (
              <div className="flex gap-2">
                {uploadedPhotos.map((url, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 group">
                    <img src={url} alt="Meal preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setUploadedPhotos((prev) => prev.filter((_, i) => i !== idx))}
                      className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Submit */}
          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs shadow-lg shadow-amber-500/25 transition-all"
          >
            Publish Verified Review
          </button>
        </form>
      </div>
    </div>
  );
};
