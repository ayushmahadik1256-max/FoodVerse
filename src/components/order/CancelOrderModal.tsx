import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Order } from '../../types';
import { X, AlertTriangle, CheckCircle2, RotateCcw } from 'lucide-react';

interface CancelOrderModalProps {
  order: Order | null;
  onClose: () => void;
}

export const CancelOrderModal: React.FC<CancelOrderModalProps> = ({ order, onClose }) => {
  const { cancelOrder } = useAppStore();

  const [reason, setReason] = useState('Placed order by mistake');
  const [customReason, setCustomReason] = useState('');
  const [result, setResult] = useState<{ success: boolean; message: string; refundAmount: number } | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!order) return null;

  const isEligible = order.status === 'placed' || order.status === 'accepted';

  const handleConfirmCancel = async () => {
    const finalReason = customReason.trim() || reason;
    const res = await cancelOrder(order.id, finalReason);
    setResult(res);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-900/50">
          <div className="flex items-center gap-2">
            <span className="text-base text-rose-500">⚠️</span>
            <div>
              <h2 className="text-sm font-black text-stone-900 dark:text-stone-100">
                Cancel Order #{order.orderNumber}
              </h2>
              <p className="text-[10px] text-stone-400">Order Cancellation & Refund Engine</p>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            aria-label="Close cancel dialog"
            className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center text-stone-500 transition-colors cursor-pointer pointer-events-auto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {result ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center text-2xl">
                ✓
              </div>
              <h3 className="text-base font-black text-stone-900 dark:text-stone-100">
                Order Cancelled Successfully
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {result.message}
              </p>
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                100% Refund of ₹{result.refundAmount} credited to your original payment method.
              </div>
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-bold hover:bg-stone-200 transition-colors mt-2"
              >
                Close
              </button>
            </div>
          ) : !isEligible ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 mx-auto flex items-center justify-center text-xl">
                ⚠️
              </div>
              <h3 className="text-base font-black text-stone-900 dark:text-stone-100">
                Order Cannot Be Cancelled
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Kitchen preparation is already underway or the courier is en route with your fresh food. Orders can only be cancelled while in the <strong>Placed</strong> or <strong>Accepted</strong> stages.
              </p>
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition-colors mt-2"
              >
                Keep Order Active
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 space-y-1">
                <div className="font-bold">Full 100% Refund Guarantee</div>
                <div className="text-[11px] text-rose-600 dark:text-rose-400">
                  Because the kitchen has not started cooking your order yet, you are eligible for an immediate full refund of <strong>₹{order.totalAmount}</strong>.
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider mb-1.5">
                  Select Reason for Cancellation
                </label>
                <div className="space-y-1.5">
                  {[
                    'Placed order by mistake',
                    'Changed my mind / Need to order elsewhere',
                    'Incorrect delivery address selected',
                    'Wait time is longer than anticipated',
                    'Other reason',
                  ].map((r) => (
                    <label
                      key={r}
                      onClick={() => setReason(r)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        reason === r
                          ? 'border-orange-500 bg-orange-50/30 dark:bg-orange-950/20 font-bold text-stone-900 dark:text-stone-100'
                          : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="cancel_reason"
                        checked={reason === r}
                        onChange={() => setReason(r)}
                        className="text-orange-500"
                      />
                      <span>{r}</span>
                    </label>
                  ))}
                </div>
              </div>

              {reason === 'Other reason' && (
                <div>
                  <textarea
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Please specify why you are cancelling..."
                    rows={2}
                    className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold hover:bg-stone-200 transition-colors"
                >
                  Keep Order
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/25 transition-all"
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
