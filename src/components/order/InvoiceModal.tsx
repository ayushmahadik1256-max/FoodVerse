import React, { useEffect } from 'react';
import { Order } from '../../types';
import { X, Printer, Download, CheckCircle2, ShieldCheck } from 'lucide-react';

interface InvoiceModalProps {
  order: Order | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-200 print:p-0 print:bg-white"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:border-none"
      >
        {/* Modal Top Actions */}
        <div className="p-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50/60 dark:bg-stone-900/60 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-base">📄</span>
            <h2 className="text-xs font-black uppercase tracking-wider text-stone-800 dark:text-stone-200">
              Tax Invoice #{order.orderNumber}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              aria-label="Close invoice"
              className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center text-stone-500 transition-colors cursor-pointer pointer-events-auto"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div id="printable-invoice" className="p-6 sm:p-8 overflow-y-auto space-y-6 text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-900 print:text-black print:bg-white flex-1">
          {/* Company & Restaurant Header */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🍔</span>
                <span className="text-xl font-black tracking-tight">FoodVerse</span>
              </div>
              <p className="text-[11px] text-stone-400 mt-1">FoodVerse Technologies Pvt. Ltd.</p>
              <p className="text-[11px] text-stone-400">GSTIN: 29AABCU9603R1ZM</p>
              <p className="text-[11px] text-stone-400">FSSAI Lic: 11223344000192</p>
            </div>

            <div className="text-right">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-wider">
                {order.paymentStatus === 'paid' ? 'PAID & SETTLED' : 'CASH ON DELIVERY'}
              </span>
              <h3 className="text-sm font-black mt-2">Invoice: {order.orderNumber}</h3>
              <p className="text-[11px] text-stone-400">
                Date: {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
              <p className="text-[11px] text-stone-400">
                Payment: {order.paymentMethod.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Restaurant & Customer Details */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-700/80">
              <h4 className="text-[10px] font-black uppercase text-stone-400 mb-1">
                Dispatched From:
              </h4>
              <p className="font-bold text-stone-900 dark:text-stone-100">{order.restaurantName}</p>
              <p className="text-[11px] text-stone-500 mt-0.5">FSSAI Certified Commercial Kitchen</p>
              <p className="text-[11px] text-stone-400 mt-0.5">Bengaluru Urban, KA</p>
            </div>

            <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-700/80">
              <h4 className="text-[10px] font-black uppercase text-stone-400 mb-1">
                Billed To (Customer):
              </h4>
              <p className="font-bold text-stone-900 dark:text-stone-100">{order.customerName}</p>
              <p className="text-[11px] text-stone-500 mt-0.5">{order.deliveryAddress.street}</p>
              <p className="text-[11px] text-stone-400 mt-0.5">
                {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.zip}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-stone-400 mb-2">
              Itemized Summary
            </h4>
            <div className="border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 dark:bg-stone-800/80 border-b border-stone-200 dark:border-stone-800 text-[10px] uppercase font-bold text-stone-400">
                  <tr>
                    <th className="py-2.5 px-3">Item & Customization</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Rate</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/40">
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-stone-900 dark:text-stone-100">{item.name}</div>
                        {item.customization && (
                          <div className="text-[10px] text-stone-400">
                            {item.customization.variant && `${item.customization.variant.name} • `}
                            {item.customization.spiceLevel && `Spice: ${item.customization.spiceLevel} • `}
                            {item.customization.addOns.map((a) => a.name).join(', ')}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-right">₹{item.price}</td>
                      <td className="py-2.5 px-3 text-right font-bold">₹{item.price * item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/80 space-y-1.5 text-xs">
            <div className="flex justify-between text-stone-600 dark:text-stone-400">
              <span>Items Total:</span>
              <span className="font-bold">₹{order.subtotal}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                <span>Coupon Discount ({order.couponCode || 'PROMO'}):</span>
                <span>-₹{order.discountAmount}</span>
              </div>
            )}
            {order.loyaltyDiscount && order.loyaltyDiscount > 0 ? (
              <div className="flex justify-between text-amber-600 dark:text-amber-400 font-bold">
                <span>Loyalty Points Redeemed ({order.loyaltyPointsRedeemed} pts):</span>
                <span>-₹{order.loyaltyDiscount}</span>
              </div>
            ) : null}
            <div className="flex justify-between text-stone-600 dark:text-stone-400">
              <span>Delivery Fee:</span>
              <span>{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</span>
            </div>
            <div className="flex justify-between text-stone-600 dark:text-stone-400">
              <span>Packaging Charges:</span>
              <span>₹{order.packagingFee ?? 20}</span>
            </div>
            <div className="flex justify-between text-stone-600 dark:text-stone-400">
              <span>Platform Service Fee:</span>
              <span>₹{order.platformFee ?? 5}</span>
            </div>
            {order.tipAmount && order.tipAmount > 0 ? (
              <div className="flex justify-between text-stone-600 dark:text-stone-400">
                <span>Rider Tip:</span>
                <span>₹{order.tipAmount}</span>
              </div>
            ) : null}
            <div className="flex justify-between text-stone-600 dark:text-stone-400">
              <span>GST & Taxes (5%):</span>
              <span>₹{order.tax}</span>
            </div>
            <div className="pt-2 border-t border-stone-200 dark:border-stone-700 flex justify-between font-black text-sm text-stone-900 dark:text-stone-100">
              <span>Grand Total:</span>
              <span className="text-base text-orange-600 dark:text-orange-400">₹{order.totalAmount}</span>
            </div>
          </div>

          {/* Delivery partner note & legal */}
          <div className="border-t border-stone-100 dark:border-stone-800 pt-3 text-[10px] text-stone-400 flex items-center justify-between">
            <div>Delivered by: {order.deliveryPartnerName || 'Rohan Verma'} ({order.deliveryPartnerPhone || '+91 98888 11223'})</div>
            <div>Computer generated e-invoice. No signature required.</div>
          </div>
        </div>
      </div>
    </div>
  );
};
