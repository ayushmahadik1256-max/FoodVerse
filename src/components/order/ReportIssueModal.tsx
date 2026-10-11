import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Order } from '../../types';
import { X, HelpCircle, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

interface ReportIssueModalProps {
  order: Order | null;
  onClose: () => void;
}

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({ order, onClose }) => {
  const { reportOrderIssue } = useAppStore();

  const [issueType, setIssueType] = useState('Missing items from order');
  const [description, setDescription] = useState('');
  const [resolution, setResolution] = useState<{ ticketId: string; compensation: number } | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await reportOrderIssue(order.id, issueType, description);
    if (res.success) {
      setResolution({ ticketId: res.ticketId, compensation: res.compensation });
    }
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
            <span className="text-base text-orange-500">🛎️</span>
            <div>
              <h2 className="text-sm font-black text-stone-900 dark:text-stone-100">
                Help with Order #{order.orderNumber}
              </h2>
              <p className="text-[10px] text-stone-400">Instant Automated Resolution Center</p>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            aria-label="Close help dialog"
            className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center text-stone-500 transition-colors cursor-pointer pointer-events-auto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {resolution ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center text-2xl">
                ✓
              </div>
              <h3 className="text-base font-black text-stone-900 dark:text-stone-100">
                Issue Reported & Resolved
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Ticket <strong>#{resolution.ticketId}</strong> has been logged with {order.restaurantName}.
              </p>
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-amber-600 dark:text-amber-400">
                  <Sparkles className="w-4 h-4" />
                  <span>Instant Goodwill Credit Granted!</span>
                </div>
                <div className="text-[11px] font-medium">
                  We have credited <strong>+{resolution.compensation} FoodVerse Points (₹{resolution.compensation} off)</strong> to your wallet to make this right immediately!
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md transition-colors mt-2"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider mb-1.5">
                  What went wrong?
                </label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-900 dark:text-stone-100"
                >
                  <option value="Missing items from order">Missing items from order</option>
                  <option value="Wrong food item delivered">Wrong food item delivered</option>
                  <option value="Spilled or damaged packaging">Spilled or damaged packaging</option>
                  <option value="Food quality or taste issue">Food quality or taste issue</option>
                  <option value="Delivery partner delayed excessively">Delivery partner delayed excessively</option>
                  <option value="Other concern">Other concern</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider mb-1.5">
                  Describe what happened
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide any details about the discrepancy or condition of the food..."
                  rows={3}
                  required
                  className="w-full p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-800/80 text-[11px] text-stone-500">
                Our automated culinary concierge reviews tickets instantly with automated compensation or re-dispatch.
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold hover:bg-stone-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
