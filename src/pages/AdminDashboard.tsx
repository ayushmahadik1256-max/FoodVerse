import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { getPlatformUsers, PlatformUser, setPlatformUserRole } from '../services/accountApi';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Tag,
  Users,
  Percent,
  Plus,
  Trash2,
  Building,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    restaurants,
    approveRestaurant,
    coupons,
    addCoupon,
    deleteCoupon,
    orders,
    addNotification,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'restaurants' | 'coupons' | 'users'>('restaurants');
  const [platformUsers, setPlatformUsers] = useState<PlatformUser[]>([]);
  const [usersError, setUsersError] = useState('');

  useEffect(() => {
    if (activeTab !== 'users') return;
    getPlatformUsers().then(setPlatformUsers).catch((error) => setUsersError(error instanceof Error ? error.message : 'Could not load accounts.'));
  }, [activeTab]);

  const changeRole = async (uid: string, role: Exclude<PlatformUser['role'], 'admin'>) => {
    try {
      await setPlatformUserRole(uid, role);
      setPlatformUsers((users) => users.map((user) => user.id === uid ? { ...user, role } : user));
    } catch (error) {
      setUsersError(error instanceof Error ? error.message : 'Could not update account role.');
    }
  };

  // New Coupon Form State
  const [newCode, setNewCode] = useState('');
  const [newDiscount, setNewDiscount] = useState(20);
  const [newMinOrder, setNewMinOrder] = useState(299);
  const [newMaxDiscount, setNewMaxDiscount] = useState(100);

  // Platform commission: 15% of all orders
  const grossGMV = orders.reduce((acc, o) => acc + o.totalAmount, 0);
  const platformRevenue = grossGMV * 0.15;

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;

    addCoupon({
      code: newCode.toUpperCase().trim(),
      discountPercentage: Number(newDiscount),
      minOrder: Number(newMinOrder),
      maxDiscount: Number(newMaxDiscount),
      description: `${newDiscount}% off on orders above ₹${newMinOrder}`,
      expiryDate: '2026-12-31',
    });

    setNewCode('');
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Admin Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200/80 dark:border-stone-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-stone-900 dark:text-stone-100">
                FoodVerse Master Admin
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold">
                Platform Authority
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Operations, Approvals & Financial Governance
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 p-1.5 rounded-2xl">
          {[
            { id: 'restaurants', label: 'Restaurants', count: restaurants.length },
            { id: 'coupons', label: 'Coupons & Promos', count: coupons.length },
            { id: 'users', label: 'Platform Users' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-stone-900 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 font-extrabold">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Platform Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-stone-400">Gross Food GMV</span>
            <div className="text-2xl font-black text-stone-900 dark:text-stone-100">
              ₹{grossGMV.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-stone-400">Commission Take Rate (15%)</span>
            <div className="text-2xl font-black text-stone-900 dark:text-stone-100">
              ₹{platformRevenue.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-stone-400">Partner Fleet</span>
            <div className="text-2xl font-black text-stone-900 dark:text-stone-100">
              42 Active Couriers
            </div>
          </div>
        </div>
      </div>

      {/* 1. RESTAURANTS APPROVAL TAB */}
      {activeTab === 'restaurants' && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
            Kitchen Registrations & Verification
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-stone-100 dark:border-stone-800 text-stone-400">
                <tr>
                  <th className="pb-3 font-semibold">Restaurant</th>
                  <th className="pb-3 font-semibold">City</th>
                  <th className="pb-3 font-semibold">Rating</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {restaurants.map((r) => (
                  <tr key={r.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/40">
                    <td className="py-3.5 flex items-center gap-3">
                      <img src={r.image} alt={r.name} className="w-10 h-10 rounded-xl object-cover" />
                      <div>
                        <div className="font-bold text-stone-900 dark:text-stone-100">{r.name}</div>
                        <div className="text-stone-400 text-[11px]">{r.cuisines.join(', ')}</div>
                      </div>
                    </td>
                    <td className="py-3.5 font-medium">{r.location.city}</td>
                    <td className="py-3.5 font-bold text-amber-500">{r.rating}★</td>
                    <td className="py-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          r.isApproved
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : 'bg-amber-500/10 text-amber-600'
                        }`}
                      >
                        {r.isApproved ? 'Approved' : 'Pending Verification'}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      {r.isApproved ? (
                        <button
                          onClick={() => approveRestaurant(r.id, false)}
                          className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 font-bold"
                        >
                          Revoke
                        </button>
                      ) : (
                        <button
                          onClick={() => approveRestaurant(r.id, true)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                        >
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. COUPONS TAB */}
      {activeTab === 'coupons' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Plus className="w-4 h-4 text-purple-600" />
              <span>Issue New Coupon</span>
            </h3>

            <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FESTIVE30"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full px-3.5 py-2 uppercase font-mono rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Discount (%)</label>
                <input
                  type="number"
                  required
                  min={5}
                  max={90}
                  value={newDiscount}
                  onChange={(e) => setNewDiscount(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Min Basket (₹)</label>
                  <input
                    type="number"
                    value={newMinOrder}
                    onChange={(e) => setNewMinOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Max Cap (₹)</label>
                  <input
                    type="number"
                    value={newMaxDiscount}
                    onChange={(e) => setNewMaxDiscount(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-3 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold"
              >
                Create Coupon
              </button>
            </form>
          </div>

          <div className="lg:col-span-8 bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Tag className="w-4 h-4 text-purple-600" />
              <span>Active Platform Promotional Campaigns</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {coupons.map((c) => (
                <div
                  key={c.code}
                  className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-700/80 flex items-center justify-between"
                >
                  <div>
                    <div className="font-mono text-sm font-black text-purple-600 dark:text-purple-400">
                      {c.code}
                    </div>
                    <div className="text-xs text-stone-600 dark:text-stone-300 mt-0.5">
                      {c.discountPercentage}% OFF (Min ₹{c.minOrder}, Max ₹{c.maxDiscount})
                    </div>
                  </div>

                  <button
                    onClick={() => deleteCoupon(c.code)}
                    className="text-stone-400 hover:text-rose-500 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. USERS TAB */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            <span>Platform User Directory</span>
          </h2>

          <div className="space-y-3">
            {usersError && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">{usersError}</p>}
            {platformUsers.map((u) => (
              <div
                key={u.id}
                className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-stone-900 dark:text-stone-100">{u.name}</div>
                  <div className="text-stone-400 text-[11px]">{u.email}</div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 text-[10px] font-bold">
                    {u.role.replace('_', ' ')}
                  </span>
                  {u.role !== 'admin' && (
                    <select
                      value={u.role}
                      onChange={(event) => changeRole(u.id, event.target.value as Exclude<PlatformUser['role'], 'admin'>)}
                      aria-label={`Change role for ${u.name}`}
                      className="rounded-lg border border-stone-200 bg-white px-2 py-1 text-[10px] capitalize dark:border-stone-700 dark:bg-stone-900"
                    >
                      <option value="customer">Customer</option>
                      <option value="restaurant_owner">Restaurant Owner</option>
                      <option value="delivery_partner">Delivery Partner</option>
                    </select>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
