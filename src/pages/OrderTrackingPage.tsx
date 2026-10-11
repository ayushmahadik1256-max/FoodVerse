import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { LeafletMap } from '../components/common/LeafletMap';
import { Vertical3DStepTracker } from '../components/order/Vertical3DStepTracker';
import { InvoiceModal } from '../components/order/InvoiceModal';
import { CancelOrderModal } from '../components/order/CancelOrderModal';
import { ReportIssueModal } from '../components/order/ReportIssueModal';
import { WriteReviewModal } from '../components/reviews/WriteReviewModal';
import { OrderStatus } from '../types';
import {
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Bike,
  FileText,
  XCircle,
  HelpCircle,
  Star,
  Navigation,
  PackageCheck,
  Gift,
} from 'lucide-react';

import { fetchOrderById } from '../services/accountApi';

interface OrderTrackingPageProps {
  onBackToHome: () => void;
}

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({ onBackToHome }) => {
  const { currentUser, activeTrackingOrder, updateOrderStatus, orders, setActiveTrackingOrder, restaurants, addNotification, earnLoyaltyPoints } = useAppStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pointsClaimed, setPointsClaimed] = useState(false);

  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const order = activeTrackingOrder || orders[0];

  if (!order) {
    return (
      <div className="text-center py-24 space-y-4">
        <div className="w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto text-2xl">
          📦
        </div>
        <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">No Active Order</h3>
        <p className="text-xs text-stone-400">Place an order from any gourmet restaurant to start tracking.</p>
        <button
          onClick={onBackToHome}
          className="px-5 py-2.5 rounded-2xl bg-orange-500 text-white text-xs font-bold shadow-md hover:bg-orange-600"
        >
          Browse Restaurants
        </button>
      </div>
    );
  }

  const restaurant = restaurants.find((r) => r.id === order.restaurantId) || null;

  // Calculate progress percentage
  const stages: OrderStatus[] = ['placed', 'accepted', 'preparing', 'out_for_delivery', 'delivered'];
  const currentIndex = stages.indexOf(order.status);
  const progressPercent = Math.round(((currentIndex + 1) / stages.length) * 100);

  const canAdvanceStage = currentUser.role === 'admin' || currentUser.role === 'restaurant_owner' || currentUser.role === 'delivery_partner';

  const handleManualRefresh = async () => {
    try {
      setIsRefreshing(true);
      const latest = await fetchOrderById(order.id);
      if (latest) {
        setActiveTrackingOrder(latest);
        addNotification('Telemetry Refreshed', `Status verified: ${latest.status.replace(/_/g, ' ')}`, 'info');
      }
    } catch {
      addNotification('Refresh Note', 'Order telemetry is up to date.', 'info');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Customer-facing: mark as delivered & claim +13 loyalty points
  const handleCustomerDeliveryConfirm = async () => {
    if (pointsClaimed) return;
    await updateOrderStatus(order.id, 'delivered');
    earnLoyaltyPoints(13, 'delivery confirmation bonus');
    setPointsClaimed(true);
    addNotification('🎉 Delivered & +13 Pts Claimed!', 'Order marked as delivered. 13 bonus FoodVerse Points added to your wallet!', 'success');
  };

  // Advance stage helper for authorized operations
  const handleAdvanceStage = () => {
    const nextIdx = Math.min(stages.length - 1, currentIndex + 1);
    const nextStatus = stages[nextIdx];
    const offset = (nextIdx / stages.length) * 0.005;
    const newLoc: [number, number] = [
      order.restaurantLocation[0] - offset,
      order.restaurantLocation[1] + offset,
    ];
    updateOrderStatus(order.id, nextStatus, newLoc);
  };

  const isEligibleForCancel = order.status === 'placed' || order.status === 'accepted';

  return (
    <div className="space-y-8 pb-16">
      {/* Header & Order Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 font-black text-[10px] tracking-wider uppercase">
              Live Courier Tracking
            </span>
            <span className="text-xs text-stone-400 font-mono">#{order.orderNumber}</span>
            {order.scheduledFor && (
              <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 text-[10px] font-bold">
                ⏰ Scheduled: {order.scheduledFor}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-100 mt-1">
            {order.status === 'delivered' ? 'Delivered with Care! 🎉' : `Arriving in ${order.estimatedDeliveryTime}`}
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Dispatched from <strong className="text-stone-800 dark:text-stone-200">{order.restaurantName}</strong>
          </p>
        </div>

        {/* Multi-Order Switcher if multiple orders */}
        {orders.length > 1 && (
          <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800/80 p-1.5 rounded-2xl">
            <span className="text-[11px] font-bold text-stone-500 px-2">Recent Orders:</span>
            {orders.slice(0, 3).map((o) => (
              <button
                key={o.id}
                onClick={() => setActiveTrackingOrder(o)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  o.id === order.id
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                }`}
              >
                #{o.orderNumber.slice(-4)}
              </button>
            ))}
          </div>
        )}

        {/* ── CUSTOMER: Delivery Arrived Banner + Claim Button ── */}
        {currentUser.role === 'customer' && order.status !== 'delivered' && (
          <div className="w-full mt-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-400 dark:border-amber-600 flex flex-col sm:flex-row items-center justify-between gap-3 animate-pulse">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🛵</span>
              <div>
                <p className="text-sm font-black text-amber-800 dark:text-amber-200">
                  {order.status === 'out_for_delivery' ? 'Your courier is en route!' : 'Order Dispatched & Tracking Active'}
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  When delivery reaches your doorstep, tap to confirm &amp; instantly claim +13 reward points.
                </p>
              </div>
            </div>
            <button
              onClick={handleCustomerDeliveryConfirm}
              disabled={pointsClaimed}
              className={`shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm shadow-lg transition-all active:scale-95 ${
                pointsClaimed
                  ? 'bg-emerald-500 text-white cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/30 hover:-translate-y-0.5 cursor-pointer'
              }`}
            >
              {pointsClaimed ? (
                <><CheckCircle2 className="w-4 h-4" /><span>Claimed ✓</span></>
              ) : (
                <><PackageCheck className="w-4 h-4" /><span>Delivered &amp; Claim +13 Pts</span></>
              )}
            </button>
          </div>
        )}

        {/* ── CUSTOMER: Already delivered — show claim button if not yet claimed ── */}
        {currentUser.role === 'customer' && order.status === 'delivered' && !pointsClaimed && (
          <div className="w-full mt-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎉</span>
              <div>
                <p className="text-sm font-black text-emerald-800 dark:text-emerald-200">Order Delivered!</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">Claim your +13 loyalty bonus points for this delivery.</p>
              </div>
            </div>
            <button
              onClick={() => { earnLoyaltyPoints(13, 'delivery confirmation bonus'); setPointsClaimed(true); addNotification('🎉 +13 Pts Claimed!', '13 FoodVerse Points added to your wallet!', 'success'); }}
              className="shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 transition-all active:scale-95"
            >
              <Gift className="w-4 h-4" />
              <span>Claim +13 Pts</span>
            </button>
          </div>
        )}

        {/* Action Buttons Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 text-xs font-bold transition-all cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Checking...' : 'Live Telemetry Sync'}</span>
          </button>

          {canAdvanceStage && order.status !== 'delivered' && (
            <button
              onClick={handleAdvanceStage}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all active:scale-95 cursor-pointer"
            >
              <span>Operator: Advance to {stages[currentIndex + 1]?.replace(/_/g, ' ') || 'complete'}</span>
            </button>
          )}

          <button
            onClick={() => setIsInvoiceOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold hover:bg-stone-50 transition-colors shadow-sm"
          >
            <FileText className="w-3.5 h-3.5 text-stone-500" />
            <span>Tax Invoice</span>
          </button>

          {isEligibleForCancel && (
            <button
              onClick={() => setIsCancelModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-100 transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Cancel Order</span>
            </button>
          )}

          <button
            onClick={() => setIsIssueModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold hover:bg-stone-200 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-stone-500" />
            <span>Need Help?</span>
          </button>
        </div>
      </div>

      {/* Cancellation or Issue Notice if applicable */}
      {order.cancellationReason && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
          <strong>Cancelled:</strong> {order.cancellationReason}
        </div>
      )}

      {/* MAIN TRACKING DASHBOARD: VERTICAL 3D-DEPTH STEP-LINE + LIVE ROUTE TELEMETRY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* LEFT COLUMN: Highly Stylized Vertical '3D-depth' Step-Line Component */}
        <div className="lg:col-span-5">
          <Vertical3DStepTracker
            currentStatus={order.status}
            order={order}
            onAdvanceStage={handleAdvanceStage}
          />
        </div>

        {/* RIGHT COLUMN: Live Route Map Telemetry, Courier Partner, & Order Snapshot */}
        <div className="lg:col-span-7 space-y-6">
          {/* OpenStreetMap Component */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bike className="w-5 h-5 text-orange-500" />
                <div>
                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <span>Route Telemetry</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                      {order.currentLocation ? 'Live Courier GPS' : 'Estimated Baseline'}
                    </span>
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Kitchen ➔ Courier Partner ➔ {order.deliveryAddress.street}
                  </p>
                </div>
              </div>
            </div>

            <LeafletMap
              center={order.currentLocation || order.restaurantLocation}
              restaurantLocation={order.restaurantLocation}
              restaurantName={order.restaurantName}
              deliveryLocation={[order.deliveryAddress.lat, order.deliveryAddress.lng]}
              deliveryAddress={order.deliveryAddress.street}
              courierLocation={order.currentLocation}
              courierName={order.deliveryPartnerName}
              className="h-80 w-full rounded-2xl"
            />
          </div>

          {/* Courier Partner & Delivery Address Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Courier Card */}
            <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-3.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Delivery Partner
              </h4>

              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80"
                    alt="Courier Rohan"
                    className="w-12 h-12 rounded-2xl object-cover"
                  />
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-stone-900" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                    {order.deliveryPartnerName || 'Rohan Verma'}
                  </div>
                  <div className="text-[11px] text-stone-400 truncate">Fleet Partner • 4.9★</div>
                  <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                    PIN: 4892
                  </div>
                </div>

                <a
                  href={`tel:${order.deliveryPartnerPhone || '9888811223'}`}
                  className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500 hover:text-white flex items-center justify-center transition-all shadow-sm shrink-0"
                  aria-label="Call Courier"
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>

              {order.deliveryInstructions && (
                <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-[11px]">
                  <span className="font-bold text-stone-700 dark:text-stone-300 block">
                    Instructions:
                  </span>
                  <span className="text-stone-500">{order.deliveryInstructions}</span>
                </div>
              )}

              <div className="pt-2 border-t border-stone-100 dark:border-stone-800/80 text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Thermal tamper-proof seal</span>
              </div>
            </div>

            {/* Delivery Address Box */}
            <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-2 text-xs flex flex-col justify-between">
              <div>
                <h4 className="font-bold uppercase tracking-wider text-stone-400">Delivering To</h4>
                <div className="flex items-start gap-2 pt-2">
                  <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-stone-900 dark:text-stone-100">
                      {order.deliveryAddress.label} Address
                    </strong>
                    <p className="text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                      {order.deliveryAddress.street}, {order.deliveryAddress.city} {order.deliveryAddress.zip}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-100 dark:border-stone-800/80 text-[11px] text-stone-400">
                Estimated Delivery: <strong className="text-stone-700 dark:text-stone-200">{order.estimatedDeliveryTime}</strong>
              </div>
            </div>
          </div>

          {/* Order Items Snapshot */}
          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-3 text-xs">
            <div className="flex justify-between items-center font-bold text-stone-900 dark:text-stone-100 border-b border-stone-100 dark:border-stone-800 pb-2">
              <span>Items ({order.items.length})</span>
              <span>Paid ₹{order.totalAmount.toFixed(2)}</span>
            </div>

            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-stone-600 dark:text-stone-400">
                  <div>
                    <span className="font-medium text-stone-800 dark:text-stone-200">
                      {item.quantity}x {item.name}
                    </span>
                    {item.customization && (
                      <div className="text-[10px] text-stone-400">
                        {item.customization.variant && `${item.customization.variant.name} • `}
                        {item.customization.spiceLevel && `${item.customization.spiceLevel}`}
                      </div>
                    )}
                  </div>
                  <span className="font-semibold text-stone-800 dark:text-stone-200">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Post-delivery Review CTA if delivered */}
            {order.status === 'delivered' && restaurant && (
              <div className="pt-3 border-t border-stone-100 dark:border-stone-800">
                <button
                  onClick={() => setIsReviewModalOpen(true)}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>Rate Dishes & Food Delivery</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Modal */}
      {isInvoiceOpen && (
        <InvoiceModal
          order={order}
          onClose={() => setIsInvoiceOpen(false)}
        />
      )}

      {/* Cancel Order Modal */}
      {isCancelModalOpen && (
        <CancelOrderModal
          order={order}
          onClose={() => setIsCancelModalOpen(false)}
        />
      )}

      {/* Report Issue Modal */}
      {isIssueModalOpen && (
        <ReportIssueModal
          order={order}
          onClose={() => setIsIssueModalOpen(false)}
        />
      )}

      {/* Post-delivery Write Review Modal */}
      {isReviewModalOpen && restaurant && (
        <WriteReviewModal
          restaurant={restaurant}
          onClose={() => setIsReviewModalOpen(false)}
        />
      )}
    </div>
  );
};
