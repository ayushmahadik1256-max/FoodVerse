import React, { useRef, useState, useEffect } from 'react';
import { CuisineCategory } from '../../types';
import { Utensils, ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface CuisineCategoryBarProps {
  categories: CuisineCategory[];
  selectedCuisine: string;
  onSelectCategory: (cuisineName: string) => void;
}

export const CuisineCategoryBar: React.FC<CuisineCategoryBarProps> = ({
  categories,
  selectedCuisine,
  onSelectCategory,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  // Trigger stagger animation when scrolled into view
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = direction === 'left' ? -320 : 320;
    scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const isAllActive = selectedCuisine === 'all' || !selectedCuisine;

  const getFoodType = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('biryani')) return 'biryani';
    if (lower.includes('burger')) return 'burger';
    if (lower.includes('pizza')) return 'pizza';
    if (lower.includes('mexican') || lower.includes('taco')) return 'taco';
    if (lower.includes('dessert') || lower.includes('sweet') || lower.includes('cake')) return 'dessert';
    return 'food';
  };

  return (
    <div ref={sectionRef} className="w-full space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold">
            <Utensils className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-stone-100">
              Explore by Cuisine
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Browse chef-curated menus by your favorite cravings
            </p>
          </div>
        </div>

        {/* Desktop Navigation Scroll Arrows */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => handleScroll('left')}
            className="w-8 h-8 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:bg-orange-50 dark:hover:bg-stone-700 flex items-center justify-center text-stone-700 dark:text-stone-300 transition-colors shadow-sm active:scale-95"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="w-8 h-8 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:bg-orange-50 dark:hover:bg-stone-700 flex items-center justify-center text-stone-700 dark:text-stone-300 transition-colors shadow-sm active:scale-95"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Swipeable Container with Staggered Scroll Entry */}
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-2 -mx-4 px-4 sm:mx-0 sm:px-0"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* All Cuisines Item */}
        <button
          onClick={() => onSelectCategory('all')}
          data-food-type="food"
          style={{
            transform: isInView ? 'scale(1) translate3d(0,0,0)' : 'scale(0) translate3d(0, 20px, 0)',
            opacity: isInView ? 1 : 0,
            transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0ms, opacity 0.4s ease 0ms',
          }}
          className={`group flex flex-col items-center shrink-0 p-3 rounded-2xl snap-start select-none border min-w-[90px] sm:min-w-[104px] will-change-transform transition-all duration-300 ${
            isAllActive
              ? 'bg-orange-500 text-white border-orange-500 shadow-xl shadow-orange-500/35 scale-105 -translate-y-1'
              : 'bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 border-stone-200/80 dark:border-stone-800 hover:border-orange-400 hover:shadow-xl hover:-translate-y-2 hover:scale-105 shadow-sm'
          }`}
        >
          <div
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-xl sm:text-2xl mb-2 transition-transform duration-300 group-hover:scale-115 group-hover:rotate-6 shadow-inner ${
              isAllActive
                ? 'bg-white/20 text-white'
                : 'bg-orange-50 dark:bg-orange-950/40 text-orange-500'
            }`}
          >
            🍽️
          </div>
          <span className="text-xs font-bold leading-tight line-clamp-1">All Cuisines</span>
          <span
            className={`text-[10px] mt-0.5 font-medium ${
              isAllActive ? 'text-white/80' : 'text-stone-400 dark:text-stone-500'
            }`}
          >
            All kitchens
          </span>
        </button>

        {/* Categories List with 100ms Staggered Delay and Hover Wiggle */}
        {categories.map((cat, idx) => {
          const isSelected = selectedCuisine.toLowerCase() === cat.name.toLowerCase();
          const delay = (idx + 1) * 80;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(isSelected ? 'all' : cat.name)}
              data-food-type={getFoodType(cat.name)}
              style={{
                transform: isInView ? 'scale(1) translate3d(0,0,0)' : 'scale(0) translate3d(0, 20px, 0)',
                opacity: isInView ? 1 : 0,
                transition: `transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms, opacity 0.4s ease ${delay}ms`,
              }}
              className={`group flex flex-col items-center shrink-0 p-3 rounded-2xl snap-start select-none border min-w-[90px] sm:min-w-[104px] relative will-change-transform transition-all duration-300 ${
                isSelected
                  ? 'bg-orange-500 text-white border-orange-500 shadow-xl shadow-orange-500/35 scale-105 -translate-y-1'
                  : 'bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 border-stone-200/80 dark:border-stone-800 hover:border-orange-400 hover:shadow-xl hover:-translate-y-2 hover:scale-105 shadow-sm'
              }`}
            >
              {isSelected && (
                <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-white text-orange-600 flex items-center justify-center text-[10px] font-bold shadow-md animate-in zoom-in">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
              )}

              {/* Icon / Image with Playful Hover Bounce & Scale */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden mb-2 bg-stone-100 dark:bg-stone-800 relative shadow-inner group-hover:scale-115 group-hover:-rotate-3 transition-transform duration-300">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </div>

              <span className="text-xs font-bold leading-tight text-center line-clamp-1 group-hover:text-orange-500 transition-colors">
                {cat.name}
              </span>
              <span
                className={`text-[10px] mt-0.5 font-medium text-center ${
                  isSelected ? 'text-white/80' : 'text-stone-400 dark:text-stone-500'
                }`}
              >
                {cat.dishCount} dishes
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
