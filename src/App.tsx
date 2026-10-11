import React, { useState, useEffect, useRef } from 'react';
import { AppProvider, useAppStore, NotificationItem } from './store/useAppStore';
import { Navbar } from './components/common/Navbar';
import { HomePage } from './pages/HomePage';
import { RestaurantDetailPage } from './pages/RestaurantDetailPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { OwnerDashboard } from './pages/OwnerDashboard';
import { DeliveryDashboard } from './pages/DeliveryDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { CartDrawer } from './components/cart/CartDrawer';
import { CheckoutModal } from './components/checkout/CheckoutModal';
import { AddressBookModal } from './components/checkout/AddressBookModal';
import { AuthModal } from './components/auth/AuthModal';
import { ProfileEditorModal } from './components/auth/ProfileEditorModal';
import { DishCustomizationModal } from './components/food/DishCustomizationModal';
import { ModelViewerModal } from './three/ModelViewerModal';
import { SupportChatWidget } from './components/chat/SupportChatWidget';
import { MobileBottomBar } from './components/common/MobileBottomBar';
import { Address } from './types';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface ToastNotificationItemProps {
  notification: NotificationItem;
  onDismiss: (id: string) => void;
}

function ToastNotificationItem({ notification, onDismiss }: ToastNotificationItemProps) {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(10);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  useEffect(() => {
    if (isHovered) return;

    if (secondsRemaining <= 0) {
      onDismiss(notification.id);
      return;
    }

    const timer = setTimeout(() => {
      setSecondsRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsRemaining, isHovered, notification.id, onDismiss]);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`pointer-events-auto relative overflow-hidden p-4 rounded-2xl shadow-xl flex items-start gap-3 border animate-in slide-in-from-right text-xs transition-all ${
        notification.type === 'success'
          ? 'bg-emerald-600 text-white border-emerald-700'
          : notification.type === 'warning'
          ? 'bg-amber-600 text-white border-amber-700'
          : 'bg-stone-900 text-white border-stone-800'
      }`}
    >
      {notification.type === 'success' ? (
        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-200" />
      ) : notification.type === 'warning' ? (
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-200" />
      ) : (
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-stone-300" />
      )}
      <div className="flex-1 pr-1">
        <div className="flex items-center justify-between gap-2">
          <div className="font-bold">{notification.title}</div>
          <span
            className="text-[10px] font-mono opacity-80 px-1.5 py-0.5 rounded bg-black/25 select-none shrink-0"
            title={isHovered ? 'Paused while hovering' : `Closes in ${secondsRemaining}s`}
          >
            {isHovered ? 'paused' : `${secondsRemaining}s`}
          </span>
        </div>
        <div className="text-white/85 mt-0.5 leading-relaxed">{notification.message}</div>
      </div>
      <button
        onClick={() => onDismiss(notification.id)}
        className="text-white/60 hover:text-white text-xs font-bold p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0"
        title="Close now"
        aria-label="Close notification"
      >
        ✕
      </button>

      {/* 10-second visual countdown progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30 overflow-hidden">
        <div
          className="h-full bg-white/50 transition-all duration-1000 ease-linear"
          style={{ width: `${(secondsRemaining / 10) * 100}%` }}
        />
      </div>
    </div>
  );
}

function AppContent() {
  const {
    inspecting3DItem,
    close3DViewer,
    notifications,
    dismissNotification,
    setActiveTrackingOrder,
    customizingItem,
    closeCustomizationModal,
    currentUser,
    addNotification,
  } = useAppStore();

  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('');
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isAddressBookOpen, setIsAddressBookOpen] = useState<boolean>(false);
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState<boolean>(false);
  const [isOrderVideoPlaying, setIsOrderVideoPlaying] = useState(false);

  const prevUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (currentUser.isGuest) {
      prevUserIdRef.current = null;
      // If a guest lands on a private role dashboard, redirect to home
      if (['admin_dashboard', 'owner_dashboard', 'delivery_dashboard', 'customer_dashboard', 'order_history'].includes(currentTab)) {
        setCurrentTab('home');
      }
      return;
    }
    // Only redirect non-customer portal roles upon initial authentication
    if (prevUserIdRef.current !== currentUser.id) {
      prevUserIdRef.current = currentUser.id;
      if (currentUser.role === 'restaurant_owner') setCurrentTab('owner_dashboard');
      else if (currentUser.role === 'delivery_partner') setCurrentTab('delivery_dashboard');
      else if (currentUser.role === 'admin') setCurrentTab('admin_dashboard');
      else {
        // Customer: if currently on an administrative/owner portal they don't have access to, return to home
        if (['admin_dashboard', 'owner_dashboard', 'delivery_dashboard'].includes(currentTab)) {
          setCurrentTab('home');
        }
      }
    } else {
      const roleRestrictedTabs: Record<string, string> = {
        admin_dashboard: 'admin',
        owner_dashboard: 'restaurant_owner',
        delivery_dashboard: 'delivery_partner',
      };
      if (roleRestrictedTabs[currentTab] && roleRestrictedTabs[currentTab] !== currentUser.role) {
        setCurrentTab('home');
      }
    }
  }, [currentUser.id, currentUser.isGuest, currentUser.role, currentTab]);
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('foodverse-intro-played') !== 'true';
    } catch {
      return true;
    }
  });

  const finishIntro = () => {
    try {
      sessionStorage.setItem('foodverse-intro-played', 'true');
    } catch {
      // The intro should still finish if browser storage is unavailable.
    }
    setShowIntro(false);
  };

  const handleSelectRestaurant = (id: string) => {
    setSelectedRestaurantId(id);
    setCurrentTab('restaurant_detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (tab: string) => {
    const dashboardRoles: Record<string, string> = {
      customer_dashboard: 'customer',
      order_history: 'customer',
      owner_dashboard: 'restaurant_owner',
      delivery_dashboard: 'delivery_partner',
      admin_dashboard: 'admin',
    };
    if (dashboardRoles[tab] && dashboardRoles[tab] !== currentUser.role) return;
    if (tab.startsWith('restaurant_')) {
      const restId = tab.replace('restaurant_', '');
      handleSelectRestaurant(restId);
    } else {
      setCurrentTab(tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderCompleted = (_orderId: string) => {
    setIsCheckoutOpen(false);
    setIsOrderVideoPlaying(true);
  };

  return (
    showIntro ? (
      <div className="fixed inset-0 z-[100] bg-black" role="status" aria-label="Opening FoodVerse">
        <video
          className="h-full w-full object-cover"
          src="/I_want_to_generate_exact_same.mp4"
          autoPlay
          muted
          playsInline
          onEnded={finishIntro}
          onError={finishIntro}
        />
        <button
          type="button"
          onClick={finishIntro}
          className="absolute bottom-6 right-6 rounded-full bg-black/55 px-4 py-2 text-sm font-medium text-white backdrop-blur hover:bg-black/75"
        >
          Skip intro
        </button>
      </div>
    ) :
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col font-sans transition-colors duration-200">
      {/* Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={handleTabChange}
        openCartDrawer={() => setIsCartOpen(true)}
        openAddressBook={() => setIsAddressBookOpen(true)}
        openProfileEditor={() => setIsProfileEditorOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 md:pb-12">
        {(() => {
          if (currentTab === 'restaurant_detail' || currentTab.startsWith('restaurant_')) {
            return (
              <RestaurantDetailPage
                restaurantId={selectedRestaurantId || 'rest_1'}
                onBack={() => setCurrentTab('home')}
              />
            );
          }

          if (currentTab === 'tracking') {
            return <OrderTrackingPage onBackToHome={() => setCurrentTab('home')} />;
          }

          if (currentTab === 'owner_dashboard' && currentUser.role === 'restaurant_owner') {
            return <OwnerDashboard />;
          }

          if (currentTab === 'delivery_dashboard' && currentUser.role === 'delivery_partner') {
            return <DeliveryDashboard />;
          }

          if (currentTab === 'admin_dashboard' && currentUser.role === 'admin') {
            return <AdminDashboard />;
          }

          if ((currentTab === 'customer_dashboard' || currentTab === 'order_history') && !currentUser.isGuest) {
            return (
              <CustomerDashboard
                onSelectRestaurant={handleSelectRestaurant}
                onOpenCart={() => setIsCartOpen(true)}
                onTrackOrder={(order) => {
                  setActiveTrackingOrder(order);
                  setCurrentTab('tracking');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onExploreDishes={() => {
                  setCurrentTab('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenProfileEditor={() => setIsProfileEditorOpen(true)}
              />
            );
          }

          // Fallback / Home: always renders HomePage so neither guest nor customer ever encounters a blank white screen!
          return (
            <HomePage
              onSelectRestaurant={handleSelectRestaurant}
              onExploreDishes={() => setCurrentTab('home')}
              onViewFavorites={() => {
                if (currentUser.isGuest) {
                  addNotification('Sign in required', 'Please sign in to view your favorite restaurants and orders.', 'info');
                } else {
                  setCurrentTab('customer_dashboard');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
            />
          );
        })()}
      </main>

      {/* Toast Notification Container (offset above chat widget) */}
      <div className="fixed bottom-24 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {notifications.map((n) => (
          <ToastNotificationItem
            key={n.id}
            notification={n}
            onDismiss={dismissNotification}
          />
        ))}
      </div>

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={handleProceedToCheckout}
      />

      {/* Full-Featured Checkout Modal (Razorpay, UPI, COD, Scheduling, Instructions) */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={handleOrderCompleted}
      />

      {isOrderVideoPlaying && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Order placed"
        >
          <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-md" />
          <div className="relative z-10 flex w-full max-w-4xl flex-col items-center gap-4">
            <p className="text-center text-lg font-bold text-white drop-shadow sm:text-xl">
              Order placed! Your delivery is on its way.
            </p>
            <video
              className="max-h-[75vh] w-full rounded-2xl object-contain shadow-2xl"
              src="/assets/delivery-order-celebration.mp4"
              autoPlay
              muted
              playsInline
              onEnded={() => setIsOrderVideoPlaying(false)}
              onError={() => setIsOrderVideoPlaying(false)}
            />
            <button
              type="button"
              onClick={() => setIsOrderVideoPlaying(false)}
              className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/25"
            >
              Close video
            </button>
          </div>
        </div>
      )}

      {/* Address Book Modal */}
      <AddressBookModal
        isOpen={isAddressBookOpen}
        onClose={() => setIsAddressBookOpen(false)}
      />

      {/* Authentication Modal (Sign In, Sign Up, Phone OTP, Forgot Password) */}
      <AuthModal />
      <ProfileEditorModal isOpen={isProfileEditorOpen} onClose={() => setIsProfileEditorOpen(false)} />

      {/* Dish Customization Modal (Portions, Add-ons, Spice, Dietary Exclusions) */}
      <DishCustomizationModal
        item={customizingItem}
        onClose={closeCustomizationModal}
      />

      {/* High-Resolution Dish Photo Inspector Modal (Authentic photography, no 3D) */}
      <ModelViewerModal item={inspecting3DItem} onClose={close3DViewer} />

      {/* Real-time Simulated Support Chat Widget */}
      <SupportChatWidget
        onOpenCart={() => setIsCartOpen(true)}
        onNavigateToTracking={() => setCurrentTab('tracking')}
      />

      {/* Global Footer */}
      <footer className="mt-auto border-t border-stone-200 dark:border-stone-800/80 bg-white/70 dark:bg-stone-900/70 backdrop-blur-md py-10 text-xs text-stone-500 dark:text-stone-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/images/foodverse-logo.png"
              alt="FoodVerse — Discover & Deliver"
              className="h-12 w-auto max-w-[190px] object-contain"
            />
            <span>• Next-Gen Food Discovery & Gourmet Delivery Engine</span>
          </div>

          {/* Quick role shortcuts */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => setCurrentTab('home')}
              className={`hover:text-orange-500 transition-colors ${
                currentTab === 'home' ? 'text-orange-500 font-bold' : ''
              }`}
            >
              Customer Feed
            </button>
            {currentUser.role === 'customer' && <button
              onClick={() => setCurrentTab('customer_dashboard')}
              className={`hover:text-orange-500 transition-colors ${
                currentTab === 'customer_dashboard' ? 'text-orange-500 font-bold' : ''
              }`}
            >
              My Orders & Savings
            </button>}
            {currentUser.role === 'restaurant_owner' && <button
              onClick={() => setCurrentTab('owner_dashboard')}
              className={`hover:text-orange-500 transition-colors ${
                currentTab === 'owner_dashboard' ? 'text-orange-500 font-bold' : ''
              }`}
            >
              Restaurant Portal
            </button>}
            {currentUser.role === 'delivery_partner' && <button
              onClick={() => setCurrentTab('delivery_dashboard')}
              className={`hover:text-orange-500 transition-colors ${
                currentTab === 'delivery_dashboard' ? 'text-orange-500 font-bold' : ''
              }`}
            >
              Courier Tracking
            </button>}
            {currentUser.role === 'admin' && <button
              onClick={() => setCurrentTab('admin_dashboard')}
              className={`hover:text-orange-500 transition-colors ${
                currentTab === 'admin_dashboard' ? 'text-orange-500 font-bold' : ''
              }`}
            >
              Admin Governance
            </button>}
          </div>

          <div className="text-[11px] text-stone-400">
            Leaflet OpenStreetMap • Razorpay Sandbox • High-Definition Food Photography
          </div>
        </div>
      </footer>

      {/* Mobile & Tablet Bottom Navigation Dock */}
      <MobileBottomBar
        currentTab={currentTab}
        setCurrentTab={handleTabChange}
        openCartDrawer={() => setIsCartOpen(true)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
