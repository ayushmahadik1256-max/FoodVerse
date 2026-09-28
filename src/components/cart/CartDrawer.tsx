import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Tag,
  ShoppingBag,
  ArrowRight,
  MapPin,
  Sparkles,
  Check,
  Coins,
  Flame,
  Info,
  ChevronRight,
  Gift,
} from 'lucide-react';
import { Address } from '../../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: (address: Address) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onProceedToCheckout }) => {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartTotals,
    coupons,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    autoApplyBestCoupon,
    redeemLoyaltyPoints,
    toggleRedeemLoyaltyPoints,
    setRedeemedPoints,
    currentUser,
    openAuthModal,
    selectedTip,
    setSelectedTip,
  } = useAppStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [showAllCoupons, setShowAllCoupons] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleApplyCoupon = (code: string) => {
    setCouponError('');
    const res = applyCoupon(code);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponInput('');
    }
  };

  const handleAutoApply = () => {
    setCouponError('');
    const res = autoApplyBestCoupon();
    if (!res.success) {
      setCouponError(res.message);
    }
  };

  const activeAddress =
    currentUser.addresses.find((a) => a.isDefault) || currentUser.addresses[0];

  const handleCheckoutClick = () => {
    if (currentUser.isGuest) {
      openAuthModal('login', () => {
        if (activeAddress) onProceedToCheckout(activeAddress);
      });
      return;
    }
    if (activeAddress) {
      onProceedToCheckout(activeAddress);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in"
    >
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-screen max-w-md bg-white dark:bg-stone-900 shadow-2xl flex flex-col justify-between border-l border-stone-200 dark:border-stone-800"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-stone-900 dark:text-stone-100">Your Gourmet Bag</h3>
                <p className="text-xs text-stone-400">
                  {cart.length} {cart.length === 1 ? 'dish' : 'dishes'} in order
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs text-stone-400 hover:text-rose-500 font-semibold transition-colors cursor-pointer"
                >
                  Clear Bag
                </button>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose();
                }}
                className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 flex items-center justify-center transition-all active:scale-90 cursor-pointer pointer-events-auto"
                aria-label="Close cart"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-20 h-20 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-3xl mb-4">
                  🥣
                </div>
                <h4 className="text-base font-bold text-stone-800 dark:text-stone-200">Your bag is empty</h4>
                <p className="text-xs text-stone-400 max-w-[220px] mt-1">
                  Explore curated menus, customize recipes, and enjoy lightning-fast delivery.
                </p>
                <button
                  onClick={onClose}
                  className="mt-5 px-5 py-2.5 rounded-2xl bg-orange-500 text-white text-xs font-bold shadow-md shadow-orange-500/20 hover:bg-orange-600 transition-all"
                >
                  Explore Menus
                </button>
              </div>
            ) : (
              <>
                {/* List of Cart Items */}
                <div className="space-y-3">
                  {cart.map((item, index) => (
                    <div
                      key={`${item.menuItemId}-${index}`}
                      className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800 flex flex-col gap-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-14 rounded-xl object-cover shrink-0"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'
                              }`}
                            />
                            <h5 className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                              {item.name}
                            </h5>
                          </div>

                          {/* Customization Details */}
                          {item.customization && (
                            <div className="text-[10px] text-stone-500 dark:text-stone-400 space-y-0.5 mt-1 font-medium">
                              {item.customization.variant && (
                                <div>Portion: <strong>{item.customization.variant.name}</strong></div>
                              )}
                              {item.customization.spiceLevel && (
                                <div>Spice: <strong>{item.customization.spiceLevel}</strong></div>
                              )}
                              {item.customization.addOns.length > 0 && (
                                <div>Add-ons: {item.customization.addOns.map((a) => a.name).join(', ')}</div>
                              )}
                              {item.customization.removedIngredients.length > 0 && (
                                <div className="text-rose-500 line-through">
                                  No {item.customization.removedIngredients.join(', ')}
                                </div>
                              )}
                              {item.customization.specialInstructions && (
                                <div className="italic text-stone-400">
                                  Note: "{item.customization.specialInstructions}"
                                </div>
                              )}
                            </div>
                          )}

                          <div className="text-xs font-black text-stone-900 dark:text-stone-100 mt-1">
                            ₹{item.price * item.quantity}
                          </div>
                        </div>

                        {/* Quantity Stepper */}
                        <div className="flex items-center gap-1 bg-white dark:bg-stone-900 rounded-xl p-1 border border-stone-200 dark:border-stone-700 shadow-sm shrink-0">
                          <button
                            onClick={() => updateCartQuantity(item.menuItemId, -1)}
                            className="w-6 h-6 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center text-stone-600 dark:text-stone-300 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold px-1.5 text-stone-800 dark:text-stone-200">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.menuItemId, 1)}
                            className="w-6 h-6 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center text-stone-600 dark:text-stone-300 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.menuItemId)}
                          className="text-stone-400 hover:text-rose-500 transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Auto-Apply Best Offer Banner */}
                <div className="p-3 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-rose-500/10 border border-orange-500/20 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-orange-500 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                        Smart Savings Engine
                      </div>
                      <div className="text-[10px] text-stone-500">
                        Automatically calculates & applies maximum coupon discount
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleAutoApply}
                    className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-black shrink-0 shadow-sm transition-all"
                  >
                    Auto-Apply
                  </button>
                </div>

                {/* Coupon Box */}
                <div className="pt-1">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-orange-500" />
                      <span>Promotions & Bank Deals</span>
                    </label>
                    <button
                      onClick={() => setShowAllCoupons(!showAllCoupons)}
                      className="text-[11px] font-bold text-orange-600 dark:text-orange-400 hover:underline"
                    >
                      {showAllCoupons ? 'Hide Deals' : 'View All (5)'}
                    </button>
                  </div>

                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        <span>Code <strong>{appliedCoupon.code}</strong> applied (Saved ₹{cartTotals.discount})</span>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-[11px] underline font-bold hover:text-emerald-800"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter Promo Code"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value)}
                          className="flex-1 px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 border border-transparent focus:border-orange-500 text-xs uppercase font-mono text-stone-900 dark:text-stone-100 focus:outline-none"
                        />
                        <button
                          onClick={() => handleApplyCoupon(couponInput)}
                          className="px-4 py-2 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-bold hover:bg-stone-800 transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                      {couponError && <p className="text-xs text-rose-500 mt-1">{couponError}</p>}

                      {/* Coupon Chips */}
                      {showAllCoupons ? (
                        <div className="space-y-2 mt-2">
                          {coupons.map((c) => (
                            <div
                              key={c.code}
                              className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40 flex items-center justify-between gap-2"
                            >
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono font-black text-xs text-orange-600 dark:text-orange-400">
                                    {c.code}
                                  </span>
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold uppercase">
                                    {c.category}
                                  </span>
                                </div>
                                <div className="text-[10px] text-stone-500 mt-0.5">{c.terms}</div>
                              </div>
                              <button
                                onClick={() => handleApplyCoupon(c.code)}
                                className="px-3 py-1 rounded-lg bg-orange-500 text-white text-[11px] font-bold hover:bg-orange-600"
                              >
                                Apply
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {coupons.slice(0, 3).map((c) => (
                            <button
                              key={c.code}
                              onClick={() => handleApplyCoupon(c.code)}
                              className="text-[10px] px-2.5 py-1 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 hover:bg-orange-500 hover:text-white transition-all font-semibold"
                            >
                              {c.code} ({c.discountPercentage}% off)
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Loyalty Points Redemption Widget */}
                <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 text-white flex items-center justify-center font-bold shadow-sm shadow-amber-500/20">
                        <Coins className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                          <span>FoodVerse Points</span>
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 text-[10px] font-black">
                            {cartTotals.availablePoints} pts
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-500 dark:text-stone-400">
                          1 pt = ₹1 discount • Earn 10% on every order
                        </div>
                      </div>
                    </div>

                    {cartTotals.availablePoints > 0 ? (
                      <button
                        type="button"
                        onClick={() => toggleRedeemLoyaltyPoints()}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs flex items-center gap-1 shrink-0 ${
                          redeemLoyaltyPoints
                            ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                            : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 hover:bg-amber-500 hover:text-white'
                        }`}
                      >
                        {redeemLoyaltyPoints ? 'Applied' : 'Redeem'}
                      </button>
                    ) : (
                      <span className="text-[11px] text-stone-400 font-medium">0 pts</span>
                    )}
                  </div>

                  {/* Active Redemption Controls & Slider */}
                  {redeemLoyaltyPoints && cartTotals.maxRedeemablePoints > 0 && (
                    <div className="mt-3 pt-3 border-t border-amber-500/20 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-stone-700 dark:text-stone-300">
                          Redeeming: <strong>{cartTotals.pointsRedeemed} points</strong>
                        </span>
                        <span className="font-black text-amber-600 dark:text-amber-400">
                          -₹{cartTotals.loyaltyDiscount}.00 discount
                        </span>
                      </div>

                      {cartTotals.maxRedeemablePoints > 1 && (
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min={1}
                            max={cartTotals.maxRedeemablePoints}
                            value={cartTotals.pointsRedeemed}
                            onChange={(e) => setRedeemedPoints(Number(e.target.value))}
                            className="w-full accent-amber-500 cursor-pointer h-1.5 bg-amber-200 dark:bg-amber-900/40 rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => setRedeemedPoints(cartTotals.maxRedeemablePoints)}
                            className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 hover:bg-amber-500 hover:text-white transition-all shrink-0"
                          >
                            Max
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Reward earnings note */}
                  <div className="mt-2.5 pt-2 border-t border-amber-500/10 flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>You will earn <strong>+{cartTotals.pointsToEarn} points</strong> on this order!</span>
                  </div>
                </div>

                {/* Delivery Tip quick bar */}
                <div className="pt-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                      Rider Tip
                    </span>
                    <span className="text-[10px] text-stone-400">Optional</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[0, 20, 30, 50].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSelectedTip(t)}
                        className={`py-1.5 rounded-xl border text-xs font-bold transition-all ${
                          selectedTip === t
                            ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400'
                            : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'
                        }`}
                      >
                        {t === 0 ? '₹0' : `₹${t}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bill Breakdown */}
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800 space-y-2 text-xs">
                  <div className="flex justify-between text-stone-600 dark:text-stone-400">
                    <span>Subtotal</span>
                    <span className="font-semibold text-stone-800 dark:text-stone-200">
                      ₹{cartTotals.subtotal}
                    </span>
                  </div>

                  {cartTotals.discount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                      <span>Coupon Discount</span>
                      <span>-₹{cartTotals.discount}</span>
                    </div>
                  )}

                  {cartTotals.loyaltyDiscount > 0 && (
                    <div className="flex justify-between text-amber-600 dark:text-amber-400 font-semibold">
                      <span className="flex items-center gap-1">
                        <Coins className="w-3 h-3" />
                        <span>Points Discount ({cartTotals.pointsRedeemed} pts)</span>
                      </span>
                      <span>-₹{cartTotals.loyaltyDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-stone-600 dark:text-stone-400">
                    <span>Delivery Fee</span>
                    <span>{cartTotals.deliveryFee === 0 ? 'FREE' : `₹${cartTotals.deliveryFee}`}</span>
                  </div>

                  <div className="flex justify-between text-stone-600 dark:text-stone-400">
                    <span>Packaging & Platform Charges</span>
                    <span>₹{cartTotals.packagingFee + cartTotals.platformFee}</span>
                  </div>

                  {selectedTip > 0 && (
                    <div className="flex justify-between text-stone-600 dark:text-stone-400">
                      <span>Rider Tip</span>
                      <span>₹{selectedTip}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-stone-600 dark:text-stone-400">
                    <span>Taxes (5% GST)</span>
                    <span>₹{cartTotals.tax}</span>
                  </div>

                  <div className="pt-2 border-t border-stone-200 dark:border-stone-700 flex justify-between text-sm font-black text-stone-900 dark:text-stone-100">
                    <span>Total Amount</span>
                    <span>₹{cartTotals.total.toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Checkout Footer Button */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900">
              <button
                onClick={handleCheckoutClick}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-black text-sm flex items-center justify-between shadow-xl shadow-orange-500/25 transition-all active:scale-[0.99]"
              >
                <div className="text-left">
                  <div className="text-[11px] text-white/80 font-normal">
                    {currentUser.isGuest ? 'Sign In & Pay' : 'Pay & Dispatch'}
                  </div>
                  <div>₹{cartTotals.total.toFixed(2)}</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
