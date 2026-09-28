import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Address } from '../../types';
import { AddressBookModal } from './AddressBookModal';
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
  Plus,
  Coins,
  HeartHandshake,
  QrCode,
  Smartphone,
  RotateCcw,
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
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'upi' | 'card' | 'cod' | 'wallet'>('razorpay');
  const [upiId, setUpiId] = useState('ayush@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [simulateFailure, setSimulateFailure] = useState(false);

  // Processing, Success & Error states
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'checkout' | 'processing' | 'success' | 'failed'>('checkout');
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

  const handlePlaceOrder = async () => {
    // If user is guest, trigger Auth Modal first
    if (currentUser.isGuest) {
      openAuthModal('login', () => {
        // will resume checkout after login
      });
      return;
    }

    if (!selectedAddress) {
      setIsAddressModalOpen(true);
      return;
    }

    setIsProcessing(true);
    setCheckoutStep('processing');

    // Simulate network delay
    setTimeout(async () => {
      if (simulateFailure) {
        setIsProcessing(false);
        setCheckoutStep('failed');
        setErrorMessage('Payment authorization failed: Bank server timed out. Please retry or select Cash on Delivery.');
        return;
      }

      try {
        const fullInstructions = [
          deliveryInstruction,
          customDeliveryNote.trim(),
        ].filter(Boolean).join(' • ');

        const scheduledTime = deliveryType === 'schedule' ? scheduledSlot : undefined;

        const order = await createOrder(selectedAddress, paymentMethod, {
          deliveryInstructions: fullInstructions,
          tipAmount: selectedTip,
          scheduledFor: scheduledTime,
        });

        setIsProcessing(false);
        setLastPlacedOrder(order);
        setCheckoutStep('success');
      } catch (err: any) {
        setIsProcessing(false);
        setCheckoutStep('failed');
        setErrorMessage(err?.message || 'Unexpected payment error occurred');
      }
    }, 1800);
  };

  const handleRetryPayment = () => {
    setSimulateFailure(false);
    setCheckoutStep('checkout');
    setErrorMessage(null);
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
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-900/50">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm">🛵</span>
                <span className="text-[10px] font-black tracking-widest uppercase text-orange-600 dark:text-orange-400">
                  Instant Dispatch Checkout
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-stone-900 dark:text-stone-100 mt-0.5">
                {checkoutStep === 'success' && 'Order Confirmed! 🎉'}
                {checkoutStep === 'failed' && 'Payment Declined'}
                {checkoutStep === 'processing' && 'Securing Your Gourmet Ticket...'}
                {checkoutStep === 'checkout' && 'Finalize Order & Delivery'}
              </h2>
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

          {/* VIEW: PROCESSING */}
          {checkoutStep === 'processing' && (
            <div className="p-12 text-center space-y-4 my-auto">
              <div className="relative w-16 h-16 mx-auto">
                <div className="w-16 h-16 rounded-full border-4 border-orange-500/20 border-t-orange-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-xl">🍕</div>
              </div>
              <h3 className="text-base font-black text-stone-900 dark:text-stone-100">
                Authorizing {paymentMethod.toUpperCase()} Payment
              </h3>
              <p className="text-xs text-stone-400 max-w-sm mx-auto">
                Connecting to 256-bit bank gateway and transmitting your ticket to the kitchen...
              </p>
            </div>
          )}

          {/* VIEW: SUCCESS SCREEN */}
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

              {/* Order quick highlights */}
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

          {/* VIEW: FAILED PAYMENT SCREEN */}
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
                    setCheckoutStep('checkout');
                  }}
                  className="flex-1 py-3 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-bold hover:bg-stone-200 transition-colors"
                >
                  Switch to Cash on Delivery
                </button>
              </div>
            </div>
          )}

          {/* VIEW: MAIN CHECKOUT STEP */}
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

              {/* SECTION 5: PAYMENT METHODS */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-stone-900 dark:text-stone-100 mb-2 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-orange-500" />
                  <span>Payment Gateway</span>
                </h3>
                <div className="space-y-2">
                  {/* Razorpay Test */}
                  <label
                    onClick={() => setPaymentMethod('razorpay')}
                    className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'razorpay'
                        ? 'border-orange-500 bg-orange-50/30 dark:bg-orange-950/20 shadow-sm'
                        : 'border-stone-200 dark:border-stone-800 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-black text-xs">
                        RZP
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                          <span>Razorpay Standard Gateway</span>
                          <span className="px-1.5 py-0.2 rounded-full bg-blue-500/10 text-blue-600 text-[9px] font-black uppercase">
                            Fast & Secure
                          </span>
                        </div>
                        <div className="text-[10px] text-stone-400">Credit / Debit Cards, NetBanking, Wallets</div>
                      </div>
                    </div>
                    <span className="text-xs font-black text-stone-900 dark:text-stone-100">
                      ₹{cartTotals.total}
                    </span>
                  </label>

                  {/* UPI */}
                  <label
                    onClick={() => setPaymentMethod('upi')}
                    className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'upi'
                        ? 'border-orange-500 bg-orange-50/30 dark:bg-orange-950/20 shadow-sm'
                        : 'border-stone-200 dark:border-stone-800 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black text-xs">
                        UPI
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                          Instant UPI (GPay, PhonePe, Paytm)
                        </div>
                        <div className="text-[10px] text-stone-400">Zero surcharge instant auto-transfer</div>
                      </div>
                    </div>
                    <span className="text-xs font-black text-stone-900 dark:text-stone-100">
                      ₹{cartTotals.total}
                    </span>
                  </label>

                  {/* COD */}
                  <label
                    onClick={() => setPaymentMethod('cod')}
                    className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-orange-500 bg-orange-50/30 dark:bg-orange-950/20 shadow-sm'
                        : 'border-stone-200 dark:border-stone-800 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black text-xs">
                        COD
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                          Cash on Delivery
                        </div>
                        <div className="text-[10px] text-stone-400">Pay cash or UPI scan at your door</div>
                      </div>
                    </div>
                    <span className="text-xs font-black text-stone-900 dark:text-stone-100">
                      ₹{cartTotals.total}
                    </span>
                  </label>
                </div>

                {/* Developer / reviewer simulation toggle */}
                <div className="mt-2.5 flex items-center justify-between p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-[11px]">
                  <span className="font-semibold text-stone-600 dark:text-stone-300">
                    🧪 Test Simulation Mode:
                  </span>
                  <label className="flex items-center gap-1.5 cursor-pointer text-stone-700 dark:text-stone-300">
                    <input
                      type="checkbox"
                      checked={simulateFailure}
                      onChange={(e) => setSimulateFailure(e.target.checked)}
                      className="rounded text-rose-500"
                    />
                    <span className={simulateFailure ? 'text-rose-600 font-bold' : ''}>
                      Simulate Payment Failure
                    </span>
                  </label>
                </div>
              </div>

              {/* SECTION 6: BILL BREAKDOWN */}
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

          {/* Sticky Checkout CTA Footer */}
          {checkoutStep === 'checkout' && (
            <div className="p-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/90 flex items-center justify-between gap-3 shrink-0">
              <div>
                <span className="block text-[10px] font-black uppercase text-stone-400">Total Payable</span>
                <span className="text-lg font-black text-stone-900 dark:text-stone-100">
                  ₹{cartTotals.total}
                </span>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="py-3 px-6 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-black text-xs shadow-lg shadow-orange-500/25 flex items-center gap-2 transition-all active:scale-[0.99]"
              >
                <span>
                  {currentUser.isGuest ? 'Sign In & Place Order' : `Pay & Place Order • ₹${cartTotals.total}`}
                </span>
                <ChevronRight className="w-4 h-4" />
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
