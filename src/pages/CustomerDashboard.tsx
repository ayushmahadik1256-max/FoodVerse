import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Order, OrderStatus, MenuItem } from '../types';
import { VIP_TIERS, calculateTierProgression, calculateOrderEarnedPoints } from '../utils/loyalty';
import {
  Receipt,
  RotateCcw,
  Coins,
  Sparkles,
  ShoppingBag,
  Clock,
  CheckCircle2,
  MapPin,
  Calendar,
  Search,
  ChevronRight,
  TrendingUp,
  Tag,
  ArrowRight,
  Eye,
  ShieldCheck,
  AlertCircle,
  Truck,
  Flame,
  Award,
  Filter,
  Layers,
  X,
  Heart,
  Star,
  Trash2,
  Plus,
  Crown,
  Gift,
  Check,
  Zap,
  Percent,
  Camera,
} from 'lucide-react';

interface CustomerDashboardProps {
  onSelectRestaurant: (restaurantId: string) => void;
  onOpenCart: () => void;
  onTrackOrder: (order: Order) => void;
  onExploreDishes: () => void;
  onOpenProfileEditor?: () => void;
  initialTab?: 'orders' | 'favorites' | 'loyalty' | 'addresses';
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  onSelectRestaurant,
  onOpenCart,
  onTrackOrder,
  onExploreDishes,
  onOpenProfileEditor,
  initialTab = 'orders',
}) => {
  const {
    currentUser,
    orders,
    restaurants,
    menuItems,
    toggleFavorite,
    addToCart,
    reorderOrder,
    completeOrder,
    earnLoyaltyPoints,
    open3DViewer,
    addNotification,
  } = useAppStore();

  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'favorites' | 'loyalty' | 'addresses'>(initialTab);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'delivered' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);
  const [hasClaimedDaily, setHasClaimedDaily] = useState(false);

  // Favorites search and filter states
  const [favoritesSearchQuery, setFavoritesSearchQuery] = useState('');
  const [favoritesCuisineFilter, setFavoritesCuisineFilter] = useState('all');

  // Filter orders for current customer
  const customerOrders = orders.filter(
    (o) => o.customerId === currentUser.id || o.customerName === currentUser.name
  );

  // User's favorited restaurants
  const favoriteRestaurants = restaurants.filter((r) =>
    currentUser.favorites.includes(r.id)
  );

  // Filtered favorite restaurants based on search & cuisine
  const filteredFavoriteRestaurants = favoriteRestaurants.filter((r) => {
    if (
      favoritesCuisineFilter !== 'all' &&
      !r.cuisines.some((c) => c.toLowerCase().includes(favoritesCuisineFilter.toLowerCase()))
    ) {
      return false;
    }
    if (favoritesSearchQuery.trim()) {
      const q = favoritesSearchQuery.toLowerCase();
      const matchName = r.name.toLowerCase().includes(q);
      const matchCuisine = r.cuisines.some((c) => c.toLowerCase().includes(q));
      return matchName || matchCuisine;
    }
    return true;
  });

  // Unique cuisines among favorite restaurants
  const favoriteCuisines = Array.from(
    new Set(favoriteRestaurants.flatMap((r) => r.cuisines))
  );

  // Lifetime savings calculations from loyalty points
  const totalLifetimeLoyaltySavings = customerOrders.reduce(
    (sum, o) => sum + (o.loyaltyDiscount || o.loyaltyPointsRedeemed || 0),
    0
  );

  const totalPointsEarnedLifetime =
    customerOrders.reduce((sum, o) => sum + (o.loyaltyPointsEarned || 0), 0) + 150; // includes 150 welcome bonus

  const availablePoints = currentUser.loyaltyPoints ?? 250;
  const progression = calculateTierProgression(totalPointsEarnedLifetime, availablePoints);

  const totalCouponSavings = customerOrders.reduce(
    (sum, o) => sum + (o.discountAmount || 0),
    0
  );

  const deliveredOrdersCount = customerOrders.filter((o) => o.status === 'delivered').length;
  const activeOrdersCount = customerOrders.filter(
    (o) => o.status !== 'delivered' && o.status !== 'cancelled'
  ).length;

  // Filtered orders list based on status & search
  const filteredOrders = customerOrders.filter((o) => {
    if (statusFilter === 'active') {
      if (o.status === 'delivered' || o.status === 'cancelled') return false;
    } else if (statusFilter === 'delivered') {
      if (o.status !== 'delivered') return false;
    } else if (statusFilter === 'cancelled') {
      if (o.status !== 'cancelled') return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNumber = o.orderNumber.toLowerCase().includes(q);
      const matchRest = o.restaurantName.toLowerCase().includes(q);
      const matchItems = o.items.some((i) => i.name.toLowerCase().includes(q));
      return matchNumber || matchRest || matchItems;
    }

    return true;
  });

  const handleReorder = (order: Order, openCheckoutImmediately = false) => {
    reorderOrder(order, true);
    if (openCheckoutImmediately) {
      onOpenCart();
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Delivered</span>
          </span>
        );
      case 'out_for_delivery':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800 animate-pulse">
            <Truck className="w-3.5 h-3.5" />
            <span>Out for Delivery</span>
          </span>
        );
      case 'preparing':
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <Clock className="w-3.5 h-3.5" />
            <span className="capitalize">{status}</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            <Clock className="w-3.5 h-3.5" />
            <span>Placed</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      {/* 1. CUSTOMER PROFILE & LIFETIME LOYALTY SAVINGS HERO BANNER */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-stone-900 to-stone-950 text-white p-6 sm:p-8 border border-stone-800 shadow-xl">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-32 -top-12 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div
              className={`relative group ${onOpenProfileEditor ? 'cursor-pointer' : ''}`}
              onClick={onOpenProfileEditor}
              title={onOpenProfileEditor ? 'Click to change avatar' : undefined}
            >
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={currentUser.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-orange-500/40 shadow-lg group-hover:border-orange-400 transition-all"
                referrerPolicy="no-referrer"
              />
              {onOpenProfileEditor && (
                <div className="absolute inset-0 bg-black/45 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                  <Camera className="w-5 h-5" />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-stone-950 font-black text-xs shadow-md">
                ★
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  {currentUser.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1">
                  <Award className="w-3 h-3 text-amber-400" />
                  <span>Gold Foodie Tier</span>
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-1">
                {currentUser.email} • {currentUser.phone || '+91 98765 43210'}
              </p>
              <div className="flex items-center gap-3 mt-2.5 text-xs text-stone-300">
                <span className="flex items-center gap-1">
                  <ShoppingBag className="w-3.5 h-3.5 text-orange-400" />
                  <strong className="text-white">{customerOrders.length}</strong> total orders
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  <strong className="text-white">{currentUser.loyaltyPoints ?? 250}</strong> active points
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Navigation */}
          <div className="flex flex-wrap items-center gap-2 self-stretch md:self-center">
            {onOpenProfileEditor && (
              <button
                type="button"
                onClick={onOpenProfileEditor}
                className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-1.5 backdrop-blur-sm cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-orange-400" />
                <span>Change Photo</span>
              </button>
            )}
            <button
              onClick={() => onExploreDishes()}
              className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Explore Restaurants</span>
            </button>
            <button
              onClick={() => onOpenCart()}
              className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-bold text-xs transition-all flex items-center gap-1.5"
            >
              <span>View Current Bag</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2. LIFETIME SAVINGS FROM LOYALTY POINTS METRICS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-stone-800">
          {/* Lifetime Loyalty Savings */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/30">
            <div className="flex items-center justify-between text-amber-400 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Lifetime Points Savings</span>
              <Coins className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              ₹{totalLifetimeLoyaltySavings.toFixed(2)}
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              Direct cash saved by redeeming FoodVerse reward points
            </p>
          </div>

          {/* Current Redeemable Balance */}
          <div className="p-4 rounded-2xl bg-stone-800/60 border border-stone-700/60">
            <div className="flex items-center justify-between text-stone-300 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Available Wallet</span>
              <Sparkles className="w-4 h-4 text-orange-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400">
              {currentUser.loyaltyPoints ?? 250} <span className="text-sm font-semibold text-stone-400">pts</span>
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              Worth <strong>₹{currentUser.loyaltyPoints ?? 250}.00</strong> off your next order (1 pt = ₹1)
            </p>
          </div>

          {/* Total Points Earned Lifetime */}
          <div className="p-4 rounded-2xl bg-stone-800/60 border border-stone-700/60">
            <div className="flex items-center justify-between text-stone-300 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Points Earned</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {totalPointsEarnedLifetime} <span className="text-sm font-semibold text-stone-400">pts</span>
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              Earn 10% on every order + milestone rewards
            </p>
          </div>

          {/* Combined Value Savings */}
          <div className="p-4 rounded-2xl bg-stone-800/60 border border-stone-700/60">
            <div className="flex items-center justify-between text-stone-300 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Total Value Saved</span>
              <Tag className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              ₹{(totalLifetimeLoyaltySavings + totalCouponSavings).toFixed(2)}
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              Combined loyalty points + coupon discounts
            </p>
          </div>
        </div>
      </section>

      {/* 3. NAVIGATION TABS */}
      <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveSubTab('orders')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
              activeSubTab === 'orders'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Order History</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
              {customerOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('favorites')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
              activeSubTab === 'favorites'
                ? 'border-rose-500 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Heart className={`w-4 h-4 ${activeSubTab === 'favorites' ? 'fill-rose-500 text-rose-500' : 'text-rose-500'}`} />
            <span>Favorite Kitchens</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeSubTab === 'favorites'
                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
            }`}>
              {currentUser.favorites.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('loyalty')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
              activeSubTab === 'loyalty'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-500" />
            <span>VIP Loyalty & Rewards</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-black bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700">
              {progression.currentTier.icon} {progression.currentTier.name.split(' ')[0]}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('addresses')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
              activeSubTab === 'addresses'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Saved Addresses</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
              {currentUser.addresses.length}
            </span>
          </button>
        </div>
      </div>

      {/* 4. TAB CONTENT: ORDER HISTORY & QUICK REORDER */}
      {activeSubTab === 'orders' && (
        <div className="space-y-6">
          {/* Filter Bar & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-stone-900 p-3 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { key: 'all', label: `All (${customerOrders.length})` },
                { key: 'active', label: `In Transit (${activeOrdersCount})` },
                { key: 'delivered', label: `Delivered (${deliveredOrdersCount})` },
                { key: 'cancelled', label: 'Cancelled' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setStatusFilter(key as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    statusFilter === key
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by order #, restaurant, or dish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-stone-100 dark:bg-stone-800/80 border border-transparent focus:border-orange-500 focus:outline-none dark:text-stone-100"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-500 flex items-center justify-center text-2xl mb-3">
                <Receipt className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                No orders found
              </h3>
              <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? `No orders matching "${searchQuery}". Try a different search keyword.`
                  : "You haven't placed any culinary orders in this category yet."}
              </p>
              <button
                onClick={() => onExploreDishes()}
                className="mt-5 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md transition-all inline-flex items-center gap-1.5"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Browse Menus Now</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const isActiveOrder = order.status !== 'delivered' && order.status !== 'cancelled';
                const hasLoyaltySavings =
                  (order.loyaltyDiscount && order.loyaltyDiscount > 0) ||
                  (order.loyaltyPointsRedeemed && order.loyaltyPointsRedeemed > 0);

                return (
                  <div
                    key={order.id}
                    className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Card Header */}
                    <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 bg-stone-50/70 dark:bg-stone-800/30">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center font-black text-sm">
                          FV
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-stone-900 dark:text-stone-100 text-sm">
                              {order.restaurantName}
                            </h3>
                            <span className="text-xs font-mono font-bold text-stone-400">
                              #{order.orderNumber}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-stone-400 mt-0.5">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {new Date(order.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            <span>•</span>
                            <span>{order.paymentMethod.toUpperCase()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {getStatusBadge(order.status)}
                        {hasLoyaltySavings && (
                          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                            <Coins className="w-3 h-3 text-amber-500" />
                            <span>Saved ₹{order.loyaltyDiscount || order.loyaltyPointsRedeemed}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Body: Ordered Items */}
                    <div className="p-4 sm:p-5 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {order.items.map((item, idx) => {
                          const fullMenuItem = menuItems.find((m) => m.id === item.menuItemId);
                          const canView3D = item.modelType || fullMenuItem?.has3DModel;

                          return (
                            <div
                              key={`${item.menuItemId}_${idx}`}
                              className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-12 h-12 rounded-xl object-cover border border-stone-200 dark:border-stone-700 shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className={`w-2 h-2 rounded-full shrink-0 ${
                                        item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'
                                      }`}
                                    />
                                    <p className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                                      {item.name}
                                    </p>
                                  </div>
                                  <p className="text-[11px] text-stone-400">
                                    Qty: <strong className="text-stone-700 dark:text-stone-300">{item.quantity}</strong> × ₹{item.price}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  onClick={() => {
                                    if (fullMenuItem) {
                                      open3DViewer(fullMenuItem);
                                    } else {
                                      open3DViewer({
                                        id: item.menuItemId,
                                        restaurantId: order.restaurantId,
                                        name: item.name,
                                        description: 'Gourmet dish from past order',
                                        price: item.price,
                                        category: 'Signature',
                                        isVeg: item.isVeg,
                                        isAvailable: true,
                                        rating: 4.8,
                                        ratingCount: 120,
                                        image: item.image,
                                      });
                                    }
                                  }}
                                  title="Inspect dish photo and details"
                                  className="p-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-orange-500 hover:scale-105 transition-all"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <span className="text-xs font-black text-stone-900 dark:text-stone-100">
                                  ₹{item.price * item.quantity}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Financial summary banner */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100 dark:border-stone-800 text-xs">
                        <div className="flex flex-wrap items-center gap-3 text-stone-500 dark:text-stone-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-stone-400" />
                            <span>{order.deliveryAddress?.street || 'Shivaji Chowk, Islampur'}</span>
                          </span>
                          {order.loyaltyPointsEarned && order.loyaltyPointsEarned > 0 && (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                              <span>+Earned {order.loyaltyPointsEarned} pts</span>
                            </span>
                          )}
                          {hasLoyaltySavings && (
                            <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                              <Coins className="w-3.5 h-3.5" />
                              <span>Loyalty discount applied: ₹{order.loyaltyDiscount || order.loyaltyPointsRedeemed}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 font-bold">
                          <span className="text-stone-400">Total Paid:</span>
                          <span className="text-base font-black text-stone-900 dark:text-stone-100">
                            ₹{order.totalAmount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="p-4 sm:p-5 pt-0 flex flex-wrap items-center justify-between gap-3">
                      <button
                        onClick={() => setSelectedReceiptOrder(order)}
                        className="text-xs text-stone-500 dark:text-stone-400 hover:text-orange-500 dark:hover:text-orange-400 font-semibold flex items-center gap-1"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>View Itemized Bill</span>
                      </button>

                      <div className="flex items-center gap-2">
                        {isActiveOrder && (
                          <>
                            <button
                              onClick={() => onTrackOrder(order)}
                              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Track Live Scooter</span>
                            </button>

                            <button
                              onClick={() => completeOrder(order.id)}
                              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 active:scale-95"
                              title="Complete order to earn loyalty points"
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>
                                Delivered & Claim +{order.loyaltyPointsEarned || Math.round(order.totalAmount * 0.1)} Pts
                              </span>
                            </button>
                          </>
                        )}

                        {/* REORDER BUTTON FOR QUICK CHECKOUT */}
                        <button
                          onClick={() => handleReorder(order, true)}
                          className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all flex items-center gap-1.5 active:scale-95"
                          title="Add all items to bag and open quick checkout"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reorder & Quick Checkout</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. TAB CONTENT: LOYALTY SAVINGS & VIP REWARDS PROGRAM */}
      {activeSubTab === 'loyalty' && (
        <div className="space-y-6">
          {/* A. VIP STATUS HERO BANNER */}
          <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm p-6 sm:p-8">
            <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl ${progression.currentTier.bgGradient} rounded-full blur-3xl pointer-events-none opacity-60`} />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Left: User Tier Badge & Details */}
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-stone-100 dark:bg-stone-800 border-2 border-amber-400 dark:border-amber-600 flex items-center justify-center text-3xl sm:text-4xl shadow-md shrink-0">
                  {progression.currentTier.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                      VIP Status Level
                    </span>
                    <span className="text-xs text-stone-400">Tier {progression.tierIndex + 1} of 5</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-100 mt-1">
                    {progression.currentTier.name}
                  </h2>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-md">
                    {progression.currentTier.tagline}
                  </p>
                </div>
              </div>

              {/* Right: Daily Check-In & Spendable Balance */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    if (!hasClaimedDaily) {
                      earnLoyaltyPoints(25, 'Daily VIP Foodie Check-In');
                      setHasClaimedDaily(true);
                    }
                  }}
                  disabled={hasClaimedDaily}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm ${
                    hasClaimedDaily
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 cursor-default'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-orange-500/25 active:scale-95'
                  }`}
                >
                  <Gift className="w-4 h-4" />
                  <span>{hasClaimedDaily ? 'Daily Check-In Claimed (+25 pts)' : 'Daily VIP Check-In (+25 pts)'}</span>
                </button>

                <button
                  onClick={onExploreDishes}
                  className="px-4 py-2.5 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold transition-all border border-stone-200 dark:border-stone-700 flex items-center gap-1.5"
                >
                  <span>Order & Earn Points</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Financial Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-stone-100 dark:border-stone-800">
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center justify-between">
                  <span>Available Spendable Power</span>
                  <Coins className="w-3.5 h-3.5" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  ₹{availablePoints}.00
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                  {availablePoints} reward points ready to redeem at ₹1/pt on checkout
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center justify-between">
                  <span>Current Tier Cashback</span>
                  <Percent className="w-3.5 h-3.5" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">
                  {progression.currentTier.cashbackPercent}% Cashback
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                  Earn {progression.currentTier.cashbackPercent} pts for every ₹100 on completed orders
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                <div className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 flex items-center justify-between">
                  <span>Lifetime Points Accumulated</span>
                  <Award className="w-3.5 h-3.5" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-100 mt-1">
                  {totalPointsEarnedLifetime} pts
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                  Total points earned across all orders and welcome gifts
                </p>
              </div>
            </div>

            {/* B. VIP TIER PROGRESSION BAR */}
            <div className="mt-6 p-5 sm:p-6 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-stone-900 dark:text-stone-100">
                  <span className="text-lg">{progression.currentTier.icon}</span>
                  <span>Active: {progression.currentTier.name}</span>
                  {progression.nextTier && (
                    <>
                      <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                      <span className="text-orange-600 dark:text-orange-400">
                        Next: {progression.nextTier.name} ({progression.nextTier.icon})
                      </span>
                    </>
                  )}
                </div>

                <div className="text-xs font-bold text-stone-500 dark:text-stone-400">
                  {progression.nextTier ? (
                    <span className="text-orange-600 dark:text-orange-400 font-extrabold">
                      {progression.pointsToNextTier} points needed to upgrade
                    </span>
                  ) : (
                    <span className="text-purple-600 dark:text-purple-400 font-extrabold">
                      Crown Level Reached!
                    </span>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative w-full h-4 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-full transition-all duration-700 relative"
                  style={{ width: `${Math.max(5, progression.progressPercent)}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-stone-400 gap-1">
                <span>
                  {totalPointsEarnedLifetime} lifetime points ({progression.progressPercent}% towards next tier)
                </span>
                {progression.nextTier && (
                  <span className="text-stone-600 dark:text-stone-300 font-medium">
                    Unlocks: {progression.nextTier.perks[1]?.title || 'Free Priority Express Delivery'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* C. ACTIVE ORDERS EARNING POINTS BANNER (IF ANY) */}
          {customerOrders.some((o) => o.status !== 'delivered' && o.status !== 'cancelled') && (
            <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-stone-900 dark:text-stone-100 space-y-3">
              <div className="flex items-center gap-2 font-black text-sm text-amber-700 dark:text-amber-400">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Active Orders Earning VIP Points</span>
              </div>
              <div className="space-y-2">
                {customerOrders
                  .filter((o) => o.status !== 'delivered' && o.status !== 'cancelled')
                  .map((activeOrder) => {
                    const earned =
                      activeOrder.loyaltyPointsEarned || Math.round(activeOrder.totalAmount * 0.1);
                    return (
                      <div
                        key={activeOrder.id}
                        className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="font-bold text-stone-900 dark:text-stone-100">
                            Order #{activeOrder.orderNumber} • {activeOrder.restaurantName}
                          </div>
                          <div className="text-[11px] text-stone-400 mt-0.5">
                            Status: <span className="font-bold text-orange-500 capitalize">{activeOrder.status.replace(/_/g, ' ')}</span> • Total: ₹{activeOrder.totalAmount.toFixed(2)}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-xl">
                            +{earned} pts upon delivery
                          </span>

                          <button
                            onClick={() => completeOrder(activeOrder.id)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-transform active:scale-95"
                          >
                            Mark Delivered & Claim
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* D. VIP TIERS ROADMAP & BENEFITS MATRIX */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                <span>FoodVerse VIP Tiers & Privileges Roadmap</span>
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                Climb tiers as you complete orders. Each tier unlocks higher cashback percentages and premium perks.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
              {VIP_TIERS.map((tier, idx) => {
                const isCurrent = progression.currentTier.level === tier.level;
                const isUnlocked = totalPointsEarnedLifetime >= tier.minPoints;

                return (
                  <div
                    key={tier.level}
                    className={`rounded-2xl p-4 border flex flex-col justify-between transition-all ${
                      isCurrent
                        ? 'border-orange-500 bg-orange-50/60 dark:bg-orange-950/30 shadow-md ring-2 ring-orange-500/20'
                        : isUnlocked
                        ? 'border-emerald-300 dark:border-emerald-800/60 bg-emerald-50/20 dark:bg-emerald-950/10'
                        : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30 opacity-75'
                    }`}
                  >
                    <div>
                      {/* Tier Icon and Title */}
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{tier.icon}</span>
                        {isCurrent ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-orange-500 text-white shadow-xs">
                            CURRENT TIER
                          </span>
                        ) : isUnlocked ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Unlocked
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300">
                            {tier.minPoints} pts
                          </span>
                        )}
                      </div>

                      <h4 className="font-extrabold text-sm text-stone-900 dark:text-stone-100 mt-2">
                        {tier.name}
                      </h4>
                      <p className="text-[11px] font-semibold text-orange-600 dark:text-orange-400 mt-0.5">
                        {tier.cashbackPercent}% Cash Points Back
                      </p>

                      <div className="text-[10px] text-stone-400 mt-1">
                        {tier.maxPoints === Infinity ? '2,500+ pts' : `${tier.minPoints} - ${tier.maxPoints} pts`}
                      </div>

                      {/* Perks list */}
                      <ul className="mt-3 space-y-1.5 text-[11px] text-stone-600 dark:text-stone-300 border-t border-stone-100 dark:border-stone-800 pt-2.5">
                        {tier.perks.map((perk, pIdx) => (
                          <li key={pIdx} className="flex items-start gap-1.5">
                            <Check className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isUnlocked ? 'text-emerald-500' : 'text-stone-400'}`} />
                            <span className="leading-tight">{perk.title}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* E. COMPLETED ORDERS POINTS LEDGER */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-extrabold text-base text-stone-900 dark:text-stone-100">
                  Completed Orders Points Ledger
                </h3>
                <p className="text-xs text-stone-400">
                  Exact points earned and discounts redeemed across your orders
                </p>
              </div>
              <div className="text-xs font-bold text-stone-500 dark:text-stone-400">
                Total Saved: ₹{totalLifetimeLoyaltySavings.toFixed(2)}
              </div>
            </div>

            <div className="divide-y divide-stone-100 dark:divide-stone-800 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden">
              {customerOrders.map((order) => {
                const isDelivered = order.status === 'delivered';
                const pointsEarned = order.loyaltyPointsEarned || Math.round(order.totalAmount * 0.1);

                return (
                  <div
                    key={order.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-white dark:bg-stone-900 hover:bg-stone-50/50 dark:hover:bg-stone-800/40 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 dark:text-stone-100">
                          Order #{order.orderNumber}
                        </span>
                        <span className="text-stone-400">•</span>
                        <span className="text-stone-700 dark:text-stone-300 font-medium">
                          {order.restaurantName}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isDelivered
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                        }`}>
                          {isDelivered ? 'Delivered' : order.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-400 mt-0.5 flex items-center gap-2">
                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Bill Amount: ₹{order.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {order.loyaltyPointsRedeemed && order.loyaltyPointsRedeemed > 0 ? (
                        <div className="text-right">
                          <div className="font-bold text-amber-600 dark:text-amber-400">
                            -₹{order.loyaltyDiscount || order.loyaltyPointsRedeemed}.00
                          </div>
                          <div className="text-[10px] text-stone-400">
                            {order.loyaltyPointsRedeemed} pts used
                          </div>
                        </div>
                      ) : (
                        <div className="text-[11px] text-stone-400">No points used</div>
                      )}

                      {isDelivered ? (
                        <div className="font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                          <span>+{pointsEarned} VIP Pts</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => completeOrder(order.id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-transform active:scale-95"
                          title="Mark delivered and credit points"
                        >
                          Claim +{pointsEarned} Pts
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Welcome Bonus Entry */}
              <div className="p-4 flex items-center justify-between gap-4 text-xs bg-stone-50/60 dark:bg-stone-800/30">
                <div>
                  <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <span>FoodVerse Welcome Gift Bonus</span>
                    <span>🎁</span>
                  </div>
                  <div className="text-[11px] text-stone-400 mt-0.5">Account Registration Perk</div>
                </div>
                <div className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
                  +150 VIP pts credited
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB CONTENT: FAVORITE RESTAURANTS */}
      {activeSubTab === 'favorites' && (
        <div className="space-y-6">
          {/* Header & Search Bar */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
                    <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      <span>Favorite Kitchens</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold">
                        {favoriteRestaurants.length} saved
                      </span>
                    </h2>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                      Your bookmarked dining destinations for express reordering and authentic dish previews
                    </p>
                  </div>
                </div>
              </div>

              {favoriteRestaurants.length > 0 && (
                <button
                  onClick={onExploreDishes}
                  className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold transition-all"
                >
                  <Plus className="w-3.5 h-3.5 text-rose-500" />
                  <span>Discover More Kitchens</span>
                </button>
              )}
            </div>

            {/* Search and Cuisines Filter within Favorites */}
            {favoriteRestaurants.length > 0 && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-stone-100 dark:border-stone-800">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search saved kitchens or cuisines..."
                    value={favoritesSearchQuery}
                    onChange={(e) => setFavoritesSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-stone-100 dark:bg-stone-800/80 border border-transparent focus:border-rose-500 focus:outline-none dark:text-stone-100 transition-all"
                  />
                  {favoritesSearchQuery && (
                    <button
                      onClick={() => setFavoritesSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {favoriteCuisines.length > 1 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                    <button
                      onClick={() => setFavoritesCuisineFilter('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                        favoritesCuisineFilter === 'all'
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                      }`}
                    >
                      All Cuisines
                    </button>
                    {favoriteCuisines.map((c) => (
                      <button
                        key={c}
                        onClick={() => setFavoritesCuisineFilter(c)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                          favoritesCuisineFilter === c
                            ? 'bg-rose-600 text-white shadow-sm'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Empty State when no favorites bookmarked at all */}
          {favoriteRestaurants.length === 0 ? (
            <div className="bg-white dark:bg-stone-900 rounded-3xl p-12 text-center border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center mx-auto text-2xl shadow-inner">
                <Heart className="w-8 h-8 text-rose-400 stroke-1" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-lg font-extrabold text-stone-900 dark:text-stone-100">
                  No Favorite Kitchens Bookmarked Yet
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                  Whenever you find a kitchen you love on the Home Page, tap the heart icon on its card to bookmark it here for instant access and one-click ordering.
                </p>
              </div>
              <button
                onClick={onExploreDishes}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-lg shadow-orange-500/25 transition-all active:scale-95"
              >
                <span>Explore Restaurants & Menus</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : filteredFavoriteRestaurants.length === 0 ? (
            /* Search filter empty state */
            <div className="bg-white dark:bg-stone-900 rounded-3xl p-10 text-center border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
              <p className="text-sm font-bold text-stone-800 dark:text-stone-200">
                No bookmarked restaurants match your filter.
              </p>
              <button
                onClick={() => {
                  setFavoritesSearchQuery('');
                  setFavoritesCuisineFilter('all');
                }}
                className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold hover:bg-stone-200"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            /* Favorites Cards List */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredFavoriteRestaurants.map((restaurant) => {
                const restDishes = menuItems.filter((m) => m.restaurantId === restaurant.id).slice(0, 3);

                return (
                  <div
                    key={restaurant.id}
                    className="bg-white dark:bg-stone-900 rounded-3xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Banner Image & Overlay Badges */}
                      <div className="relative h-44 w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
                        <img
                          src={restaurant.image}
                          alt={restaurant.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                          onClick={() => onSelectRestaurant(restaurant.id)}
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent pointer-events-none" />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                          {restaurant.isPromoted && (
                            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-900/85 backdrop-blur-md text-white font-bold text-[10px] uppercase tracking-wider shadow-md">
                              <Sparkles className="w-3 h-3 text-orange-400" />
                              <span>Chef's Choice</span>
                            </span>
                          )}
                          {restaurant.isVegOnly && (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-600/90 backdrop-blur-md text-white font-bold text-[10px] uppercase tracking-wider shadow-md">
                              Pure Veg
                            </span>
                          )}
                        </div>

                        {/* Remove from Favorites Toggle Button */}
                        <button
                          onClick={() => toggleFavorite(restaurant.id)}
                          title="Remove from favorites"
                          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 dark:bg-stone-900/90 backdrop-blur-md flex items-center justify-center text-rose-500 hover:scale-110 active:scale-95 transition-all shadow-md group"
                        >
                          <Heart className="w-4 h-4 fill-rose-500 text-rose-500 group-hover:opacity-75" />
                        </button>

                        {/* Bottom Info on Banner */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-semibold">
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-900/80 backdrop-blur-md">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span>{restaurant.rating}</span>
                            </span>
                            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-900/80 backdrop-blur-md">
                              <Clock className="w-3.5 h-3.5 text-orange-400" />
                              <span>{restaurant.deliveryTime} mins</span>
                            </span>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full bg-stone-900/80 backdrop-blur-md">
                            {restaurant.location?.city || 'Express Delivery'}
                          </span>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-5 space-y-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3
                              onClick={() => onSelectRestaurant(restaurant.id)}
                              className="text-lg font-bold text-stone-900 dark:text-stone-100 hover:text-orange-500 transition-colors cursor-pointer"
                            >
                              {restaurant.name}
                            </h3>
                            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                              {restaurant.cuisines.join(' • ')}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                              ₹{restaurant.priceForTwo}
                            </span>
                            <div className="text-[10px] text-stone-400">for two</div>
                          </div>
                        </div>

                        {/* Dietary tags */}
                        {restaurant.dietaryPreferences && restaurant.dietaryPreferences.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {restaurant.dietaryPreferences.map((diet) => (
                              <span
                                key={diet}
                                className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
                              >
                                {diet}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Signature Dishes Spotlight */}
                        {restDishes.length > 0 && (
                          <div className="space-y-2 pt-3 border-t border-stone-100 dark:border-stone-800">
                            <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                              Popular from this Kitchen:
                            </div>
                            <div className="space-y-2">
                              {restDishes.map((dish) => (
                                <div
                                  key={dish.id}
                                  className="flex items-center justify-between gap-3 p-2 rounded-xl bg-stone-50 dark:bg-stone-800/50 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-xs"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <img
                                      src={dish.image}
                                      alt={dish.name}
                                      className="w-10 h-10 rounded-lg object-cover shrink-0"
                                      referrerPolicy="no-referrer"
                                    />
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        <span
                                          className={`w-2 h-2 rounded-full shrink-0 ${
                                            dish.isVeg ? 'bg-emerald-500' : 'bg-rose-500'
                                          }`}
                                        />
                                        <span className="font-bold text-stone-800 dark:text-stone-200 truncate">
                                          {dish.name}
                                        </span>
                                      </div>
                                      <span className="text-[11px] font-semibold text-stone-500">
                                        ₹{dish.price}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      onClick={() => open3DViewer(dish)}
                                      title="Inspect dish photo"
                                      className="px-2 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-orange-500/10 text-stone-600 dark:text-stone-300 hover:text-orange-500 text-[10px] font-bold flex items-center gap-1 transition-colors"
                                    >
                                      <Eye className="w-3 h-3" />
                                      <span>Photo</span>
                                    </button>
                                    <button
                                      onClick={() => {
                                        addToCart(dish, 1);
                                        addNotification('Added to Cart', `${dish.name} added to your tray!`, 'success');
                                      }}
                                      className="px-2.5 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-bold transition-all shadow-sm active:scale-95"
                                    >
                                      + Add
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="p-5 pt-0 flex items-center gap-2">
                      <button
                        onClick={() => onSelectRestaurant(restaurant.id)}
                        className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <span>Explore Full Menu</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => toggleFavorite(restaurant.id)}
                        className="px-3 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-stone-600 dark:text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-semibold transition-colors"
                        title="Remove from favorites"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 6. TAB CONTENT: SAVED ADDRESSES */}
      {activeSubTab === 'addresses' && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-stone-900 dark:text-stone-100">
                Delivery Addresses
              </h2>
              <p className="text-xs text-stone-400">
                Saved locations for seamless express delivery
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentUser.addresses.map((addr) => (
              <div
                key={addr.id}
                className="p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 space-y-2 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
                    {addr.label}
                  </span>
                  {addr.isDefault && (
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Default</span>
                    </span>
                  )}
                </div>
                <p className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  {addr.street}
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {addr.city}, {addr.state} - {addr.zip}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. DIGITAL RECEIPT MODAL */}
      {selectedReceiptOrder && (
        <div
          onClick={() => setSelectedReceiptOrder(null)}
          className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-stone-900 w-full max-w-md rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl p-6 space-y-4 animate-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-orange-500" />
                <h3 className="font-extrabold text-stone-900 dark:text-stone-100 text-base">
                  Order Invoice #{selectedReceiptOrder.orderNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedReceiptOrder(null);
                }}
                className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center text-stone-500 transition-all active:scale-90 cursor-pointer pointer-events-auto"
                aria-label="Close invoice"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            <div className="space-y-1 text-xs">
              <div className="font-bold text-stone-800 dark:text-stone-200">
                {selectedReceiptOrder.restaurantName}
              </div>
              <div className="text-stone-400 text-[11px]">
                Placed on {new Date(selectedReceiptOrder.createdAt).toLocaleString()}
              </div>
            </div>

            {/* Items */}
            <div className="divide-y divide-stone-100 dark:divide-stone-800 text-xs py-2 max-h-48 overflow-y-auto">
              {selectedReceiptOrder.items.map((item, i) => (
                <div key={i} className="py-2 flex items-center justify-between">
                  <span>
                    {item.quantity}x {item.name}
                  </span>
                  <span className="font-bold">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Breakdown */}
            <div className="space-y-1.5 pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
              <div className="flex justify-between text-stone-500">
                <span>Subtotal</span>
                <span>₹{selectedReceiptOrder.subtotal}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Delivery Fee</span>
                <span>₹{selectedReceiptOrder.deliveryFee}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Taxes</span>
                <span>₹{selectedReceiptOrder.tax}</span>
              </div>
              {selectedReceiptOrder.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount</span>
                  <span>-₹{selectedReceiptOrder.discountAmount}</span>
                </div>
              )}
              {selectedReceiptOrder.loyaltyDiscount && selectedReceiptOrder.loyaltyDiscount > 0 && (
                <div className="flex justify-between text-amber-600 dark:text-amber-400 font-bold">
                  <span>Loyalty Points Discount ({selectedReceiptOrder.loyaltyPointsRedeemed} pts)</span>
                  <span>-₹{selectedReceiptOrder.loyaltyDiscount}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black pt-2 border-t border-stone-200 dark:border-stone-700">
                <span>Total Paid</span>
                <span>₹{selectedReceiptOrder.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-3 flex gap-2">
              <button
                onClick={() => {
                  handleReorder(selectedReceiptOrder, true);
                  setSelectedReceiptOrder(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reorder Items Now</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedReceiptOrder(null)}
                className="px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
