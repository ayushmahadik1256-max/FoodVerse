import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Address } from '../../types';
import { AddressBookModal } from './AddressBookModal';
import { fetchPaymentConfig } from '../../services/accountApi';
import {
  X,
  MapPin,
  Clock,
  CreditCard,
  Banknote,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Plus,
  Coins,
  HeartHandshake,
  QrCode,
  Smartphone,
  RotateCcw,
  Wallet,
  Lock,
  Zap,
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (orderId: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const {
    currentUser,
    cart,
    cartTotals,
    appliedCoupon,
    createOrder,
    openAuthModal,
    selectedTip,
    setSelectedTip,
    addNotification,
  } = useAppStore();

  // Selected address state
  const defaultAddress = currentUser.addresses.find((a) => a.isDefault) || currentUser.addresses[0];
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(defaultAddress || null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  // Delivery instructions
  const [deliveryInstruction, setDeliveryInstruction] = useState<string>('Leave at door');
  const [customDeliveryNote, setCustomDeliveryNote] = useState<string>('');

  // Scheduling
  const [deliveryType, setDeliveryType] = useState<'now' | 'schedule'>('now');
  const [scheduledSlot, setScheduledSlot] = useState<string>('Today, 7:30 PM - 8:00 PM');

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'upi' | 'card' | 'cod' | 'wallet'>('cod');
  const [upiId, setUpiId] = useState('ayush@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [simulateFailure, setSimulateFailure] = useState(false);

  // Processing, Success & Error states
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'checkout' | 'payment' | 'processing' | 'success' | 'failed'>('checkout');
  const [lastPlacedOrder, setLastPlacedOrder] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && checkoutStep !== 'processing') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, checkoutStep, onClose]);

  if (!isOpen) return null;

  const tipOptions = [0, 20, 30, 50];

  const handleProceedToPayment = () => {
    if (currentUser.isGuest) {
      openAuthModal('login', () => {});
      return;
    }
    if (!selectedAddress) {
      setIsAddressModalOpen(true);
      return;
    }
    setCheckoutStep('payment');
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    setCheckoutStep('processing');

    if (simulateFailure) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setIsProcessing(false);
      setCheckoutStep('failed');
      setErrorMessage('Bank gateway simulation: Transaction declined by card issuer.');
      return;
    }

    try {
      // Simulate realistic short gateway authorization delay for online methods (UPI / Razorpay)
      if (paymentMethod !== 'cod') {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }

      const fullInstructions = [
        deliveryInstruction,
        customDeliveryNote.trim(),
      ].filter(Boolean).join(' • ');

      const scheduledTime = deliveryType === 'schedule' ? scheduledSlot : undefined;

      const generatedPaymentId = paymentMethod === 'razorpay'
        ? `pay_rzp_${Date.now()}`
        : paymentMethod === 'upi'
        ? `upi_ref_${Date.now()}`
        : undefined;

      const order = await createOrder(selectedAddress!, paymentMethod, {
        deliveryInstructions: fullInstructions,
        tipAmount: selectedTip,
        scheduledFor: scheduledTime,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
        paymentId: generatedPaymentId,
        paymentVerified: paymentMethod !== 'cod',
      });

      setIsProcessing(false);
      setLastPlacedOrder(order);
      setCheckoutStep('success');
      onOrderSuccess(order.id);
      onClose();
    } catch (err: any) {
      setIsProcessing(false);
      setCheckoutStep('failed');
      setErrorMessage(err?.message || 'Could not process order. Please try again.');
    }
  };

  const handleRetryPayment = () => {
    setSimulateFailure(false);
    setCheckoutStep('payment');
    setErrorMessage(null);
  };

  /* ─── Derived labels ─── */
  const stepTitle = {
    checkout: 'Finalize Order & Delivery',
    payment: 'Choose Payment Method',
    processing: 'Securing Your Gourmet Ticket...',
    success: 'Order Confirmed! 🎉',
    failed: 'Payment Declined',
  }[checkoutStep];

  const paymentMethodMeta: Record<string, { label: string; sub: string; color: string; badge?: string }> = {
    cod: {
      label: 'Cash on Delivery',
      sub: 'Pay at your door',
      color: 'text-amber-600',
    },
    razorpay: {
      label: 'Razorpay',
      sub: 'Cards, UPI, NetBanking, Wallets',
      color: 'text-blue-600',
      badge: 'Recommended',
    },
    upi: {
      label: 'UPI / GPay / PhonePe',
      sub: 'Instant zero-fee transfer',
      color: 'text-emerald-600',
    },
    card: {
      label: 'Credit / Debit Card',
      sub: 'Visa, Mastercard, RuPay',
      color: 'text-violet-600',
    },
  };

  return (
    <>
      <div
        onClick={() => {
          if (checkoutStep !== 'processing') onClose();
        }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* ── Header ── */}
          <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-900/50 shrink-0">
            <div className="flex items-center gap-2">
              {checkoutStep === 'payment' && (
                <button
                  type="button"
                  onClick={() => setCheckoutStep('checkout')}
                  className="w-7 h-7 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center text-stone-500 transition-all mr-1"
                  aria-label="Back to checkout"
                >
                  <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                </button>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">🛵</span>
                  <span className="text-[10px] font-black tracking-widest uppercase text-orange-600 dark:text-orange-400">
                    Instant Dispatch Checkout
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-stone-900 dark:text-stone-100 mt-0.5">
                  {stepTitle}
                </h2>
              </div>
            </div>
            {checkoutStep !== 'processing' && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose();
                }}
                className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center text-stone-500 transition-all active:scale-90 cursor-pointer pointer-events-auto"
                aria-label="Close checkout"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>

          {/* ══════════════════════════════════════════════════
              VIEW: PROCESSING
          ══════════════════════════════════════════════════ */}
          {checkoutStep === 'processing' && (
            <div className="p-12 text-center space-y-4 my-auto">
              <div className="relative w-16 h-16 mx-auto">
                <div className="w-16 h-16 rounded-full border-4 border-orange-500/20 border-t-orange-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-xl">🍕</div>
              </div>
              <h3 className="text-base font-black text-stone-900 dark:text-stone-100">
                {paymentMethod === 'cod'
                  ? 'Confirming Cash on Delivery Order'
                  : paymentMethod === 'upi'
                  ? 'Authorizing Instant UPI Payment'
                  : 'Authorizing Razorpay Gateway'}
              </h3>
              <p className="text-xs text-stone-400 max-w-sm mx-auto">
                {paymentMethod === 'cod'
                  ? 'Reserving your delivery slot and routing your order ticket to the kitchen...'
                  : 'Connecting to 256-bit bank gateway and transmitting your ticket to the kitchen...'}
              </p>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              VIEW: SUCCESS SCREEN
          ══════════════════════════════════════════════════ */}
          {checkoutStep === 'success' && lastPlacedOrder && (
            <div className="p-6 sm:p-8 text-center space-y-5 overflow-y-auto">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center text-3xl shadow-inner">
                ✓
              </div>
              <div>
                <h3 className="text-2xl font-black text-stone-900 dark:text-stone-100">
                  Order #{lastPlacedOrder.orderNumber} Placed!
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  Estimated Arrival: <strong className="text-stone-800 dark:text-stone-200">{lastPlacedOrder.estimatedDeliveryTime}</strong>
                </p>
              </div>

              <div className="max-w-md mx-auto p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-left space-y-2 text-xs">
                <div className="flex justify-between text-stone-500">
                  <span>Restaurant:</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200">{lastPlacedOrder.restaurantName}</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>Delivery Address:</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200">{lastPlacedOrder.deliveryAddress.street}</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>Total Amount Paid:</span>
                  <span className="font-black text-stone-900 dark:text-stone-100">₹{lastPlacedOrder.totalAmount} ({lastPlacedOrder.paymentMethod.toUpperCase()})</span>
                </div>
                {lastPlacedOrder.loyaltyPointsEarned > 0 && (
                  <div className="flex justify-between text-amber-600 dark:text-amber-400 font-bold pt-1 border-t border-stone-200/60 dark:border-stone-700">
                    <span>Loyalty Points Earned:</span>
                    <span>+{lastPlacedOrder.loyaltyPointsEarned} pts ✨</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onOrderSuccess(lastPlacedOrder.id);
                  }}
                  className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-extrabold text-xs shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2"
                >
                  <span>Track Live Courier 🛵</span>
                </button>
                <button
                  onClick={onClose}
                  className="py-3 px-4 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs hover:bg-stone-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              VIEW: FAILED PAYMENT SCREEN
          ══════════════════════════════════════════════════ */}
          {checkoutStep === 'failed' && (
            <div className="p-6 sm:p-8 text-center space-y-4 my-auto">
              <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-600 mx-auto flex items-center justify-center text-3xl">
                ✕
              </div>
              <h3 className="text-xl font-black text-stone-900 dark:text-stone-100">
                Payment Was Not Completed
              </h3>
              <p className="text-xs text-rose-600 dark:text-rose-400 max-w-sm mx-auto">
                {errorMessage}
              </p>

              <div className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto pt-4">
                <button
                  onClick={handleRetryPayment}
                  className="flex-1 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry Payment</span>
                </button>
                <button
                  onClick={() => {
                    setPaymentMethod('cod');
                    setSimulateFailure(false);
                    setCheckoutStep('payment');
                  }}
                  className="flex-1 py-3 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-bold hover:bg-stone-200 transition-colors"
                >
                  Switch to Cash on Delivery
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              VIEW: MAIN CHECKOUT STEP
          ══════════════════════════════════════════════════ */}
          {checkoutStep === 'checkout' && (
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
              {/* SECTION 1: DELIVERY ADDRESS */}
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/80">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-stone-900 dark:text-stone-100">
                      Delivery Location
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsAddressModalOpen(true)}
                    className="text-xs font-extrabold text-orange-600 dark:text-orange-400 hover:underline"
                  >
                    {selectedAddress ? 'Change' : 'Select'} Address
                  </button>
                </div>

                {selectedAddress ? (
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-stone-200 dark:bg-stone-700 text-[10px] font-black uppercase text-stone-700 dark:text-stone-300">
                        {selectedAddress.label}
                      </span>
                      <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                        {selectedAddress.street}
                      </span>
                    </div>
                    {selectedAddress.apartment && (
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        {selectedAddress.apartment}
                      </p>
                    )}
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.zip}
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddressModalOpen(true)}
                    className="w-full py-2.5 rounded-xl border border-dashed border-orange-400 text-orange-600 text-xs font-bold"
                  >
                    + Choose or Add Delivery Address
                  </button>
                )}
              </div>

              {/* SECTION 2: DELIVERY TIMING (NOW vs SCHEDULED) */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-stone-900 dark:text-stone-100 mb-2 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span>Order Timing</span>
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('now')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      deliveryType === 'now'
                        ? 'border-orange-500 bg-orange-50/40 dark:bg-orange-950/20'
                        : 'border-stone-200 dark:border-stone-800'
                    }`}
                  >
                    <div className="text-xs font-bold text-stone-900 dark:text-stone-100">Deliver Now</div>
                    <div className="text-[10px] text-stone-400">Estimated 25-35 mins</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryType('schedule')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      deliveryType === 'schedule'
                        ? 'border-orange-500 bg-orange-50/40 dark:bg-orange-950/20'
                        : 'border-stone-200 dark:border-stone-800'
                    }`}
                  >
                    <div className="text-xs font-bold text-stone-900 dark:text-stone-100">Schedule Later</div>
                    <div className="text-[10px] text-stone-400">Pick preferred time slot</div>
                  </button>
                </div>

                {deliveryType === 'schedule' && (
                  <div className="mt-2.5 p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                    <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                      Choose Time Window
                    </label>
                    <select
                      value={scheduledSlot}
                      onChange={(e) => setScheduledSlot(e.target.value)}
                      className="w-full p-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-900 dark:text-stone-100"
                    >
                      <option value="Today, 7:00 PM - 7:30 PM">Today: 7:00 PM - 7:30 PM</option>
                      <option value="Today, 8:00 PM - 8:30 PM">Today: 8:00 PM - 8:30 PM</option>
                      <option value="Today, 9:00 PM - 9:30 PM">Today: 9:00 PM - 9:30 PM</option>
                      <option value="Tomorrow, 1:00 PM - 1:30 PM (Lunch)">Tomorrow: 1:00 PM - 1:30 PM (Lunch)</option>
                      <option value="Tomorrow, 7:30 PM - 8:00 PM (Dinner)">Tomorrow: 7:30 PM - 8:00 PM (Dinner)</option>
                    </select>
                  </div>
                )}
              </div>

              {/* SECTION 3: DELIVERY INSTRUCTIONS */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-stone-900 dark:text-stone-100 mb-2">
                  Delivery Partner Instructions
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Leave at door',
                    'Avoid ringing bell',
                    'Call upon arrival',
                    'Leave with security gate',
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setDeliveryInstruction(chip)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        deliveryInstruction === chip
                          ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                      }`}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={customDeliveryNote}
                  onChange={(e) => setCustomDeliveryNote(e.target.value)}
                  placeholder="Optional custom instructions for rider..."
                  className="mt-2 w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* SECTION 4: DELIVERY TIP */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <HeartHandshake className="w-4 h-4 text-rose-500" />
                    <span>Tip Delivery Partner</span>
                  </h3>
                  <span className="text-[10px] text-stone-400">100% goes directly to Rohan</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {tipOptions.map((tip) => (
                    <button
                      key={tip}
                      type="button"
                      onClick={() => setSelectedTip(tip)}
                      className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                        selectedTip === tip
                          ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400'
                          : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'
                      }`}
                    >
                      {tip === 0 ? 'No Tip' : `₹${tip}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION 5: BILL BREAKDOWN */}
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-2 text-xs">
                <h4 className="font-black text-stone-900 dark:text-stone-100 uppercase tracking-wider mb-2">
                  Bill Summary
                </h4>
                <div className="flex justify-between text-stone-600 dark:text-stone-400">
                  <span>Item Subtotal ({cart.length} items)</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200">₹{cartTotals.subtotal}</span>
                </div>
                {cartTotals.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                    <span>Coupon Savings ({appliedCoupon?.code})</span>
                    <span>-₹{cartTotals.discount}</span>
                  </div>
                )}
                {cartTotals.loyaltyDiscount > 0 && (
                  <div className="flex justify-between text-amber-600 dark:text-amber-400 font-bold">
                    <span>Loyalty Points Redeemed ({cartTotals.pointsRedeemed} pts)</span>
                    <span>-₹{cartTotals.loyaltyDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600 dark:text-stone-400">
                  <span>Standard Delivery Fee</span>
                  <span>{cartTotals.deliveryFee === 0 ? 'FREE' : `₹${cartTotals.deliveryFee}`}</span>
                </div>
                <div className="flex justify-between text-stone-600 dark:text-stone-400">
                  <span>Restaurant Packaging Charges</span>
                  <span>₹{cartTotals.packagingFee}</span>
                </div>
                <div className="flex justify-between text-stone-600 dark:text-stone-400">
                  <span>Platform Service Fee</span>
                  <span>₹{cartTotals.platformFee}</span>
                </div>
                {selectedTip > 0 && (
                  <div className="flex justify-between text-stone-600 dark:text-stone-400">
                    <span>Courier Tip</span>
                    <span>₹{selectedTip}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600 dark:text-stone-400">
                  <span>Govt. Taxes & GST (5%)</span>
                  <span>₹{cartTotals.tax}</span>
                </div>

                <div className="pt-2 border-t border-stone-200 dark:border-stone-700 flex justify-between items-baseline font-black text-sm text-stone-900 dark:text-stone-100">
                  <span>To Pay</span>
                  <span className="text-base text-orange-600 dark:text-orange-400">₹{cartTotals.total}</span>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              VIEW: PAYMENT METHOD SELECTION (NEW DEDICATED STEP)
          ══════════════════════════════════════════════════ */}
          {checkoutStep === 'payment' && (
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">

              {/* Amount Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 via-rose-500/10 to-orange-500/10 border border-orange-200 dark:border-orange-900/50 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400">Total Payable</p>
                  <p className="text-2xl font-black text-stone-900 dark:text-stone-100 mt-0.5">₹{cartTotals.total}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-stone-500">Delivering to</p>
                  <p className="text-xs font-bold text-stone-700 dark:text-stone-300 max-w-[160px] truncate">
                    {selectedAddress?.street}, {selectedAddress?.city}
                  </p>
                </div>
              </div>

              {/* Payment Method Cards */}
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Select Payment Method</p>

                {/* ── COD Card ── */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-all group relative overflow-hidden ${
                    paymentMethod === 'cod'
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30 shadow-lg shadow-amber-500/10'
                      : 'border-stone-200 dark:border-stone-700 hover:border-amber-300 dark:hover:border-amber-700 bg-white dark:bg-stone-800/40'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                      paymentMethod === 'cod'
                        ? 'bg-amber-500 shadow-lg shadow-amber-500/30'
                        : 'bg-amber-100 dark:bg-amber-900/30'
                    }`}>
                      <Banknote className={`w-7 h-7 ${paymentMethod === 'cod' ? 'text-white' : 'text-amber-600 dark:text-amber-400'}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-black text-stone-900 dark:text-stone-100">Cash on Delivery</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-[9px] font-black uppercase">
                          No Advance Payment
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                        Pay with cash or UPI scan at your doorstep when the order arrives
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] text-stone-400 flex items-center gap-1">💵 Cash</span>
                        <span className="text-[10px] text-stone-400 flex items-center gap-1">📱 UPI QR at door</span>
                      </div>
                    </div>

                    {/* Radio */}
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-amber-500 bg-amber-500'
                        : 'border-stone-300 dark:border-stone-600'
                    }`}>
                      {paymentMethod === 'cod' && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>
                </button>

                {/* ── Razorpay Card ── */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-all group relative overflow-hidden ${
                    paymentMethod === 'razorpay'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 shadow-lg shadow-blue-500/10'
                      : 'border-stone-200 dark:border-stone-700 hover:border-blue-300 dark:hover:border-blue-700 bg-white dark:bg-stone-800/40'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                      paymentMethod === 'razorpay'
                        ? 'bg-blue-600 shadow-lg shadow-blue-500/30'
                        : 'bg-blue-100 dark:bg-blue-900/30'
                    }`}>
                      <span className={`text-xl font-black ${paymentMethod === 'razorpay' ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`}>
                        ₹
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-black text-stone-900 dark:text-stone-100">Razorpay</span>
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-[9px] font-black uppercase">
                          ⭐ Recommended
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                        Credit/Debit Cards, UPI, Net Banking, Wallets & more
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] text-stone-400">💳 Cards</span>
                        <span className="text-[10px] text-stone-400">📲 UPI</span>
                        <span className="text-[10px] text-stone-400">🏦 NetBanking</span>
                        <span className="text-[10px] text-stone-400">👛 Wallets</span>
                      </div>
                    </div>

                    {/* Radio */}
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      paymentMethod === 'razorpay'
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-stone-300 dark:border-stone-600'
                    }`}>
                      {paymentMethod === 'razorpay' && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>
                </button>

                {/* ── UPI Direct Card ── */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-all group relative overflow-hidden ${
                    paymentMethod === 'upi'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 shadow-lg shadow-emerald-500/10'
                      : 'border-stone-200 dark:border-stone-700 hover:border-emerald-300 dark:hover:border-emerald-700 bg-white dark:bg-stone-800/40'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                      paymentMethod === 'upi'
                        ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30'
                        : 'bg-emerald-100 dark:bg-emerald-900/30'
                    }`}>
                      <Smartphone className={`w-7 h-7 ${paymentMethod === 'upi' ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-black text-stone-900 dark:text-stone-100">UPI / GPay / PhonePe</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-[9px] font-black uppercase">
                          Zero Fee
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                        Instant transfer via your preferred UPI app — no extra charges
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] text-stone-400">🔷 GPay</span>
                        <span className="text-[10px] text-stone-400">🟣 PhonePe</span>
                        <span className="text-[10px] text-stone-400">🔵 Paytm</span>
                        <span className="text-[10px] text-stone-400">🔴 BHIM</span>
                      </div>
                    </div>

                    {/* Radio */}
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      paymentMethod === 'upi'
                        ? 'border-emerald-500 bg-emerald-500'
                        : 'border-stone-300 dark:border-stone-600'
                    }`}>
                      {paymentMethod === 'upi' && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>
                </button>
              </div>

              {/* Security Badge */}
              <div className="flex items-center justify-center gap-2 pt-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-[11px] text-stone-400">256-bit SSL encrypted • RBI compliant • PCI-DSS secure</span>
              </div>
            </div>
          )}

          {/* ── Sticky Checkout CTA Footer ── */}
          {checkoutStep === 'checkout' && (
            <div className="p-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/90 flex items-center justify-between gap-3 shrink-0">
              <div>
                <span className="block text-[10px] font-black uppercase text-stone-400">Total Payable</span>
                <span className="text-lg font-black text-stone-900 dark:text-stone-100">
                  ₹{cartTotals.total}
                </span>
              </div>
              <button
                onClick={handleProceedToPayment}
                disabled={isProcessing}
                className="py-3 px-6 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-black text-xs shadow-lg shadow-orange-500/25 flex items-center gap-2 transition-all active:scale-[0.99]"
              >
                <span>
                  {currentUser.isGuest ? 'Sign In & Continue' : 'Choose Payment'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── Payment Confirmation Footer ── */}
          {checkoutStep === 'payment' && (
            <div className="p-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/90 shrink-0">
              {/* Selected method summary */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  {paymentMethod === 'cod' && <Banknote className="w-4 h-4 text-amber-500" />}
                  {paymentMethod === 'razorpay' && <CreditCard className="w-4 h-4 text-blue-500" />}
                  {paymentMethod === 'upi' && <Smartphone className="w-4 h-4 text-emerald-500" />}
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                    {paymentMethodMeta[paymentMethod]?.label ?? paymentMethod.toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-black text-stone-900 dark:text-stone-100">₹{cartTotals.total}</span>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className={`w-full py-3.5 px-5 rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 shadow-lg transition-all active:scale-[0.99] ${
                  paymentMethod === 'cod'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-500/25'
                    : paymentMethod === 'upi'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/25'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/25'
                } text-white`}
              >
                <Lock className="w-4 h-4" />
                <span>
                  {paymentMethod === 'cod'
                    ? `Confirm Cash on Delivery • ₹${cartTotals.total}`
                    : `Pay ₹${cartTotals.total} via ${paymentMethodMeta[paymentMethod]?.label ?? paymentMethod.toUpperCase()}`}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Address Book Modal */}
      <AddressBookModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        selectedAddressId={selectedAddress?.id}
        onSelectAddress={(addr) => setSelectedAddress(addr)}
      />
    </>
  );
};
