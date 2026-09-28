import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { CreditCard, Smartphone, Banknote, ShieldCheck, X, CheckCircle2, Lock, Coins, Sparkles } from 'lucide-react';
import { Address } from '../../types';
import { useAppStore } from '../../store/useAppStore';

interface PaymentModalProps {
  amount: number;
  selectedAddress: Address;
  onSuccess: (method: 'razorpay' | 'cod') => void;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  amount,
  selectedAddress,
  onSuccess,
  onClose,
}) => {
  const { cartTotals } = useAppStore();
  const [method, setMethod] = useState<'card' | 'upi' | 'cod'>('card');
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');
  const [upiId, setUpiId] = useState('customer@okhdfcbank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f97316', '#e11d48', '#10b981', '#fbbf24'],
      });

      setTimeout(() => {
        onSuccess(method === 'cod' ? 'cod' : 'razorpay');
      }, 1400);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-800">
        {/* Header with Razorpay Test Mode Banner */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-black text-sm">
              ₹
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">Razorpay Test Checkout</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                  Sandbox Active
                </span>
              </div>
              <p className="text-xs text-blue-100">Merchant: FoodVerse Technologies Pvt Ltd</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-bold text-stone-900 dark:text-stone-100">Payment Verified!</h4>
            <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">
              ₹{amount.toFixed(2)} authorized successfully. Dispatching ticket to restaurant.
            </p>
            {cartTotals.pointsToEarn > 0 && (
              <div className="mt-3 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>+{cartTotals.pointsToEarn} FoodVerse Points Earned!</span>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6">
            {/* Amount & Destination Banner */}
            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800 mb-5 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-stone-400">Total Payable</span>
                  <div className="text-2xl font-black text-stone-900 dark:text-stone-100">₹{amount.toFixed(2)}</div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-stone-400">Delivering To</span>
                  <div className="text-xs font-semibold text-stone-700 dark:text-stone-300 max-w-[160px] truncate">
                    {selectedAddress.street}, {selectedAddress.city}
                  </div>
                </div>
              </div>

              {/* Loyalty summary badges */}
              {(cartTotals.loyaltyDiscount > 0 || cartTotals.pointsToEarn > 0) && (
                <div className="pt-2 border-t border-stone-200/60 dark:border-stone-700/60 flex items-center justify-between text-[11px]">
                  {cartTotals.loyaltyDiscount > 0 ? (
                    <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                      <Coins className="w-3 h-3" />
                      ₹{cartTotals.loyaltyDiscount} Loyalty Discount Applied
                    </span>
                  ) : <span />}
                  {cartTotals.pointsToEarn > 0 && (
                    <span className="text-stone-500 dark:text-stone-400 font-medium">
                      Earning: <strong className="text-amber-600 dark:text-amber-400 font-bold">+{cartTotals.pointsToEarn} pts</strong>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              <button
                type="button"
                onClick={() => setMethod('card')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  method === 'card'
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 font-semibold'
                    : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span className="text-xs">Cards</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('upi')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  method === 'upi'
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 font-semibold'
                    : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                }`}
              >
                <Smartphone className="w-5 h-5" />
                <span className="text-xs">UPI / GPay</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('cod')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  method === 'cod'
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 font-semibold'
                    : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                }`}
              >
                <Banknote className="w-5 h-5" />
                <span className="text-xs">Cash on Delivery</span>
              </button>
            </div>

            {/* Method Details Form */}
            {method === 'card' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-stone-600 dark:text-stone-400 block mb-1">
                    Card Number (Demo Test Card)
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-stone-600 dark:text-stone-400 block mb-1">Expiry</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-stone-600 dark:text-stone-400 block mb-1">CVV</label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {method === 'upi' && (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-stone-600 dark:text-stone-400 block mb-1">
                  Virtual Payment Address (VPA) / UPI ID
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="username@okhdfcbank"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2">
                  {['@okaxis', '@okhdfcbank', '@paytm'].map((suf) => (
                    <button
                      key={suf}
                      type="button"
                      onClick={() => setUpiId(`customer${suf}`)}
                      className="text-xs px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200"
                    >
                      {suf}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {method === 'cod' && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-stone-700 dark:text-stone-300 text-xs leading-relaxed">
                Pay in cash or with UPI QR scan directly to courier Rohan upon doorstep handover.
              </div>
            )}

            {/* Pay Button */}
            <button
              onClick={handlePay}
              disabled={isProcessing}
              className="w-full mt-6 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all"
            >
              {isProcessing ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Securing Payment Authorization...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>
                    {method === 'cod' ? 'Confirm Cash On Delivery Order' : `Pay ₹${amount.toFixed(2)} Securely`}
                  </span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400 mt-4">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>PCI-DSS Level 1 Encrypted Sandbox • 256-bit SSL</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
