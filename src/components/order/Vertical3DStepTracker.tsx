import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../../types';
import {
  CheckCircle2,
  ChefHat,
  Flame,
  Bike,
  PackageCheck,
  Sparkles,
  ArrowRight,
  Clock,
  RotateCcw,
  Check,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface Vertical3DStepTrackerProps {
  currentStatus: OrderStatus;
  order: Order;
  onAdvanceStage?: () => void;
}

interface StepItem {
  status: OrderStatus;
  label: string;
  badge: string;
  headline: string;
  description: string;
  detail: string;
  icon: React.ReactNode;
}

export const Vertical3DStepTracker: React.FC<Vertical3DStepTrackerProps> = ({
  currentStatus,
  order,
  onAdvanceStage,
}) => {
  const [selectedStep, setSelectedStep] = useState<OrderStatus | null>(null);

  const steps: StepItem[] = [
    {
      status: 'placed',
      label: 'Received',
      badge: 'Order Logged',
      headline: 'Order Received & Verified',
      description: 'Order payment confirmed. Sent directly to kitchen prep station.',
      detail: `Order #${order.orderNumber} • Instant Verification`,
      icon: <CheckCircle2 className="w-5 h-5" />,
    },
    {
      status: 'accepted',
      label: 'Accepted',
      badge: 'Kitchen Confirmed',
      headline: 'Head Chef Acknowledged',
      description: 'Kitchen accepted the ticket. Fresh artisan ingredients gathered.',
      detail: `${order.restaurantName} • Station Queued`,
      icon: <ChefHat className="w-5 h-5" />,
    },
    {
      status: 'preparing',
      label: 'Preparing',
      badge: 'Cooking in Progress',
      headline: 'Culinary Crafting & Flame Grilling',
      description: 'Dishes being handcrafted fresh and sealed in insulated tamper-proof boxes.',
      detail: 'Thermal Packaging • Fresh Cook Station',
      icon: <Flame className="w-5 h-5" />,
    },
    {
      status: 'out_for_delivery',
      label: 'On The Way',
      badge: 'Dispatched Fleet',
      headline: 'Courier En Route with Warm Bag',
      description: `Delivery partner ${order.deliveryPartnerName || 'Rohan Verma'} picked up order. Live GPS tracking active.`,
      detail: 'Priority Fleet • Real-time GPS Broadcast',
      icon: <Bike className="w-5 h-5" />,
    },
    {
      status: 'delivered',
      label: 'Delivered',
      badge: 'Completed',
      headline: 'Delivered with Care & Handed Over',
      description: 'Safely delivered to your doorstep. Contactless PIN verified. Bon appétit!',
      detail: 'Enjoy Your Gourmet Meal • Bonus Points Added',
      icon: <PackageCheck className="w-5 h-5" />,
    },
  ];

  const statusOrder: OrderStatus[] = ['placed', 'accepted', 'preparing', 'out_for_delivery', 'delivered'];
  const currentIndex = statusOrder.indexOf(currentStatus);

  // Compute progress line percentage (0% to 100%)
  const progressPercent = currentIndex <= 0 ? 0 : (currentIndex / (statusOrder.length - 1)) * 100;

  // Active step selection defaults to current active step
  const activeStepItem = steps.find((s) => s.status === (selectedStep || currentStatus)) || steps[currentIndex];

  return (
    <div className="relative bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-7 border border-stone-200/80 dark:border-stone-800 shadow-3d-card overflow-hidden">
      {/* 3D Ambient Atmospheric Backing Glow */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-gradient-to-br from-orange-500/15 via-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-gradient-to-tl from-emerald-500/10 via-orange-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header with Title and Live Telemetry Gauge */}
      <div className="relative z-10 flex items-start justify-between gap-4 mb-8 pb-5 border-b border-stone-100 dark:border-stone-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500" />
            </span>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-orange-500 dark:text-orange-400">
              Live Order Pipeline
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 mt-1">
            {currentStatus === 'delivered' ? 'Delivery Complete 🎉' : 'Step-by-Step Progress'}
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Stage {currentIndex + 1} of {statusOrder.length} • {activeStepItem.label}
          </p>
        </div>

        {/* 3D Circular Progress Dial */}
        <div className="relative flex items-center justify-center shrink-0">
          <div className="w-16 h-16 rounded-2xl bg-stone-50 dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700/80 shadow-md flex flex-col items-center justify-center p-1 text-center group hover:scale-105 transition-transform">
            <span className="text-xs font-black text-orange-500 dark:text-orange-400 leading-tight">
              {Math.round(((currentIndex + 1) / statusOrder.length) * 100)}%
            </span>
            <span className="text-[9px] uppercase font-bold text-stone-400 tracking-wider">
              Done
            </span>
          </div>
        </div>
      </div>

      {/* Vertical 3D Depth Step-Line Container */}
      <div className="relative z-10 pl-2 sm:pl-3">
        {/* ==============================================================
            Continuous Vertical Track & 3D Illuminated Progress Fill Beam
            ============================================================== */}
        <div className="absolute left-[29px] sm:left-[33px] top-6 bottom-8 w-2 sm:w-2.5 -translate-x-1/2">
          {/* Recessed 3D Track Channel with Inner Depth Shadow */}
          <div className="w-full h-full rounded-full bg-stone-100 dark:bg-stone-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3),inset_0_-1px_2px_rgba(255,255,255,0.08)] border border-stone-200/60 dark:border-stone-700/50" />

          {/* Illuminated Active Progress Fill Beam */}
          <div
            className="absolute top-0 left-0 w-full rounded-full bg-gradient-to-b from-amber-400 via-orange-500 to-emerald-500 transition-all duration-1000 ease-out shadow-[0_0_14px_rgba(249,115,22,0.7),0_0_24px_rgba(249,115,22,0.35)]"
            style={{ height: `${progressPercent}%` }}
          >
            {/* Travelling 3D Photon Bead at Tip of Progress */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-orange-500 shadow-[0_0_12px_#f97316] animate-pulse">
              <span className="absolute inset-0 rounded-full bg-orange-400 animate-ping opacity-75" />
            </div>
          </div>
        </div>

        {/* ==============================================================
            List of 5 Step Nodes and 3D Perspective Cards
            ============================================================== */}
        <div className="space-y-6 sm:space-y-7 relative">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            const isPending = idx > currentIndex;

            return (
              <div
                key={step.status}
                onClick={() => setSelectedStep(step.status)}
                className={`group flex items-start gap-4 sm:gap-5 cursor-pointer select-none transition-all duration-300 ${
                  isCurrent ? 'scale-[1.01]' : 'hover:translate-x-1'
                }`}
              >
                {/* 3D Elevated Node Orb */}
                <div className="relative z-20 shrink-0">
                  {/* Concentric Ripple Wave for Currently Active Step */}
                  {isCurrent && (
                    <>
                      <span className="absolute -inset-2.5 rounded-full bg-orange-500/20 animate-ping opacity-75 pointer-events-none" />
                      <span className="absolute -inset-1 rounded-full bg-orange-500/30 ring-2 ring-orange-500/40 pointer-events-none animate-pulse" />
                    </>
                  )}

                  <div
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl sm:rounded-[18px] flex items-center justify-center transition-all duration-500 relative ${
                      isCompleted
                        ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-[0_8px_18px_-4px_rgba(16,185,129,0.5),inset_0_2px_3px_rgba(255,255,255,0.6),inset_0_-2px_4px_rgba(0,0,0,0.3)] ring-2 ring-emerald-500/20'
                        : isCurrent
                        ? 'bg-gradient-to-br from-amber-400 via-orange-500 to-orange-600 text-white shadow-[0_10px_25px_-3px_rgba(249,115,22,0.6),inset_0_2px_3px_rgba(255,255,255,0.7),inset_0_-2px_4px_rgba(0,0,0,0.3)] scale-110 ring-4 ring-orange-500/25'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 shadow-[inset_0_2px_3px_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.05)] border border-stone-200 dark:border-stone-700/60'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3] drop-shadow-sm" />
                    ) : (
                      <div className="transition-transform group-hover:scale-110 duration-300">
                        {step.icon}
                      </div>
                    )}
                  </div>
                </div>

                {/* 3D Depth Card for Step Information */}
                <div
                  className={`flex-1 rounded-2xl p-3.5 sm:p-4 border transition-all duration-300 ${
                    isCurrent
                      ? 'bg-gradient-to-br from-orange-500/[0.07] via-amber-500/[0.04] to-transparent dark:from-orange-500/15 dark:to-stone-900 border-orange-500/40 shadow-lg shadow-orange-500/5 ring-1 ring-orange-500/20'
                      : isCompleted
                      ? 'bg-stone-50/70 dark:bg-stone-800/40 border-stone-200/80 dark:border-stone-800 shadow-sm hover:shadow-md'
                      : 'bg-stone-50/30 dark:bg-stone-800/20 border-stone-200/50 dark:border-stone-800/50 opacity-60 hover:opacity-85'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        isCurrent
                          ? 'bg-orange-500 text-white shadow-sm'
                          : isCompleted
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-stone-200 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
                      }`}
                    >
                      {isCurrent ? 'Active Now' : isCompleted ? 'Completed' : 'Upcoming'}
                    </span>

                    <span className="text-[11px] font-bold text-stone-400 dark:text-stone-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{step.label}</span>
                    </span>
                  </div>

                  <h4
                    className={`text-sm sm:text-base font-bold transition-colors ${
                      isCurrent
                        ? 'text-orange-600 dark:text-orange-400 font-extrabold'
                        : isCompleted
                        ? 'text-stone-900 dark:text-stone-100'
                        : 'text-stone-500 dark:text-stone-400'
                    }`}
                  >
                    {step.headline}
                  </h4>

                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                    {step.description}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-stone-200/60 dark:border-stone-700/50 flex items-center justify-between text-[11px] font-medium text-stone-400 dark:text-stone-500">
                    <span className="truncate">{step.detail}</span>
                    {isCurrent && (
                      <span className="flex items-center gap-1 text-orange-500 font-bold shrink-0">
                        <Zap className="w-3 h-3" />
                        <span>Live</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Simulator / Advance Step Interactive Footer */}
      {onAdvanceStage && currentStatus !== 'delivered' && (
        <div className="mt-8 pt-5 border-t border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-stone-50/80 dark:bg-stone-800/40 -mx-6 -mb-6 p-4 sm:px-6">
          <div className="text-xs text-stone-500 dark:text-stone-400">
            Simulate tracking movement:
          </div>
          <button
            onClick={onAdvanceStage}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/25 hover:shadow-lg hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Advance to Next Stage ➔</span>
          </button>
        </div>
      )}

      {currentStatus === 'delivered' && (
        <div className="mt-8 pt-5 border-t border-stone-100 dark:border-stone-800 flex items-center justify-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 -mx-6 -mb-6 p-4">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <span>All stages completed. Order safely delivered to your doorstep!</span>
        </div>
      )}
    </div>
  );
};
