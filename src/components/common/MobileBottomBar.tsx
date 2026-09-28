import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { UserRole } from '../../types';
import {
  Compass,
  Heart,
  ReceiptText,
  ShoppingBag,
  UserCheck,
  Search,
  X,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Bike,
  Store,
  User,
} from 'lucide-react';

interface MobileBottomBarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openCartDrawer: () => void;
  onOpenSearch?: () => void;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  currentTab,
  setCurrentTab,
  openCartDrawer,
  onOpenSearch,
}) => {
  const { currentUser, switchRole, cart } = useAppStore();
  const [isRoleSheetOpen, setIsRoleSheetOpen] = useState(false);

  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const roleOptions: { role: UserRole; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      role: 'customer',
      label: 'Customer Mode',
      desc: 'Browse food, order, track loyalty',
      icon: <User className="w-4 h-4 text-orange-500" />,
    },
    {
      role: 'restaurant_owner',
      label: 'Restaurant Owner',
      desc: 'Manage kitchen, menus & live orders',
      icon: <Store className="w-4 h-4 text-amber-500" />,
    },
    {
      role: 'delivery_partner',
      label: 'Delivery Partner',
      desc: 'Accept orders & navigate routes',
      icon: <Bike className="w-4 h-4 text-blue-500" />,
    },
    {
      role: 'admin',
      label: 'Platform Admin',
      desc: 'Audit restaurants & metrics',
      icon: <ShieldCheck className="w-4 h-4 text-purple-500" />,
    },
  ];

  const handleRoleSelect = (role: UserRole) => {
    setIsRoleSheetOpen(false);
    if (role !== currentUser.role) return;
    if (role === 'restaurant_owner') setCurrentTab('owner_dashboard');
    else if (role === 'delivery_partner') setCurrentTab('delivery_dashboard');
    else if (role === 'admin') setCurrentTab('admin_dashboard');
    else setCurrentTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Mobile Navigation Dock - only visible below md: breakpoint */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-lg border-t border-stone-200/80 dark:border-stone-800 shadow-2xl px-2 py-1.5 transition-colors"
      >
        <div className="max-w-md mx-auto grid grid-cols-5 items-center">
          {/* 1. Explore / Home */}
          <button
            onClick={() => {
              setCurrentTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-colors ${
              currentTab === 'home'
                ? 'text-orange-600 dark:text-orange-400 font-bold'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Compass className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Explore</span>
          </button>

          {/* 2. Favorites */}
          <button
            onClick={() => {
              setCurrentTab('customer_dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`relative flex flex-col items-center justify-center py-1 rounded-xl transition-colors ${
              currentTab === 'customer_dashboard'
                ? 'text-rose-600 dark:text-rose-400 font-bold'
                : 'text-stone-500 dark:text-stone-400 hover:text-rose-500'
            }`}
          >
            <Heart
              className={`w-5 h-5 mb-0.5 ${
                currentUser.favorites.length > 0 ? 'fill-rose-500/20 text-rose-500' : ''
              }`}
            />
            <span className="text-[10px]">Favorites</span>
            {currentUser.favorites.length > 0 && (
              <span className="absolute top-0 right-3.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center shadow-sm">
                {currentUser.favorites.length}
              </span>
            )}
          </button>

          {/* 3. Bag / Cart (Center Highlight) */}
          <button
            onClick={openCartDrawer}
            className="flex flex-col items-center justify-center py-1 transition-transform active:scale-95 text-stone-700 dark:text-stone-300 hover:text-orange-500"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/30">
                <ShoppingBag className="w-4 h-4" />
              </div>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-black flex items-center justify-center shadow-sm">
                  {cartItemCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 mt-0.5">
              Bag
            </span>
          </button>

          {/* 4. Orders */}
          <button
            onClick={() => {
              setCurrentTab('customer_dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-colors ${
              currentTab === 'customer_dashboard' || currentTab === 'tracking'
                ? 'text-orange-600 dark:text-orange-400 font-bold'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <ReceiptText className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Orders</span>
          </button>

          {/* 5. Role Switcher / Profile */}
          <button
            onClick={() => setIsRoleSheetOpen(true)}
            className="flex flex-col items-center justify-center py-1 rounded-xl text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
          >
            <UserCheck className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] capitalize truncate max-w-[54px]">
              {currentUser.role === 'restaurant_owner'
                ? 'Owner'
                : currentUser.role === 'delivery_partner'
                ? 'Courier'
                : currentUser.role === 'admin'
                ? 'Admin'
                : 'Profile'}
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile Role Switcher Sheet Modal */}
      {isRoleSheetOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end animate-in fade-in"
          onClick={() => setIsRoleSheetOpen(false)}
        >
          <div
            className="w-full bg-white dark:bg-stone-900 rounded-t-3xl p-6 border-t border-stone-200 dark:border-stone-800 shadow-2xl animate-in slide-in-from-bottom duration-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  Your Account Dashboard
                  </h3>
                  <p className="text-xs text-stone-400">
                    Access the dashboard assigned to your account
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsRoleSheetOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 flex items-center justify-center hover:bg-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {roleOptions.filter((opt) => opt.role === currentUser.role).map((opt) => {
                const isActive = currentUser.role === opt.role;
                return (
                  <button
                    key={opt.role}
                    onClick={() => handleRoleSelect(opt.role)}
                    className={`w-full p-3.5 rounded-2xl flex items-center justify-between text-left transition-all border ${
                      isActive
                        ? 'bg-orange-50 dark:bg-orange-950/40 border-orange-500 text-stone-900 dark:text-stone-100 shadow-sm'
                        : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200/60 dark:border-stone-700/60 text-stone-700 dark:text-stone-300 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white dark:bg-stone-800 flex items-center justify-center shadow-sm">
                        {opt.icon}
                      </div>
                      <div>
                        <div className="text-xs font-bold">{opt.label}</div>
                        <div className="text-[11px] text-stone-400">{opt.desc}</div>
                      </div>
                    </div>
                    {isActive ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-500 ring-4 ring-orange-500/20" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-stone-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
