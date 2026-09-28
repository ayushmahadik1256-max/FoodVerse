import React from 'react';
import { OrderStatus } from '../types';
import { Bike, Navigation, Clock, ShieldCheck, CheckCircle2, Zap } from 'lucide-react';

interface Scooter3DTrackingProps {
  status: OrderStatus;
  progressPercent: number; // 0 to 100
}

// 2D Live Telemetry & Courier Card (replaces 3D view with actual courier photography & live telemetry)
export const Scooter3DTracking: React.FC<Scooter3DTrackingProps> = ({ status, progressPercent }) => {
  const getSpeed = () => {
    if (status === 'out_for_delivery') return '32 km/h';
    if (status === 'preparing') return 'Stationary (Kitchen)';
    if (status === 'delivered') return '0 km/h (Delivered)';
    return '18 km/h';
  };

  const getDistanceRemaining = () => {
    if (status === 'delivered') return '0.0 km';
    const remaining = Math.max(0.2, ((100 - progressPercent) / 100) * 4.2).toFixed(1);
    return `${remaining} km`;
  };

  return (
    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-stone-900 via-stone-850 to-stone-950 text-white p-6 border border-stone-800 shadow-xl">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Courier Photo & Live Status */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative shrink-0">
            <img
              src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80"
              alt="Delivery Partner"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-orange-500 shadow-md"
            />
            <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-emerald-500 text-stone-950 font-black text-[10px] uppercase shadow">
              Live
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-400 font-bold text-[10px] uppercase tracking-wider">
                Fleet Hero
              </span>
              <span className="text-xs text-stone-400 font-semibold">Electric EV • 4.9★</span>
            </div>
            <h3 className="text-lg font-black mt-0.5">Rohan Verma</h3>
            <p className="text-xs text-stone-300">
              {status === 'out_for_delivery'
                ? 'Navigating optimal route to your doorstep'
                : status === 'preparing'
                ? 'Waiting at kitchen counter for thermal packaging'
                : status === 'delivered'
                ? 'Order safely handed over'
                : 'Order confirmed and partner assigned'}
            </p>
          </div>
        </div>

        {/* Telemetry Numbers */}
        <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
          <div className="bg-stone-800/80 rounded-2xl p-3 border border-stone-700/60 text-center min-w-[90px]">
            <div className="text-[10px] uppercase font-bold text-stone-400 flex items-center justify-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Speed</span>
            </div>
            <div className="text-sm font-black text-white mt-1">{getSpeed()}</div>
          </div>

          <div className="bg-stone-800/80 rounded-2xl p-3 border border-stone-700/60 text-center min-w-[90px]">
            <div className="text-[10px] uppercase font-bold text-stone-400 flex items-center justify-center gap-1">
              <Navigation className="w-3 h-3 text-orange-400" />
              <span>Distance</span>
            </div>
            <div className="text-sm font-black text-white mt-1">{getDistanceRemaining()}</div>
          </div>

          <div className="bg-stone-800/80 rounded-2xl p-3 border border-stone-700/60 text-center min-w-[90px]">
            <div className="text-[10px] uppercase font-bold text-stone-400 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Bag Temp</span>
            </div>
            <div className="text-sm font-black text-emerald-400 mt-1">68°C Hot</div>
          </div>
        </div>
      </div>

      {/* Progress Line */}
      <div className="mt-5 pt-4 border-t border-stone-800">
        <div className="flex items-center justify-between text-xs font-semibold text-stone-400 mb-1.5">
          <span>Kitchen Picked</span>
          <span className="text-orange-400 font-bold">{progressPercent}% Dispatched</span>
          <span>Customer Dropoff</span>
        </div>
        <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 rounded-full transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
