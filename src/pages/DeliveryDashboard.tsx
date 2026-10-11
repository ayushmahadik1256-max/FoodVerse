import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { LeafletMap } from '../components/common/LeafletMap';
import { fetchAvailableDeliveries, claimDeliveryApi, updateCourierLocationApi, saveAccountProfile } from '../services/accountApi';
import { Order } from '../types';
import {
  Bike,
  Navigation,
  CheckCircle2,
  DollarSign,
  Clock,
  Power,
  Package,
  Radio,
  MapPin,
} from 'lucide-react';

export const DeliveryDashboard: React.FC = () => {
  const { currentUser, orders, updateOrderStatus, addNotification, refreshOrders } = useAppStore();
  const [isOnline, setIsOnline] = useState(currentUser.isOnline ?? false);
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [isClaiming, setIsClaiming] = useState<string | null>(null);

  useEffect(() => {
    setIsOnline(currentUser.isOnline ?? false);
  }, [currentUser.id, currentUser.isOnline]);

  const toggleOnlineStatus = async () => {
    const nextStatus = !isOnline;
    setIsOnline(nextStatus);
    try {
      await saveAccountProfile({ isOnline: nextStatus });
    } catch (err) {
      setIsOnline(!nextStatus);
      addNotification('Status update failed', err instanceof Error ? err.message : 'Could not update duty status.', 'warning');
    }
  };

  // Refresh assigned deliveries so newly placed orders arrive without re-login.
  useEffect(() => {
    const loadDeliveries = () => {
      void refreshOrders().catch(() => {});
      if (isOnline) {
        fetchAvailableDeliveries()
          .then(setAvailableOrders)
          .catch(() => {});
      } else {
        setAvailableOrders([]);
      }
    };
    loadDeliveries();
    const interval = setInterval(loadDeliveries, 10000);
    return () => clearInterval(interval);
  }, [isOnline, refreshOrders]);

  // Orders assigned to this logged-in courier partner
  const myActiveOrders = orders.filter(
    (o) =>
      o.deliveryPartnerId === currentUser.id &&
      (o.status === 'placed' || o.status === 'accepted' || o.status === 'preparing' || o.status === 'out_for_delivery')
  );
  const completedOrders = orders.filter(
    (o) => o.deliveryPartnerId === currentUser.id && o.status === 'delivered'
  );

  // Courier earnings: ₹80 per delivery + daily incentive
  const todayEarnings = completedOrders.length * 80 + (completedOrders.length > 0 ? 150 : 0);

  const handleClaimOrder = async (orderId: string) => {
    try {
      setIsClaiming(orderId);
      await claimDeliveryApi(orderId);
      setAvailableOrders((prev) => prev.filter((o) => o.id !== orderId));
      addNotification('Order Claimed!', `You have been assigned to order #${orderId.slice(-6)}.`, 'success');
      await refreshOrders();
    } catch (err) {
      addNotification('Claim Failed', err instanceof Error ? err.message : 'Could not claim order.', 'warning');
    } finally {
      setIsClaiming(null);
    }
  };

  const handleUpdateLocation = async (order: Order) => {
    try {
      // Simulate slight move along transit route for live GPS simulation
      const baseLoc = order.currentLocation || order.restaurantLocation;
      const offset = 0.0015;
      const newLoc: [number, number] = [baseLoc[0] + offset, baseLoc[1] - offset];
      await updateCourierLocationApi(order.id, newLoc);
      await updateOrderStatus(order.id, order.status, newLoc);
      addNotification('GPS Updated', 'Live coordinates transmitted to customer tracking.', 'info');
    } catch (err) {
      addNotification('Location Error', err instanceof Error ? err.message : 'Could not broadcast location.', 'warning');
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header & Online Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200/80 dark:border-stone-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
            <Bike className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-stone-900 dark:text-stone-100">
                {currentUser.name || 'Fleet Courier Partner'}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                  isOnline ? 'bg-emerald-500/10 text-emerald-600' : 'bg-stone-200 text-stone-600'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-stone-400'}`}
                />
                <span>{isOnline ? 'Duty Online' : 'Offline'}</span>
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              FoodVerse Hero Partner ID: <span className="font-mono">#{currentUser.id.slice(-6).toUpperCase()}</span> • 4.9★
            </p>
          </div>
        </div>

        {/* Online/Offline Toggle Button */}
        <button
          onClick={toggleOnlineStatus}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs transition-all shadow-md cursor-pointer ${
            isOnline
              ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
          }`}
        >
          <Power className="w-4 h-4" />
          <span>{isOnline ? 'Go Offline' : 'Start Duty Shift'}</span>
        </button>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-stone-400">Today's Payout</span>
            <div className="text-2xl font-black text-stone-900 dark:text-stone-100">
              ₹{todayEarnings}
            </div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-stone-400">Completed Orders</span>
            <div className="text-2xl font-black text-stone-900 dark:text-stone-100">
              {completedOrders.length} runs
            </div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-stone-400">Average Transit Time</span>
            <div className="text-2xl font-black text-stone-900 dark:text-stone-100">
              18.4 mins
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: AVAILABLE PICKUP ORDERS (CLAIMABLE) */}
      {isOnline && availableOrders.length > 0 && (
        <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-3xl p-6 border border-orange-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500 animate-ping" />
              <span>Available Orders for Pickup ({availableOrders.length})</span>
            </h2>
            <span className="text-xs text-orange-700 dark:text-orange-400 font-bold">Unassigned Kitchen Tickets</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableOrders.map((ord) => (
              <div key={ord.id} className="p-4 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-orange-500">
                    <span>#{ord.orderNumber}</span>
                    <span className="px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                      ₹{ord.totalAmount}
                    </span>
                  </div>
                  <div className="font-bold text-sm text-stone-900 dark:text-stone-100 mt-1">
                    {ord.restaurantName}
                  </div>
                  <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-stone-400" />
                    <span>Drop: {ord.deliveryAddress.street}, {ord.deliveryAddress.city}</span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isClaiming === ord.id}
                  onClick={() => handleClaimOrder(ord.id)}
                  className="w-full py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Bike className="w-3.5 h-3.5" />
                  <span>{isClaiming === ord.id ? 'Claiming Run...' : 'Claim Delivery Run'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: MY ASSIGNED TRANSIT RUNS */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <Navigation className="w-5 h-5 text-orange-500" />
          <span>My Assigned Deliveries ({myActiveOrders.length})</span>
        </h2>

        {!isOnline ? (
          <div className="p-12 text-center bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800">
            <p className="text-stone-400 text-sm">You are offline. Turn on your shift to receive delivery tickets.</p>
          </div>
        ) : myActiveOrders.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800">
            <p className="text-stone-400 text-sm">No orders are currently assigned to you. New orders will appear here while you are online.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {myActiveOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-6"
              >
                {/* Header info */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 dark:border-stone-800 pb-4">
                  <div>
                    <span className="text-xs font-mono font-bold text-orange-500">
                      Ticket #{order.orderNumber}
                    </span>
                    <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                      Deliver to: {order.customerName}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400 text-xs font-bold uppercase">
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* Interactive Leaflet Route Map */}
                <LeafletMap
                  center={order.currentLocation || order.restaurantLocation}
                  restaurantLocation={order.restaurantLocation}
                  restaurantName={order.restaurantName}
                  deliveryLocation={[order.deliveryAddress.lat, order.deliveryAddress.lng]}
                  deliveryAddress={order.deliveryAddress.street}
                  courierLocation={order.currentLocation}
                  courierName={currentUser.name || 'Your Location'}
                  className="h-64 w-full rounded-2xl"
                />

                {/* Pickup & Drop Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800 space-y-1">
                    <span className="font-bold text-stone-400 uppercase tracking-wider text-[10px]">
                      1. Pick Up Location
                    </span>
                    <div className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                      {order.restaurantName}
                    </div>
                    <p className="text-stone-500 dark:text-stone-400">Kitchen Counter Dispatch</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800 space-y-1">
                    <span className="font-bold text-stone-400 uppercase tracking-wider text-[10px]">
                      2. Customer Drop Location
                    </span>
                    <div className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                      {order.deliveryAddress.label} Address
                    </div>
                    <p className="text-stone-500 dark:text-stone-400">
                      {order.deliveryAddress.street}, {order.deliveryAddress.city}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateLocation(order)}
                    className="py-3 px-4 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Radio className="w-4 h-4 text-orange-500 animate-pulse" />
                    <span>Ping Live GPS</span>
                  </button>

                  {order.status === 'preparing' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'out_for_delivery')}
                      className="flex-1 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <Bike className="w-4 h-4" />
                      <span>Confirm Picked Up & Start Ride</span>
                    </button>
                  )}

                  {order.status === 'out_for_delivery' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'delivered')}
                      className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm Doorstep Delivery (Complete Run)</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
