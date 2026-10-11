import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { UserRole } from '../../types';
import { SearchAutocomplete } from '../search/SearchAutocomplete';
import {
  MapPin,
  ShoppingBag,
  Moon,
  Sun,
  ShieldAlert,
  Store,
  Bike,
  User as UserIcon,
  ChevronDown,
  Navigation,
  Coins,
  ReceiptText,
  Heart,
  LogIn,
  LogOut,
  MapPinned,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openCartDrawer: () => void;
  openAddressBook?: () => void;
  openProfileEditor?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  openCartDrawer,
  openAddressBook,
  openProfileEditor,
}) => {
  const {
    currentUser,
    cart,
    selectedCity,
    setSelectedCity,
    darkMode,
    toggleDarkMode,
    activeTrackingOrder,
    openAuthModal,
    logout,
  } = useAppStore();

  const [isCityMenuOpen, setIsCityMenuOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const cities = ['Islampur', 'Sangli', 'Walwa', 'Kolhapur', 'Karad'];

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'restaurant_owner':
        return <Store className="w-3.5 h-3.5 text-amber-500" />;
      case 'delivery_partner':
        return <Bike className="w-3.5 h-3.5 text-rose-500" />;
      case 'admin':
        return <ShieldAlert className="w-3.5 h-3.5 text-purple-500" />;
      default:
        return <UserIcon className="w-3.5 h-3.5 text-emerald-500" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-16 sm:h-20 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 py-2 sm:py-0">
        {/* Logo & City Selector */}
        <div className="flex items-center gap-2 sm:gap-6 shrink-0">
          <button
            onClick={() => setCurrentTab('home')}
            className="flex items-center gap-2 sm:gap-2.5 group text-left"
          >
            <img
              src="/images/foodverse-logo.png"
              alt="FoodVerse — Discover & Deliver"
              className="h-11 sm:h-14 w-auto max-w-[180px] sm:max-w-[220px] object-contain shrink-0 group-hover:scale-[1.02] transition-transform"
            />
          </button>

          {/* Location Dropdown */}
          <div className="relative hidden lg:block">
            <button
              onClick={() => setIsCityMenuOpen(!isCityMenuOpen)}
              className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800/60 hover:bg-stone-200/70 text-xs font-semibold text-stone-700 dark:text-stone-300 transition-colors"
              title="Select Delivery City"
            >
              <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
              <span className="max-w-[70px] sm:max-w-none truncate">{selectedCity}</span>
              <ChevronDown className="w-3 h-3 text-stone-400 shrink-0" />
            </button>

            {isCityMenuOpen && (
              <div className="absolute top-full mt-2 left-0 w-44 bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 py-1.5 z-50 animate-in fade-in">
                {cities.map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      setSelectedCity(city);
                      setIsCityMenuOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-medium transition-colors flex items-center justify-between ${
                      selectedCity === city
                        ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 font-bold'
                        : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                    }`}
                  >
                    <span>{city}</span>
                    {selectedCity === city && <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Global Fuzzy Search Bar with Web Speech API & Autocomplete */}
        <div className="flex-1 max-w-md hidden lg:block">
          <SearchAutocomplete
            onSelectRestaurant={(id) => {
              setCurrentTab(`restaurant_${id}`);
            }}
          />
        </div>

        {/* Right Action Icons & Role Switcher */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Mobile Search Toggle Button */}
          <button
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className="lg:hidden w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 flex items-center justify-center text-stone-600 dark:text-stone-300 transition-colors"
            aria-label="Toggle search"
          >
            <span className="text-sm">🔍</span>
          </button>

          {/* Role Switcher Pill */}
          <div className="relative hidden lg:block">
            <button
              onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors border border-stone-200/60 dark:border-stone-700 text-xs font-semibold text-stone-800 dark:text-stone-200"
            >
              {getRoleIcon(currentUser.role)}
              <span className="capitalize">{currentUser.role.replace('_', ' ')}</span>
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>

            {isRoleMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 py-2 z-50 animate-in fade-in">
                <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-extrabold text-stone-400 border-b border-stone-100 dark:border-stone-800 mb-1">
                  Your Account Role
                </div>
                {[
                  { role: 'customer' as UserRole, label: 'Customer', desc: 'Browse, order, review' },
                  { role: 'restaurant_owner' as UserRole, label: 'Restaurant Owner', desc: 'Manage menu & orders' },
                  { role: 'delivery_partner' as UserRole, label: 'Delivery Partner', desc: 'Accept & deliver' },
                  { role: 'admin' as UserRole, label: 'Platform Admin', desc: 'Approve & manage' },
                ].filter(({ role }) => role === currentUser.role).map(({ role, label, desc }) => (
                  <button
                    key={role}
                    onClick={() => {
                      setIsRoleMenuOpen(false);
                      if (role === 'restaurant_owner') setCurrentTab('owner_dashboard');
                      else if (role === 'delivery_partner') setCurrentTab('delivery_dashboard');
                      else if (role === 'admin') setCurrentTab('admin_dashboard');
                      else setCurrentTab('home');
                    }}
                    className={`w-full text-left px-3.5 py-2 transition-colors flex items-start gap-2.5 ${
                      currentUser.role === role
                        ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600'
                        : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                    }`}
                  >
                    <div className="mt-0.5">{getRoleIcon(role)}</div>
                    <div>
                      <div className="text-xs font-bold">{label}</div>
                      <div className="text-[10px] text-stone-400">{desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Customer Favorites & Orders Links (Desktop) */}
          {currentUser.role === 'customer' && (
            <div className="hidden lg:flex items-center gap-2">
              <button
                onClick={() => setCurrentTab('customer_dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold transition-all border ${
                  currentTab === 'customer_dashboard'
                    ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200/60 dark:border-stone-700 hover:border-rose-400 hover:text-rose-500'
                }`}
                title="View your bookmarked favorite restaurants"
              >
                <Heart className={`w-3.5 h-3.5 ${currentUser.favorites.length > 0 ? 'fill-current text-rose-500' : ''}`} />
                <span>Favorites</span>
                {currentUser.favorites.length > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    currentTab === 'customer_dashboard'
                      ? 'bg-white text-rose-600'
                      : 'bg-rose-500 text-white'
                  }`}>
                    {currentUser.favorites.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setCurrentTab('customer_dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold transition-all border ${
                  currentTab === 'customer_dashboard'
                    ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200/60 dark:border-stone-700 hover:border-orange-400'
                }`}
                title="View past orders & invoices"
              >
                <ReceiptText className="w-3.5 h-3.5" />
                <span>Orders</span>
              </button>
            </div>
          )}

          {/* Loyalty Points Pill */}
          {currentUser.role === 'customer' && (
            <button
              onClick={() => setCurrentTab('customer_dashboard')}
              title={`FoodVerse Points: ${currentUser.loyaltyPoints ?? 250} pts (1 pt = ₹1 off).`}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-amber-700 dark:text-amber-400 text-xs font-bold transition-colors cursor-pointer"
            >
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              <span>{currentUser.loyaltyPoints ?? 250} pts</span>
            </button>
          )}

          {/* User Account / Auth Dropdown */}
          <div className="relative">
            {currentUser.isGuest ? (
              <button
                onClick={() => openAuthModal('login')}
                className="flex items-center justify-center gap-1.5 w-9 h-9 sm:w-auto sm:h-auto px-0 sm:px-3 sm:py-1.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all active:scale-95"
                aria-label="Sign in"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            ) : (
              <div>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 pl-2 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:border-orange-400 transition-colors"
                >
                  <span className="text-xs font-bold text-stone-800 dark:text-stone-200 max-w-[90px] truncate hidden sm:inline">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-xl object-cover"
                  />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 py-2 z-50 animate-in fade-in">
                    <div className="px-3 py-2 border-b border-stone-100 dark:border-stone-800">
                      <div className="text-xs font-black text-stone-900 dark:text-stone-100">
                        {currentUser.name}
                      </div>
                      <div className="text-[10px] text-stone-400 truncate">{currentUser.email}</div>
                    </div>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        openProfileEditor?.();
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 flex items-center gap-2"
                    >
                      <UserIcon className="w-4 h-4 text-orange-500" />
                      <span>Edit Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        if (openAddressBook) openAddressBook();
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 flex items-center gap-2"
                    >
                      <MapPinned className="w-4 h-4 text-orange-500" />
                      <span>Saved Addresses ({currentUser.addresses.length})</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setCurrentTab('customer_dashboard');
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 flex items-center gap-2"
                    >
                      <ReceiptText className="w-4 h-4 text-orange-500" />
                      <span>Order History & Invoices</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                        setCurrentTab('home');
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center gap-2 border-t border-stone-100 dark:border-stone-800 mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center text-stone-600 dark:text-stone-300 transition-colors shrink-0"
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Cart Bag Button */}
          <button
            onClick={openCartDrawer}
            className="relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/25 transition-all active:scale-95 shrink-0"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Bag</span>
            {cartItemCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-white text-orange-600 flex items-center justify-center text-[10px] font-black">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>

        <div className="relative w-full lg:hidden">
          <button
            onClick={() => setIsCityMenuOpen(!isCityMenuOpen)}
            className="flex items-center gap-1.5 rounded-lg bg-stone-100 dark:bg-stone-800/60 px-2.5 py-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300"
            title="Select Delivery City"
          >
            <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
            <span className="truncate">Delivering to {selectedCity}</span>
            <ChevronDown className="w-3 h-3 text-stone-400 shrink-0" />
          </button>

          {isCityMenuOpen && (
            <div className="absolute top-full mt-2 left-0 w-44 bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 py-1.5 z-50 animate-in fade-in">
              {cities.map((city) => (
                <button
                  key={city}
                  onClick={() => {
                    setSelectedCity(city);
                    setIsCityMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs font-medium transition-colors flex items-center justify-between ${
                    selectedCity === city
                      ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 font-bold'
                      : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                  }`}
                >
                  <span>{city}</span>
                  {selectedCity === city && <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Expandable Mobile Search Bar with Voice */}
      {isMobileSearchOpen && (
        <div className="lg:hidden px-4 pb-3 pt-1 border-t border-stone-100 dark:border-stone-800/60 bg-stone-50/95 dark:bg-stone-900/95 animate-in slide-in-from-top duration-200">
          <SearchAutocomplete
            isMobile
            onSelectRestaurant={(id) => {
              setCurrentTab(`restaurant_${id}`);
              setIsMobileSearchOpen(false);
            }}
          />
        </div>
      )}
    </header>
  );
};
