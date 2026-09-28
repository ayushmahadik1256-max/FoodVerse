import React, { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { MenuItem, ItemCustomization } from '../../types';
import {
  X,
  Plus,
  Minus,
  Flame,
  Check,
  ShieldAlert,
  Sparkles,
  Info,
  Scale,
} from 'lucide-react';

interface DishCustomizationModalProps {
  item: MenuItem | null;
  onClose: () => void;
}

export const DishCustomizationModal: React.FC<DishCustomizationModalProps> = ({ item, onClose }) => {
  const { addToCart } = useAppStore();

  if (!item) return null;

  // Default variants if not specified on item
  const variants = item.availableVariants || [
    { name: 'Regular Portion', price: item.price },
    { name: 'Medium (+25%)', price: Math.round(item.price * 1.25) },
    { name: 'Large Gourmet Feast (+50%)', price: Math.round(item.price * 1.5) },
  ];

  // Default add-ons if not specified on item
  const defaultAddOns = item.availableAddOns || [
    { name: 'Extra Melted Aged Cheddar', price: 45 },
    { name: 'House Black Truffle Aioli Dip', price: 50 },
    { name: 'Crispy Caramelized Onions & Jalapeños', price: 35 },
    { name: 'Herb Roasted Wild Mushrooms', price: 60 },
    { name: 'Smoky Peri-Peri Seasoning Dust', price: 25 },
  ];

  // Nutritional breakdown
  const nutrition = item.nutrition || {
    calories: item.calories || 520,
    protein: item.isVeg ? 18 : 34,
    carbs: 48,
    fat: 22,
    allergens: item.isVeg ? ['Dairy', 'Gluten'] : ['Gluten', 'Eggs', 'Dairy'],
  };

  const [selectedVariant, setSelectedVariant] = useState(variants[0]);
  const [selectedAddOns, setSelectedAddOns] = useState<{ name: string; price: number }[]>([]);
  const [spiceLevel, setSpiceLevel] = useState<'Mild' | 'Medium' | 'Fiery'>('Medium');
  const [removedIngredients, setRemovedIngredients] = useState<string[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'customize' | 'nutrition'>('customize');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Calculate live unit price
  const unitPrice = useMemo(() => {
    const base = selectedVariant ? selectedVariant.price : item.price;
    const addOnsTotal = selectedAddOns.reduce((acc, curr) => acc + curr.price, 0);
    return base + addOnsTotal;
  }, [selectedVariant, selectedAddOns, item.price]);

  const totalPrice = unitPrice * quantity;

  const toggleAddOn = (addOn: { name: string; price: number }) => {
    setSelectedAddOns((prev) => {
      const exists = prev.some((a) => a.name === addOn.name);
      if (exists) {
        return prev.filter((a) => a.name !== addOn.name);
      }
      return [...prev, addOn];
    });
  };

  const toggleRemovedIngredient = (ing: string) => {
    setRemovedIngredients((prev) => {
      if (prev.includes(ing)) {
        return prev.filter((i) => i !== ing);
      }
      return [...prev, ing];
    });
  };

  const handleAddToCart = () => {
    const customization: ItemCustomization = {
      variant: selectedVariant,
      addOns: selectedAddOns,
      spiceLevel,
      removedIngredients,
      specialInstructions: specialInstructions.trim() || undefined,
    };

    addToCart(item, quantity, customization, specialInstructions.trim() || undefined);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header Hero Image */}
        <div className="relative h-44 sm:h-52 w-full bg-stone-100 dark:bg-stone-800 shrink-0">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Close button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-3.5 right-3.5 z-30 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-90 cursor-pointer pointer-events-auto border border-white/20 shadow-md"
            aria-label="Close customization"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Veg / Non-Veg badge */}
          <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
            <span
              className={`w-5 h-5 rounded-md flex items-center justify-center border-2 bg-white dark:bg-stone-900 ${
                item.isVeg ? 'border-emerald-500' : 'border-rose-500'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
            </span>
            {item.isBestSeller && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider shadow">
                ★ Chef's Bestseller
              </span>
            )}
          </div>

          {/* Title on Image */}
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <h2 className="text-lg sm:text-xl font-black leading-tight drop-shadow">
              {item.name}
            </h2>
            <p className="text-xs text-stone-200 line-clamp-1 mt-0.5 font-medium">
              {item.description}
            </p>
          </div>
        </div>

        {/* Tab switch: Customization vs Nutrition */}
        <div className="flex border-b border-stone-100 dark:border-stone-800 text-xs font-bold text-stone-500 shrink-0">
          <button
            onClick={() => setActiveTab('customize')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'customize'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50/20'
                : 'border-transparent hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Customize Recipe</span>
          </button>
          <button
            onClick={() => setActiveTab('nutrition')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'nutrition'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50/20'
                : 'border-transparent hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Nutrition & Allergens ({nutrition.calories} kcal)</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 space-y-5 overflow-y-auto flex-1">
          {activeTab === 'customize' ? (
            <>
              {/* SECTION 1: SIZE / VARIANT */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-900 dark:text-stone-100">
                    1. Select Portion / Size
                  </h3>
                  <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase">
                    Required
                  </span>
                </div>
                <div className="space-y-2">
                  {variants.map((v) => {
                    const isSelected = selectedVariant.name === v.name;
                    return (
                      <label
                        key={v.name}
                        onClick={() => setSelectedVariant(v)}
                        className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50/40 dark:bg-orange-950/20 shadow-sm'
                            : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? 'border-orange-500 bg-orange-500'
                                : 'border-stone-300 dark:border-stone-600'
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                            {v.name}
                          </span>
                        </div>
                        <span className="text-xs font-black text-stone-900 dark:text-stone-100">
                          ₹{v.price}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 2: SPICE LEVEL */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-900 dark:text-stone-100">
                    2. Spice Level
                  </h3>
                  <span className="text-[10px] font-bold text-stone-400">Optional</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { label: 'Mild', icon: '🟢', desc: 'Kid friendly' },
                      { label: 'Medium', icon: '🟡', desc: 'Standard balance' },
                      { label: 'Fiery', icon: '🔥', desc: 'Extra hot spice' },
                    ] as const
                  ).map((s) => {
                    const isSelected = spiceLevel === s.label;
                    return (
                      <button
                        key={s.label}
                        type="button"
                        onClick={() => setSpiceLevel(s.label)}
                        className={`p-2.5 rounded-2xl border text-center transition-all ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 font-extrabold'
                            : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 text-stone-600 dark:text-stone-400'
                        }`}
                      >
                        <div className="text-base">{s.icon}</div>
                        <div className="text-xs font-bold mt-0.5">{s.label}</div>
                        <div className="text-[9px] text-stone-400">{s.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 3: ADD-ONS */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-900 dark:text-stone-100">
                    3. Gourmet Add-Ons
                  </h3>
                  <span className="text-[10px] font-bold text-stone-400">Multiple selection</span>
                </div>
                <div className="space-y-2">
                  {defaultAddOns.map((addOn) => {
                    const isSelected = selectedAddOns.some((a) => a.name === addOn.name);
                    return (
                      <label
                        key={addOn.name}
                        onClick={() => toggleAddOn(addOn)}
                        className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50/30 dark:bg-orange-950/20'
                            : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                              isSelected
                                ? 'border-orange-500 bg-orange-500 text-white'
                                : 'border-stone-300 dark:border-stone-600'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                            {addOn.name}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                          +₹{addOn.price}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 4: REMOVE INGREDIENTS */}
              {item.ingredients && item.ingredients.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-900 dark:text-stone-100">
                      4. Remove Ingredients
                    </h3>
                    <span className="text-[10px] text-stone-400">Exclude from preparation</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.ingredients.map((ing) => {
                      const isRemoved = removedIngredients.includes(ing);
                      return (
                        <button
                          key={ing}
                          type="button"
                          onClick={() => toggleRemovedIngredient(ing)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                            isRemoved
                              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 text-rose-600 dark:text-rose-300 line-through'
                              : 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-rose-300'
                          }`}
                        >
                          {isRemoved ? `✕ No ${ing}` : ing}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SECTION 5: SPECIAL INSTRUCTIONS */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-900 dark:text-stone-100 mb-1.5">
                  5. Chef's Special Notes
                </label>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="e.g. Extra napkins, dressing on the side, cut burger into half..."
                  rows={2}
                  className="w-full p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
              </div>
            </>
          ) : (
            /* TAB: NUTRITION & ALLERGENS */
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-3 rounded-2xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/60">
                  <div className="text-base font-black text-orange-600 dark:text-orange-400">
                    {nutrition.calories}
                  </div>
                  <div className="text-[10px] uppercase font-bold text-stone-500">Calories</div>
                </div>
                <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                  <div className="text-base font-black text-stone-800 dark:text-stone-200">
                    {nutrition.protein}g
                  </div>
                  <div className="text-[10px] uppercase font-bold text-stone-500">Protein</div>
                </div>
                <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                  <div className="text-base font-black text-stone-800 dark:text-stone-200">
                    {nutrition.carbs}g
                  </div>
                  <div className="text-[10px] uppercase font-bold text-stone-500">Carbs</div>
                </div>
                <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                  <div className="text-base font-black text-stone-800 dark:text-stone-200">
                    {nutrition.fat}g
                  </div>
                  <div className="text-[10px] uppercase font-bold text-stone-500">Fat</div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-2 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  <span>Allergen Notice</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {nutrition.allergens && nutrition.allergens.length > 0 ? (
                    nutrition.allergens.map((allg) => (
                      <span
                        key={allg}
                        className="px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold"
                      >
                        ⚠️ Contains {allg}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-stone-400">No common allergens declared.</span>
                  )}
                </div>
              </div>

              {item.ingredients && (
                <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                  <h4 className="text-xs font-black text-stone-800 dark:text-stone-200 mb-1">
                    Fresh Kitchen Ingredients
                  </h4>
                  <p className="text-xs text-stone-600 dark:text-stone-400">
                    {item.ingredients.join(' • ')}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sticky Reactive Footer */}
        <div className="p-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/90 flex items-center justify-between gap-3 shrink-0">
          {/* Quantity selector */}
          <div className="flex items-center gap-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl p-1 shrink-0">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-8 h-8 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-700 flex items-center justify-center text-stone-700 dark:text-stone-300 font-bold transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-6 text-center text-xs font-black text-stone-900 dark:text-stone-100">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-8 h-8 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-700 flex items-center justify-center text-stone-700 dark:text-stone-300 font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add to Bag Button */}
          <button
            onClick={handleAddToCart}
            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-extrabold text-xs shadow-lg shadow-orange-500/25 flex items-center justify-between transition-all active:scale-[0.99]"
          >
            <span>Add Customized Item</span>
            <span className="font-black text-sm">₹{totalPrice}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
