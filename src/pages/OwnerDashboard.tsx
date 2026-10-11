import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { MenuItem, OrderStatus, Restaurant, ModelType } from '../types';
import {
  Store,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  TrendingUp,
  DollarSign,
  PackageCheck,
  Clock,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  BarChart3,
} from 'lucide-react';

export const OwnerDashboard: React.FC = () => {
  const {
    currentUser,
    restaurants,
    menuItems,
    orders,
    updateRestaurant,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    updateOrderStatus,
    addNotification,
  } = useAppStore();

  const ownedRestaurants = restaurants.filter((r) => r.ownerId === currentUser.id);
  const [selectedRestId, setSelectedRestId] = useState<string>(() => {
    return ownedRestaurants[0]?.id || restaurants[0]?.id || '';
  });

  const myRestaurant = restaurants.find((r) => r.id === selectedRestId) || ownedRestaurants[0] || restaurants[0] || {
    id: 'rest_1',
    name: 'Gourmet Kitchen',
    description: '',
    priceForTwo: 400,
    isApproved: true,
    ownerId: currentUser.id,
  } as Restaurant;

  const myItems = menuItems.filter((m) => m.restaurantId === myRestaurant.id);
  const myOrders = orders.filter((o) => o.restaurantId === myRestaurant.id);

  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'analytics' | 'profile'>('orders');

  // New Dish Modal Form State
  const [isAddDishOpen, setIsAddDishOpen] = useState(false);
  const [dishName, setDishName] = useState('');
  const [dishDesc, setDishDesc] = useState('');
  const [dishPrice, setDishPrice] = useState(299);
  const [dishCategory, setDishCategory] = useState('Burgers');
  const [dishIsVeg, setDishIsVeg] = useState(false);
  const [dishModelType, setDishModelType] = useState<ModelType>('burger');
  const [dishImage, setDishImage] = useState(
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80'
  );

  // Restaurant Profile State
  const [restName, setRestName] = useState(myRestaurant.name);
  const [restDesc, setRestDesc] = useState(myRestaurant.description);
  const [restPriceForTwo, setRestPriceForTwo] = useState(myRestaurant.priceForTwo);

  // Sync profile form state when selected restaurant changes
  React.useEffect(() => {
    if (myRestaurant) {
      setRestName(myRestaurant.name);
      setRestDesc(myRestaurant.description);
      setRestPriceForTwo(myRestaurant.priceForTwo);
    }
  }, [myRestaurant.id, myRestaurant.name, myRestaurant.description, myRestaurant.priceForTwo]);

  // Create dish handler
  const handleSaveDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName.trim()) return;

    addMenuItem({
      restaurantId: myRestaurant.id,
      name: dishName,
      description: dishDesc || 'Freshly prepared signature culinary dish.',
      price: Number(dishPrice),
      category: dishCategory,
      isVeg: dishIsVeg,
      isAvailable: true,
      has3DModel: true,
      modelType: dishModelType,
      image: dishImage,
      calories: 520,
      preparationTime: '15-20 min',
      ingredients: ['Fresh Produce', 'Chef Seasonings'],
      rating: 5.0,
      ratingCount: 1,
    });

    setIsAddDishOpen(false);
    setDishName('');
    setDishDesc('');
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateRestaurant({
      id: myRestaurant.id,
      name: restName,
      description: restDesc,
      priceForTwo: Number(restPriceForTwo),
    });
  };

  // Analytics Metrics
  const totalRevenue = myOrders.reduce((acc, o) => acc + o.totalAmount, 0);
  const totalOrdersCount = myOrders.length;
  const avgOrderValue = totalOrdersCount > 0 ? (totalRevenue / totalOrdersCount).toFixed(0) : 0;

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200/80 dark:border-stone-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
            <Store className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-stone-900 dark:text-stone-100">
                {myRestaurant.name}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  myRestaurant.isApproved
                    ? 'bg-emerald-500/10 text-emerald-600'
                    : 'bg-amber-500/10 text-amber-600'
                }`}
              >
                {myRestaurant.isApproved ? 'Approved Kitchen' : 'Pending Admin Approval'}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Owner ID: <span className="font-mono">{myRestaurant.ownerId || currentUser.id}</span>
              </p>
              {ownedRestaurants.length > 1 && (
                <select
                  value={selectedRestId}
                  onChange={(e) => setSelectedRestId(e.target.value)}
                  className="text-xs font-bold px-2 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700"
                >
                  {ownedRestaurants.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 p-1.5 rounded-2xl">
          {[
            { id: 'orders', label: 'Live Orders', count: myOrders.length },
            { id: 'menu', label: 'Menu Catalog', count: myItems.length },
            { id: 'analytics', label: 'Sales Analytics' },
            { id: 'profile', label: 'Store Profile' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-stone-900 text-orange-600 dark:text-orange-400 shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-600 font-extrabold">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 1. ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
              Active Incoming Orders
            </h2>
            <span className="text-xs text-stone-400">Auto-synced via Socket.IO simulation</span>
          </div>

          {myOrders.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800">
              <p className="text-stone-400 text-sm">No incoming tickets at this moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold text-orange-500">
                        {order.orderNumber}
                      </span>
                      <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                        Customer: {order.customerName}
                      </h4>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        order.status === 'placed'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                          : order.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                      }`}
                    >
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Items breakdown */}
                  <div className="space-y-1.5 py-2 border-y border-stone-100 dark:border-stone-800/80 text-xs">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-stone-600 dark:text-stone-300">
                        <span>
                          {it.quantity}x {it.name}
                        </span>
                        <span className="font-semibold">₹{it.price * it.quantity}</span>
                      </div>
                    ))}
                    <div className="pt-2 flex justify-between font-bold text-stone-900 dark:text-stone-100">
                      <span>Total Amount:</span>
                      <span>₹{order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Order Stage Actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {order.status === 'placed' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'accepted')}
                        className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Accept Ticket</span>
                      </button>
                    )}

                    {order.status === 'accepted' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                        className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors"
                      >
                        Mark as Preparing
                      </button>
                    )}

                    {order.status === 'preparing' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'out_for_delivery')}
                        className="flex-1 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-colors"
                      >
                        Hand Over to Courier
                      </button>
                    )}

                    {order.status === 'out_for_delivery' && (
                      <div className="text-xs text-stone-400 flex items-center gap-1.5 italic">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Courier Rohan is out for delivery</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. MENU CATALOG TAB */}
      {activeTab === 'menu' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
              Menu Dishes ({myItems.length})
            </h2>
            <button
              onClick={() => setIsAddDishOpen(true)}
              className="px-4 py-2 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-orange-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Dish</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="relative w-full h-36 rounded-2xl overflow-hidden mb-3 bg-stone-100 dark:bg-stone-800">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    {item.has3DModel && (
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg bg-orange-500 text-white text-[10px] font-bold">
                        3D Ready
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                      {item.name}
                    </h4>
                    <span className="text-sm font-black text-stone-900 dark:text-stone-100">
                      ₹{item.price}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-stone-100 dark:border-stone-800 text-xs">
                  <button
                    onClick={() =>
                      updateMenuItem({ id: item.id, isAvailable: !item.isAvailable })
                    }
                    className="flex items-center gap-1.5 font-semibold text-stone-600 dark:text-stone-400"
                  >
                    {item.isAvailable ? (
                      <ToggleRight className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-stone-400" />
                    )}
                    <span>{item.isAvailable ? 'In Stock' : 'Sold Out'}</span>
                  </button>

                  <button
                    onClick={() => deleteMenuItem(item.id)}
                    className="text-stone-400 hover:text-rose-500 transition-colors p-1"
                    title="Delete dish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. SALES ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-stone-400">Total Sales Revenue</span>
                <div className="text-2xl font-black text-stone-900 dark:text-stone-100">
                  ₹{totalRevenue.toFixed(0)}
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold">
                <PackageCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-stone-400">Total Tickets Filled</span>
                <div className="text-2xl font-black text-stone-900 dark:text-stone-100">
                  {totalOrdersCount} orders
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-stone-400">Average Basket Size</span>
                <div className="text-2xl font-black text-stone-900 dark:text-stone-100">
                  ₹{avgOrderValue}
                </div>
              </div>
            </div>
          </div>

          {/* Simple Visual Sales Chart Bar */}
          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-orange-500" />
              <span>Weekly Order Velocity</span>
            </h3>

            <div className="grid grid-cols-7 gap-3 items-end h-44 pt-6 pb-2 text-center text-xs font-semibold text-stone-500">
              {[
                { day: 'Mon', count: 18, height: '40%' },
                { day: 'Tue', count: 24, height: '55%' },
                { day: 'Wed', count: 32, height: '70%' },
                { day: 'Thu', count: 29, height: '65%' },
                { day: 'Fri', count: 48, height: '95%' },
                { day: 'Sat', count: 54, height: '100%' },
                { day: 'Sun', count: 42, height: '85%' },
              ].map((b) => (
                <div key={b.day} className="flex flex-col items-center justify-end h-full gap-2">
                  <div
                    className="w-full rounded-xl bg-orange-500/80 hover:bg-orange-500 transition-all cursor-pointer relative group"
                    style={{ height: b.height }}
                  >
                    <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] bg-stone-900 text-white px-1.5 py-0.5 rounded transition-opacity whitespace-nowrap">
                      {b.count} orders
                    </span>
                  </div>
                  <span>{b.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. STORE PROFILE TAB */}
      {activeTab === 'profile' && (
        <form
          onSubmit={handleUpdateProfile}
          className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-4 max-w-xl"
        >
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
            Restaurant Profile & Timings
          </h2>

          <div>
            <label className="text-xs font-semibold text-stone-600 dark:text-stone-400 block mb-1">
              Restaurant Name
            </label>
            <input
              type="text"
              value={restName}
              onChange={(e) => setRestName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-600 dark:text-stone-400 block mb-1">
              Description / Bio
            </label>
            <textarea
              rows={3}
              value={restDesc}
              onChange={(e) => setRestDesc(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-600 dark:text-stone-400 block mb-1">
              Approximate Price for Two (₹)
            </label>
            <input
              type="number"
              value={restPriceForTwo}
              onChange={(e) => setRestPriceForTwo(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <button
            type="submit"
            className="py-2.5 px-6 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md transition-all"
          >
            Save Restaurant Changes
          </button>
        </form>
      )}

      {/* Add Dish Modal */}
      {isAddDishOpen && (
        <div
          onClick={() => setIsAddDishOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-2xl space-y-4"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">Add New Dish</h3>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsAddDishOpen(false);
                }}
                aria-label="Close dialog"
                className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center text-stone-600 dark:text-stone-300 cursor-pointer pointer-events-auto transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDish} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Dish Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smoky Truffle Burger"
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Flavor notes, sauce, bun..."
                  value={dishDesc}
                  onChange={(e) => setDishDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={dishPrice}
                    onChange={(e) => setDishPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Category</label>
                  <select
                    value={dishCategory}
                    onChange={(e) => setDishCategory(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                  >
                    <option value="Burgers">Burgers</option>
                    <option value="Pizza">Pizza</option>
                    <option value="Ramen">Ramen</option>
                    <option value="Tacos">Tacos</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Beverages">Beverages</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">3D Procedural Model</label>
                  <select
                    value={dishModelType}
                    onChange={(e) => setDishModelType(e.target.value as ModelType)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                  >
                    <option value="burger">Burger</option>
                    <option value="pizza">Pizza</option>
                    <option value="donut">Donut</option>
                    <option value="noodles">Ramen / Noodles</option>
                    <option value="taco">Taco</option>
                    <option value="drink">Drink</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Dietary Type</label>
                  <div className="flex gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setDishIsVeg(true)}
                      className={`flex-1 py-1.5 rounded-lg font-bold ${
                        dishIsVeg ? 'bg-emerald-500 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-600'
                      }`}
                    >
                      Veg
                    </button>
                    <button
                      type="button"
                      onClick={() => setDishIsVeg(false)}
                      className={`flex-1 py-1.5 rounded-lg font-bold ${
                        !dishIsVeg ? 'bg-rose-500 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-600'
                      }`}
                    >
                      Non-Veg
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold"
              >
                Add Dish to Menu
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
