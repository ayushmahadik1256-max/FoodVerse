import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  User,
  UserRole,
  Restaurant,
  MenuItem,
  OrderItem,
  Order,
  OrderStatus,
  Coupon,
  FilterState,
  Address,
  ItemCustomization,
  Review,
} from '../types';
import {
  MOCK_USERS,
  MOCK_RESTAURANTS,
  MOCK_MENU_ITEMS,
  MOCK_COUPONS,
  MOCK_ORDERS,
  MOCK_REVIEWS,
} from '../data/mockData';
import { onAuthStateChanged } from 'firebase/auth';
import { createAccount, confirmPhoneCode, firebaseAuth, requestPasswordReset, requestPhoneCode, signIn, signOutFirebase } from '../services/firebaseAuth';
import {
  loadAccountProfile,
  saveAccountProfile,
  fetchRestaurants,
  fetchMenuItems,
  fetchCoupons,
  fetchReviews,
  fetchOrders,
  fetchOrderById,
  submitOrder,
  updateOrderStatusApi,
  cancelOrderApi,
  reportOrderIssueApi,
  postReview,
  voteReview,
  postOwnerReply,
  updateRestaurantProfile,
  setRestaurantApproval,
  saveMenuItem,
  modifyMenuItem,
  removeMenuItem,
  saveCoupon,
  removeCouponApi,
  listPersistedOrders,
  persistOrder,
  updatePersistedOrderStatus,
} from '../services/accountApi';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  timestamp: string;
}

interface AppContextType {
  currentUser: User;
  isAuthenticated: boolean;
  users: User[];
  restaurants: Restaurant[];
  menuItems: MenuItem[];
  cart: OrderItem[];
  orders: Order[];
  refreshOrders: () => Promise<void>;
  activeTrackingOrder: Order | null;
  coupons: Coupon[];
  appliedCoupon: Coupon | null;
  reviews: Review[];
  filters: FilterState;
  selectedCity: string;
  darkMode: boolean;
  inspecting3DItem: MenuItem | null;
  customizingItem: MenuItem | null;
  viewingInvoiceOrder: Order | null;
  reportingIssueOrder: Order | null;
  reviewingRestaurant: Restaurant | null;
  isAuthModalOpen: boolean;
  authModalView: 'login' | 'signup' | 'otp' | 'forgot';
  notifications: NotificationItem[];
  selectedTip: number;
  setSelectedTip: (tip: number) => void;

  // Role & Auth actions
  login: (email: string, password?: string) => Promise<{ success: boolean; message: string }>;
  loginWithPhone: (phone: string, otp: string) => Promise<{ success: boolean; message: string }>;
  signup: (data: { name: string; email: string; phone: string; password?: string }) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  openAuthModal: (view?: 'login' | 'signup' | 'otp' | 'forgot', onSuccess?: () => void) => void;
  closeAuthModal: () => void;
  switchRole: (role: UserRole) => void;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  addAddress: (address: Omit<Address, 'id'>) => void;
  updateAddress: (id: string, updates: Partial<Address>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  toggleFavorite: (restaurantId: string) => void;

  // Cart actions
  addToCart: (
    item: MenuItem,
    quantity?: number,
    customization?: ItemCustomization,
    specialInstructions?: string
  ) => void;
  removeFromCart: (indexOrMenuItemId: number | string) => void;
  updateCartQuantity: (indexOrMenuItemId: number | string, delta: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  autoApplyBestCoupon: () => { success: boolean; message: string; savedAmount: number };
  removeCoupon: () => void;

  // Loyalty Points
  redeemLoyaltyPoints: boolean;
  redeemedPoints: number;
  toggleRedeemLoyaltyPoints: (enable?: boolean) => void;
  setRedeemedPoints: (points: number) => void;

  cartTotals: {
    subtotal: number;
    discount: number;
    loyaltyDiscount: number;
    pointsRedeemed: number;
    pointsToEarn: number;
    maxRedeemablePoints: number;
    availablePoints: number;
    deliveryFee: number;
    packagingFee: number;
    platformFee: number;
    tipAmount: number;
    tax: number;
    total: number;
  };

  // Order Actions & Lifecycle
  createOrder: (
    address: Address,
    paymentMethod: 'razorpay' | 'cod' | 'upi' | 'card' | 'wallet',
    options?: {
      deliveryInstructions?: string;
      tipAmount?: number;
      scheduledFor?: string;
      paymentStatus?: string;
      paymentId?: string;
      paymentVerified?: boolean;
    }
  ) => Promise<Order>;
  cancelOrder: (orderId: string, reason: string) => Promise<{ success: boolean; message: string; refundAmount: number }>;
  reportOrderIssue: (
    orderId: string,
    issueType: string,
    description: string
  ) => Promise<{ success: boolean; ticketId: string; compensation: number }>;
  reorderOrder: (order: Order, replaceCart?: boolean) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus, partnerLocation?: [number, number]) => void;
  completeOrder: (orderId: string) => void;
  earnLoyaltyPoints: (points: number, reason: string) => void;
  setActiveTrackingOrder: (order: Order | null) => void;

  // Reviews
  addReview: (review: Omit<Review, 'id' | 'date'>) => void;
  voteHelpful: (reviewId: string) => void;
  addOwnerReply: (reviewId: string, replyText: string) => void;

  // Restaurant & Menu Management (Owner & Admin)
  updateRestaurant: (updated: Partial<Restaurant> & { id: string }) => void;
  approveRestaurant: (restaurantId: string, isApproved: boolean) => void;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (item: Partial<MenuItem> & { id: string }) => void;
  deleteMenuItem: (itemId: string) => void;

  // Coupon Management (Admin)
  addCoupon: (coupon: Coupon) => void;
  deleteCoupon: (code: string) => void;

  // Filter & Search
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  setSelectedCity: (city: string) => void;

  // Modals
  open3DViewer: (item: MenuItem) => void;
  close3DViewer: () => void;
  openCustomizationModal: (item: MenuItem) => void;
  closeCustomizationModal: () => void;
  openInvoiceModal: (order: Order) => void;
  closeInvoiceModal: () => void;
  openIssueModal: (order: Order) => void;
  closeIssueModal: () => void;
  openReviewModal: (restaurant: Restaurant) => void;
  closeReviewModal: () => void;
  toggleDarkMode: () => void;
  addNotification: (title: string, message: string, type?: 'info' | 'success' | 'warning') => void;
  dismissNotification: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'foodverse_user',
  CART: 'foodverse_cart',
  ORDERS: 'foodverse_orders',
  RESTAURANTS: 'foodverse_restaurants',
  MENU: 'foodverse_menu',
  COUPONS: 'foodverse_coupons',
  REVIEWS: 'foodverse_reviews',
  DARK: 'foodverse_dark_mode',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [currentUser, setCurrentUser] = useState<User>(() => {
    return { id: 'guest', name: 'Guest Diner', email: '', role: 'customer', addresses: [], favorites: [], loyaltyPoints: 0, isGuest: true };
  });

  const isAuthenticated = !currentUser.isGuest;

  // Auth modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<'login' | 'signup' | 'otp' | 'forgot'>('login');
  const [onAuthSuccessCallback, setOnAuthSuccessCallback] = useState<(() => void) | null>(null);

  // Loyalty points redemption state
  const [redeemLoyaltyPoints, setRedeemLoyaltyPoints] = useState<boolean>(false);
  const [customRedeemedPoints, setCustomRedeemedPoints] = useState<number | null>(null);

  const [restaurants, setRestaurants] = useState<Restaurant[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RESTAURANTS);
    if (saved) {
      try {
        const parsed: Restaurant[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed.every((r) => r.location?.city === 'Islampur')) {
          return parsed;
        }
      } catch {
        // ignore
      }
    }
    return MOCK_RESTAURANTS;
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MENU);
    if (saved) {
      try {
        const parsed: MenuItem[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const mockMap = new Map(MOCK_MENU_ITEMS.map((m) => [m.id, m]));
          const merged = parsed.map((m) => {
            const mock = mockMap.get(m.id);
            if (mock) {
              return {
                ...m,
                image: mock.image,
                category: mock.category,
                has3DModel: mock.has3DModel ?? m.has3DModel,
                modelType: mock.modelType ?? m.modelType,
              };
            }
            return m;
          });
          const existingIds = new Set(merged.map((m) => m.id));
          const missing = MOCK_MENU_ITEMS.filter((m) => !existingIds.has(m.id));
          return [...merged, ...missing];
        }
      } catch {
        // ignore
      }
    }
    return MOCK_MENU_ITEMS;
  });

  const [cart, setCart] = useState<OrderItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CART);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return MOCK_ORDERS;
  });

  const [activeTrackingOrder, setActiveTrackingOrder] = useState<Order | null>(MOCK_ORDERS[0] || null);

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COUPONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return MOCK_COUPONS;
  });
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return MOCK_REVIEWS;
  });

  const [selectedCity, setSelectedCity] = useState<string>('Islampur');
  const [inspecting3DItem, setInspecting3DItem] = useState<MenuItem | null>(null);
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [viewingInvoiceOrder, setViewingInvoiceOrder] = useState<Order | null>(null);
  const [reportingIssueOrder, setReportingIssueOrder] = useState<Order | null>(null);
  const [reviewingRestaurant, setReviewingRestaurant] = useState<Restaurant | null>(null);
  const [selectedTip, setSelectedTip] = useState<number>(20);

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.DARK) === 'true';
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif_init',
      title: 'Welcome to FoodVerse! 🍕',
      message: 'Explore authentic gourmet dining, full order customization, live tracking, and instant discounts.',
      type: 'info',
      timestamp: 'Just now',
    },
  ]);

  const [filters, setFilters] = useState<FilterState>({
    cuisine: 'all',
    rating: 0,
    maxDeliveryTime: 60,
    priceRange: 'all',
    isVeg: null,
    dietaryPreference: 'all',
    dietaryPreferences: [],
    onlyFavorites: false,
    sortBy: 'popular',
    searchQuery: '',
  });

  // Persist state
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    if (currentUser.isGuest || !currentUser.id) return;
    void saveAccountProfile({
      name: currentUser.name,
      phone: currentUser.phone,
      avatar: currentUser.avatar,
      addresses: currentUser.addresses,
      favorites: currentUser.favorites,
    }).catch((error) => addNotification('Profile changes not saved', error instanceof Error ? error.message : 'Reconnect and retry.', 'warning'));
  }, [currentUser.name, currentUser.phone, currentUser.avatar, currentUser.addresses, currentUser.favorites]);

  useEffect(() => {
    if (!firebaseAuth) return;
    return onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (!firebaseUser) {
        setCurrentUser({ id: 'guest', name: 'Guest Diner', email: '', role: 'customer', addresses: [], favorites: [], loyaltyPoints: 0, isGuest: true });
        return;
      }
      try {
        setCurrentUser(await loadAccountProfile(firebaseUser.displayName || ''));
        setOrders((await fetchOrders()) as Order[]);
      } catch (error) {
        addNotification('Account profile unavailable', error instanceof Error ? error.message : 'Please try again.', 'warning');
      }
    });
  }, []);

  // Fetch persistent business data from backend
  useEffect(() => {
    let active = true;
    fetchRestaurants().then((rests) => {
      if (active && Array.isArray(rests) && rests.length > 0) setRestaurants(rests);
    }).catch(() => {});
    fetchMenuItems().then((items) => {
      if (active && Array.isArray(items) && items.length > 0) setMenuItems(items);
    }).catch(() => {});
    fetchCoupons().then((coups) => {
      if (active && Array.isArray(coups) && coups.length > 0) setCoupons(coups);
    }).catch(() => {});
    fetchReviews().then((revs) => {
      if (active && Array.isArray(revs) && revs.length > 0) setReviews(revs);
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  // Server-authoritative live order tracking polling
  useEffect(() => {
    if (!activeTrackingOrder?.id || activeTrackingOrder.status === 'delivered' || activeTrackingOrder.status === 'cancelled') {
      return;
    }
    const timer = setInterval(() => {
      fetchOrderById(activeTrackingOrder.id)
        .then((latest) => {
          if (latest && (latest.status !== activeTrackingOrder.status || JSON.stringify(latest.currentLocation) !== JSON.stringify(activeTrackingOrder.currentLocation))) {
            setActiveTrackingOrder(latest);
            setOrders((prev) => prev.map((o) => (o.id === latest.id ? latest : o)));
          }
        })
        .catch(() => {});
    }, 8000);
    return () => clearInterval(timer);
  }, [activeTrackingOrder?.id, activeTrackingOrder?.status]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RESTAURANTS, JSON.stringify(restaurants));
  }, [restaurants]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DARK, String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Notifications
  const addNotification = (title: string, message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const notifId = 'notif_' + Date.now() + Math.random().toString(36).substring(2, 6);
    const notif: NotificationItem = {
      id: notifId,
      title,
      message,
      type,
      timestamp: 'Just now',
    };
    setNotifications((prev) => [notif, ...prev.slice(0, 7)]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notifId));
    }, 10000);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Auth Operations
  const openAuthModal = (view: 'login' | 'signup' | 'otp' | 'forgot' = 'login', onSuccess?: () => void) => {
    setAuthModalView(view);
    setOnAuthSuccessCallback(() => (onSuccess ? onSuccess : null));
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setOnAuthSuccessCallback(null);
  };

  const completeSignIn = async (firebaseUser: import('firebase/auth').User, fallbackName?: string, fallbackPhone?: string) => {
    const profile = await loadAccountProfile(fallbackName || firebaseUser.displayName || '', fallbackPhone);
    setCurrentUser(profile);
    const accountOrders = await listPersistedOrders();
    setOrders(accountOrders as Order[]);
    addNotification('Signed in', `Welcome back${profile.name ? `, ${profile.name}` : ''}.`, 'success');
    if (onAuthSuccessCallback) onAuthSuccessCallback();
    setIsAuthModalOpen(false);
    return profile;
  };

  const login = async (email: string, password = '') => {
    try {
      const user = await signIn(email.trim(), password);
      const profile = await completeSignIn(user);
      return { success: true, message: `Welcome back, ${profile.name}!` };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Sign in failed.' };
    }
  };

  const loginWithPhone = async (_phone: string, otp: string) => {
    try {
      const user = await confirmPhoneCode(otp);
      const profile = await completeSignIn(user);
      return { success: true, message: `Welcome, ${profile.name}!` };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Phone verification failed.' };
    }
  };

  const signup = async (data: { name: string; email: string; phone: string; password?: string }) => {
    try {
      const user = await createAccount(data.email.trim(), data.password || '', data.name.trim());
      const profile = await completeSignIn(user, data.name.trim(), data.phone.trim());
      return { success: true, message: `Account created for ${profile.name}.` };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Account creation failed.' };
    }
  };

  const logout = () => {
    void signOutFirebase();
    const guestUser: User = {
      id: 'user_guest_' + Date.now(),
      name: 'Guest Diner',
      email: 'guest@foodverse.io',
      role: 'customer',
      addresses: [],
      favorites: [],
      loyaltyPoints: 0,
      isGuest: true,
    };
    setCurrentUser(guestUser);
    addNotification('Signed out', 'You are browsing as a guest.', 'info');
  };

  const forgotPassword = async (email: string) => {
    try {
      await requestPasswordReset(email.trim());
      return { success: true, message: 'Password reset email sent. Check your inbox.' };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Could not send password reset email.' };
    }
  };

  // Switch role helper
  const switchRole = (_role: UserRole) => {
    addNotification('Role is account-managed', 'Contact an administrator to change account access.', 'info');
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    const updated = await saveAccountProfile(updates);
    setCurrentUser(updated);
    addNotification('Profile updated', 'Your account details are saved.', 'success');
  };

  const refreshOrders = useCallback(async () => {
    const latestOrders = await fetchOrders();
    setOrders(latestOrders);
  }, []);

  // Address operations
  const addAddress = (newAddr: Omit<Address, 'id'>) => {
    const addr: Address = {
      ...newAddr,
      id: 'addr_' + Date.now(),
      isDefault: newAddr.isDefault ?? (currentUser.addresses.length === 0),
    };
    setCurrentUser((prev) => ({
      ...prev,
      addresses: addr.isDefault
        ? [...prev.addresses.map((a) => ({ ...a, isDefault: false })), addr]
        : [...prev.addresses, addr],
    }));
    addNotification('Address Saved', `${addr.label} address successfully registered`, 'success');
  };

  const updateAddress = (id: string, updates: Partial<Address>) => {
    setCurrentUser((prev) => ({
      ...prev,
      addresses: prev.addresses.map((a) =>
        a.id === id ? { ...a, ...updates } : updates.isDefault ? { ...a, isDefault: false } : a
      ),
    }));
    addNotification('Address Updated', 'Saved delivery address updated', 'success');
  };

  const deleteAddress = (id: string) => {
    setCurrentUser((prev) => ({
      ...prev,
      addresses: prev.addresses.filter((a) => a.id !== id),
    }));
    addNotification('Address Removed', 'Delivery address removed from address book', 'info');
  };

  const setDefaultAddress = (id: string) => {
    setCurrentUser((prev) => ({
      ...prev,
      addresses: prev.addresses.map((a) => ({ ...a, isDefault: a.id === id })),
    }));
    addNotification('Default Address Set', 'Preferred delivery location updated', 'success');
  };

  const toggleFavorite = (restaurantId: string) => {
    const targetRest = restaurants.find((r) => r.id === restaurantId);
    const restName = targetRest ? targetRest.name : 'Restaurant';
    const isFavAlready = currentUser.favorites.includes(restaurantId);

    setCurrentUser((prev) => {
      const exists = prev.favorites.includes(restaurantId);
      const updated = exists
        ? prev.favorites.filter((id) => id !== restaurantId)
        : [...prev.favorites, restaurantId];
      return { ...prev, favorites: updated };
    });

    if (isFavAlready) {
      addNotification('Removed from Favorites', `${restName} was removed from your bookmarks`, 'info');
    } else {
      addNotification('Added to Favorites', `❤️ ${restName} is now in your saved favorites!`, 'success');
    }
  };

  // Cart operations
  const addToCart = (
    item: MenuItem,
    quantity = 1,
    customization?: ItemCustomization,
    specialInstructions?: string
  ) => {
    // Calculate effective unit price with variant and add-ons
    let unitPrice = item.price;
    if (customization) {
      if (customization.variant) {
        unitPrice = customization.variant.price;
      }
      const addOnsTotal = customization.addOns.reduce((acc, curr) => acc + curr.price, 0);
      unitPrice += addOnsTotal;
    }

    setCart((prev) => {
      // Find matching item with exact same customization
      const customKey = customization ? JSON.stringify(customization) : '';
      const existingIdx = prev.findIndex(
        (i) => i.menuItemId === item.id && JSON.stringify(i.customization || '') === customKey
      );

      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = {
          ...next[existingIdx],
          quantity: next[existingIdx].quantity + quantity,
          specialInstructions: specialInstructions || next[existingIdx].specialInstructions,
        };
        return next;
      }

      return [
        ...prev,
        {
          menuItemId: item.id,
          name: item.name,
          price: unitPrice,
          quantity,
          isVeg: item.isVeg,
          image: item.image,
          specialInstructions: specialInstructions || customization?.specialInstructions,
          modelType: item.modelType,
          customization,
        },
      ];
    });

    addNotification('Added to Bag', `${item.name} (${quantity}x) added to cart`, 'success');
  };

  const removeFromCart = (indexOrMenuItemId: number | string) => {
    setCart((prev) => {
      if (typeof indexOrMenuItemId === 'number') {
        return prev.filter((_, idx) => idx !== indexOrMenuItemId);
      }
      return prev.filter((i) => i.menuItemId !== indexOrMenuItemId);
    });
  };

  const updateCartQuantity = (indexOrMenuItemId: number | string, delta: number) => {
    setCart((prev) => {
      if (typeof indexOrMenuItemId === 'number') {
        return prev
          .map((item, idx) => {
            if (idx === indexOrMenuItemId) {
              const newQty = item.quantity + delta;
              return newQty > 0 ? { ...item, quantity: newQty } : null;
            }
            return item;
          })
          .filter(Boolean) as OrderItem[];
      }
      return prev
        .map((i) => {
          if (i.menuItemId === indexOrMenuItemId) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as OrderItem[];
    });
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    setRedeemLoyaltyPoints(false);
    setCustomRedeemedPoints(null);
  };

  // Cart calculation & Loyalty Points math
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  let discount = 0;
  if (appliedCoupon && subtotal >= appliedCoupon.minOrder) {
    const rawDisc = (subtotal * appliedCoupon.discountPercentage) / 100;
    discount = Math.min(rawDisc, appliedCoupon.maxDiscount);
  }

  const availablePoints = currentUser.loyaltyPoints || 0;
  const remainingBillBeforeLoyalty = Math.max(0, subtotal - discount);
  const maxRedeemablePoints = Math.min(availablePoints, remainingBillBeforeLoyalty);

  const pointsRedeemed = redeemLoyaltyPoints
    ? Math.min(
        customRedeemedPoints !== null && customRedeemedPoints > 0
          ? customRedeemedPoints
          : maxRedeemablePoints,
        maxRedeemablePoints
      )
    : 0;

  const loyaltyDiscount = pointsRedeemed; // 1 point = ₹1.00 discount
  const deliveryFee = cart.length > 0 ? (subtotal > 499 ? 0 : 35) : 0;
  const packagingFee = cart.length > 0 ? 20 : 0;
  const platformFee = cart.length > 0 ? 5 : 0;
  const tipAmount = cart.length > 0 ? selectedTip : 0;
  const tax = cart.length > 0 ? Number((subtotal * 0.05).toFixed(2)) : 0;
  const total = Math.max(
    0,
    subtotal - discount - loyaltyDiscount + deliveryFee + packagingFee + platformFee + tipAmount + tax
  );

  // Earn rule: 10% of food bill, with minimum 10 points
  const pointsToEarn =
    cart.length > 0
      ? Math.max(10, Math.floor(Math.max(0, subtotal - discount - loyaltyDiscount) * 0.1))
      : 0;

  const cartTotals = {
    subtotal,
    discount,
    loyaltyDiscount,
    pointsRedeemed,
    pointsToEarn,
    maxRedeemablePoints,
    availablePoints,
    deliveryFee,
    packagingFee,
    platformFee,
    tipAmount,
    tax,
    total,
  };

  const toggleRedeemLoyaltyPoints = (enable?: boolean) => {
    setRedeemLoyaltyPoints((prev) => {
      const nextVal = enable !== undefined ? enable : !prev;
      if (nextVal && customRedeemedPoints === null) {
        setCustomRedeemedPoints(maxRedeemablePoints);
      }
      return nextVal;
    });
  };

  const setRedeemedPoints = (pts: number) => {
    setCustomRedeemedPoints(Math.max(0, Math.min(pts, maxRedeemablePoints)));
  };

  // Coupons
  const applyCoupon = (code: string) => {
    const coupon = coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());
    if (!coupon) {
      return { success: false, message: 'Invalid or expired coupon code.' };
    }
    if (subtotal < coupon.minOrder) {
      return {
        success: false,
        message: `Add items worth ₹${coupon.minOrder - subtotal} more to apply this coupon.`,
      };
    }
    // Check first_order rule
    if (coupon.category === 'first_order') {
      const customerOrders = orders.filter((o) => o.customerId === currentUser.id);
      if (customerOrders.length > 0) {
        return {
          success: false,
          message: 'WELCOME50 is only valid for inaugural first-time orders.',
        };
      }
    }
    setAppliedCoupon(coupon);
    addNotification('Coupon Applied!', `You saved up to ₹${coupon.maxDiscount} with ${coupon.code}`, 'success');
    return { success: true, message: `Coupon ${coupon.code} applied successfully!` };
  };

  const autoApplyBestCoupon = () => {
    if (cart.length === 0 || subtotal <= 0) {
      return { success: false, message: 'Add dishes to bag before applying offers', savedAmount: 0 };
    }

    let bestCoupon: Coupon | null = null;
    let maxSaving = 0;

    for (const coup of coupons) {
      if (subtotal < coup.minOrder) continue;
      if (coup.category === 'first_order') {
        const pastOrders = orders.filter((o) => o.customerId === currentUser.id);
        if (pastOrders.length > 0) continue;
      }
      const rawDisc = (subtotal * coup.discountPercentage) / 100;
      const effective = Math.min(rawDisc, coup.maxDiscount);
      if (effective > maxSaving) {
        maxSaving = effective;
        bestCoupon = coup;
      }
    }

    if (bestCoupon && maxSaving > 0) {
      setAppliedCoupon(bestCoupon);
      addNotification('Best Offer Applied! 🎉', `Applied ${bestCoupon.code} to save ₹${maxSaving.toFixed(0)}`, 'success');
      return {
        success: true,
        message: `Best coupon ${bestCoupon.code} applied! Saved ₹${maxSaving.toFixed(0)}`,
        savedAmount: maxSaving,
      };
    }

    return {
      success: false,
      message: 'No coupon offers meet your current cart value.',
      savedAmount: 0,
    };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // Order Placement (Server Authoritative)
  const createOrder = async (
    address: Address,
    paymentMethod: 'razorpay' | 'cod' | 'upi' | 'card' | 'wallet',
    options?: {
      deliveryInstructions?: string;
      tipAmount?: number;
      scheduledFor?: string;
      paymentStatus?: string;
      paymentId?: string;
      paymentVerified?: boolean;
    }
  ): Promise<Order> => {
    if (currentUser.isGuest) {
      openAuthModal('login');
      throw new Error('Please sign in to place an order.');
    }

    const firstItem = menuItems.find((m) => m.id === cart[0]?.menuItemId);
    const rest = restaurants.find((r) => r.id === firstItem?.restaurantId) || restaurants[0];

    const serverOrder = await submitOrder({
      restaurantId: rest.id,
      items: cart,
      deliveryAddress: address,
      paymentMethod,
      paymentStatus: options?.paymentStatus || (paymentMethod === 'cod' ? 'pending' : 'paid'),
      paymentId: options?.paymentId || (paymentMethod !== 'cod' ? `pay_${Date.now()}` : undefined),
      paymentVerified: options?.paymentVerified !== undefined ? options.paymentVerified : (paymentMethod !== 'cod'),
      couponCode: appliedCoupon?.code,
      pointsRedeemed: cartTotals.pointsRedeemed,
      tipAmount: options?.tipAmount ?? cartTotals.tipAmount,
      deliveryInstructions: options?.deliveryInstructions,
      scheduledFor: options?.scheduledFor,
    });

    // Sync loyalty points from server
    if (serverOrder.loyaltyPointsRedeemed && serverOrder.loyaltyPointsRedeemed > 0) {
      setCurrentUser((prev) => ({
        ...prev,
        loyaltyPoints: Math.max(0, (prev.loyaltyPoints || 0) - serverOrder.loyaltyPointsRedeemed!),
      }));
    }

    setOrders((prev) => [serverOrder, ...prev.filter((o) => o.id !== serverOrder.id)]);
    setActiveTrackingOrder(serverOrder);
    clearCart();

    addNotification(
      'Order Placed! 🛵',
      `Order #${serverOrder.orderNumber} sent to ${serverOrder.restaurantName}. Tracking started.`,
      'success'
    );

    if (serverOrder.loyaltyPointsRedeemed && serverOrder.loyaltyPointsRedeemed > 0) {
      addNotification(
        'Points Redeemed! ✨',
        `Redeemed ${serverOrder.loyaltyPointsRedeemed} FoodVerse Points for a discount of ₹${serverOrder.loyaltyDiscount || 0}.00`,
        'info'
      );
    }

    return serverOrder;
  };

  // Order Cancellation & Issue Resolution
  const cancelOrder = async (orderId: string, reason: string) => {
    try {
      const result = await cancelOrderApi(orderId, reason);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? result.order : o)));
      if (activeTrackingOrder?.id === orderId) {
        setActiveTrackingOrder(result.order);
      }
      if (result.order.loyaltyPointsRedeemed) {
        loadAccountProfile().then(setCurrentUser).catch(() => {});
      }
      addNotification('Order Cancelled', `Order #${result.order.orderNumber} has been cancelled.`, 'info');
      return {
        success: true,
        message: `Order #${result.order.orderNumber} cancelled. Refund of ₹${result.refundAmount || 0} processed.`,
        refundAmount: result.refundAmount || 0,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not cancel order.';
      addNotification('Cancellation Failed', msg, 'warning');
      return { success: false, message: msg, refundAmount: 0 };
    }
  };

  const reportOrderIssue = async (orderId: string, issueType: string, description: string) => {
    try {
      const result = await reportOrderIssueApi(orderId, issueType, description);
      const updatedOrders = await fetchOrders();
      setOrders(updatedOrders);
      loadAccountProfile().then(setCurrentUser).catch(() => {});
      addNotification('Issue Reported', 'Ticket registered. Resolution points credited to your wallet!', 'success');
      return {
        success: true,
        ticketId: (result.ticket as any)?.id || 'TCK-CONFIRMED',
        compensation: result.compensation || 100,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not report issue.';
      addNotification('Report Failed', msg, 'warning');
      return { success: false, ticketId: '', compensation: 0 };
    }
  };

  const reorderOrder = (order: Order, replaceCart = true) => {
    if (replaceCart) {
      setCart(order.items.map((i) => ({ ...i })));
    } else {
      setCart((prev) => {
        const next = [...prev];
        order.items.forEach((item) => {
          const idx = next.findIndex((x) => x.menuItemId === item.menuItemId);
          if (idx >= 0) {
            next[idx] = { ...next[idx], quantity: next[idx].quantity + item.quantity };
          } else {
            next.push({ ...item });
          }
        });
        return next;
      });
    }
    addNotification(
      'Items Added to Bag! 🛒',
      `${order.items.length} item(s) from Order #${order.orderNumber} added to your bag.`,
      'success'
    );
  };

  const earnLoyaltyPoints = (points: number, reason: string) => {
    setCurrentUser((prev) => {
      const updated = (prev.loyaltyPoints || 0) + points;
      return { ...prev, loyaltyPoints: updated };
    });
    addNotification(
      '⭐ Points Credited!',
      `+${points} FoodVerse Points added to your wallet for ${reason}.`,
      'success'
    );
  };

  const completeOrder = async (orderId: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;
    if (targetOrder.status === 'delivered') {
      addNotification('Order Already Completed', `Order #${targetOrder.orderNumber} is already delivered.`, 'info');
      return;
    }
    await updateOrderStatus(orderId, 'delivered');
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus, partnerLocation?: [number, number]) => {
    try {
      const updated = await updateOrderStatusApi(orderId, newStatus, partnerLocation);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (activeTrackingOrder?.id === orderId) {
        setActiveTrackingOrder(updated);
      }
      if (newStatus === 'delivered') {
        loadAccountProfile().then(setCurrentUser).catch(() => {});
      }
      addNotification(`Order #${updated.orderNumber}`, `Status updated to ${newStatus.replace(/_/g, ' ')}`, 'info');
    } catch (err) {
      addNotification('Status Update Failed', err instanceof Error ? err.message : 'Could not advance status.', 'warning');
    }
  };

  // Reviews
  const addReview = async (newRev: Omit<Review, 'id' | 'date'>) => {
    try {
      const result = await postReview(newRev);
      setReviews((prev) => [result.review, ...prev]);
      setRestaurants((prev) =>
        prev.map((r) =>
          r.id === newRev.restaurantId
            ? { ...r, rating: result.updatedRestaurantRating, reviewCount: (r.reviewCount || 0) + 1 }
            : r
        )
      );
      addNotification('Review Submitted! ⭐', `Thank you for sharing your feedback on ${newRev.dishName || 'your meal'}!`, 'success');
    } catch (err) {
      addNotification('Review Failed', err instanceof Error ? err.message : 'Could not submit review.', 'warning');
    }
  };

  const voteHelpful = async (reviewId: string) => {
    try {
      const updated = await voteReview(reviewId);
      setReviews((prev) => prev.map((r) => (r.id === reviewId ? updated : r)));
      addNotification('Feedback Recorded', 'Marked review as helpful', 'info');
    } catch (err) {
      addNotification('Feedback Note', err instanceof Error ? err.message : 'Could not register vote.', 'info');
    }
  };

  const addOwnerReply = async (reviewId: string, replyText: string) => {
    try {
      const updated = await postOwnerReply(reviewId, replyText);
      setReviews((prev) => prev.map((r) => (r.id === reviewId ? updated : r)));
      addNotification('Reply Published', 'Restaurant response added to customer review', 'success');
    } catch (err) {
      addNotification('Reply Failed', err instanceof Error ? err.message : 'Could not post reply.', 'warning');
    }
  };

  // Restaurant & Menu Management
  const updateRestaurant = async (updated: Partial<Restaurant> & { id: string }) => {
    try {
      const saved = await updateRestaurantProfile(updated.id, updated);
      setRestaurants((prev) => prev.map((r) => (r.id === updated.id ? saved : r)));
      addNotification('Restaurant Updated', 'Profile and settings saved.', 'success');
    } catch (err) {
      addNotification('Update Failed', err instanceof Error ? err.message : 'Could not update restaurant.', 'warning');
    }
  };

  const approveRestaurant = async (restaurantId: string, isApproved: boolean) => {
    try {
      const saved = await setRestaurantApproval(restaurantId, isApproved);
      setRestaurants((prev) => prev.map((r) => (r.id === restaurantId ? saved : r)));
      addNotification(
        isApproved ? 'Restaurant Approved' : 'Restaurant Rejected',
        `Restaurant status updated by Administrator`,
        isApproved ? 'success' : 'warning'
      );
    } catch (err) {
      addNotification('Action Failed', err instanceof Error ? err.message : 'Could not update approval.', 'warning');
    }
  };

  const addMenuItem = async (item: Omit<MenuItem, 'id'>) => {
    try {
      const saved = await saveMenuItem(item.restaurantId, item);
      setMenuItems((prev) => [saved, ...prev]);
      addNotification('Dish Added', `${saved.name} added to menu catalog`, 'success');
    } catch (err) {
      addNotification('Add Failed', err instanceof Error ? err.message : 'Could not add dish.', 'warning');
    }
  };

  const updateMenuItem = async (item: Partial<MenuItem> & { id: string }) => {
    try {
      const saved = await modifyMenuItem(item.id, item);
      setMenuItems((prev) => prev.map((m) => (m.id === item.id ? saved : m)));
      addNotification('Dish Updated', 'Menu item changes successfully saved', 'success');
    } catch (err) {
      addNotification('Update Failed', err instanceof Error ? err.message : 'Could not update dish.', 'warning');
    }
  };

  const deleteMenuItem = async (itemId: string) => {
    try {
      await removeMenuItem(itemId);
      setMenuItems((prev) => prev.filter((m) => m.id !== itemId));
      addNotification('Dish Removed', 'Menu item deleted', 'info');
    } catch (err) {
      addNotification('Delete Failed', err instanceof Error ? err.message : 'Could not delete dish.', 'warning');
    }
  };

  // Coupon management
  const addCoupon = async (coupon: Coupon) => {
    try {
      const saved = await saveCoupon(coupon);
      setCoupons((prev) => [saved, ...prev.filter((c) => c.code !== saved.code)]);
      addNotification('Coupon Created', `Discount code ${saved.code} active`, 'success');
    } catch (err) {
      addNotification('Create Failed', err instanceof Error ? err.message : 'Could not create coupon.', 'warning');
    }
  };

  const deleteCoupon = async (code: string) => {
    try {
      await removeCouponApi(code);
      setCoupons((prev) => prev.filter((c) => c.code !== code));
      addNotification('Coupon Removed', `Code ${code} deleted`, 'info');
    } catch (err) {
      addNotification('Delete Failed', err instanceof Error ? err.message : 'Could not delete coupon.', 'warning');
    }
  };

  // Modals
  const open3DViewer = (item: MenuItem) => setInspecting3DItem(item);
  const close3DViewer = () => setInspecting3DItem(null);

  const openCustomizationModal = (item: MenuItem) => setCustomizingItem(item);
  const closeCustomizationModal = () => setCustomizingItem(null);

  const openInvoiceModal = (order: Order) => setViewingInvoiceOrder(order);
  const closeInvoiceModal = () => setViewingInvoiceOrder(null);

  const openIssueModal = (order: Order) => setReportingIssueOrder(order);
  const closeIssueModal = () => setReportingIssueOrder(null);

  const openReviewModal = (restaurant: Restaurant) => setReviewingRestaurant(restaurant);
  const closeReviewModal = () => setReviewingRestaurant(null);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        users,
        restaurants,
        menuItems,
        cart,
        orders,
        refreshOrders,
        activeTrackingOrder,
        coupons,
        appliedCoupon,
        reviews,
        filters,
        selectedCity,
        darkMode,
        inspecting3DItem,
        customizingItem,
        viewingInvoiceOrder,
        reportingIssueOrder,
        reviewingRestaurant,
        isAuthModalOpen,
        authModalView,
        notifications,
        selectedTip,
        setSelectedTip,
        login,
        loginWithPhone,
        signup,
        logout,
        forgotPassword,
        openAuthModal,
        closeAuthModal,
        switchRole,
        updateUserProfile,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        toggleFavorite,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        applyCoupon,
        autoApplyBestCoupon,
        removeCoupon,
        redeemLoyaltyPoints,
        redeemedPoints:
          customRedeemedPoints !== null ? customRedeemedPoints : cartTotals.maxRedeemablePoints,
        toggleRedeemLoyaltyPoints,
        setRedeemedPoints,
        cartTotals,
        createOrder,
        cancelOrder,
        reportOrderIssue,
        reorderOrder,
        updateOrderStatus,
        completeOrder,
        earnLoyaltyPoints,
        setActiveTrackingOrder,
        addReview,
        voteHelpful,
        addOwnerReply,
        updateRestaurant,
        approveRestaurant,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        addCoupon,
        deleteCoupon,
        setFilters,
        setSelectedCity,
        open3DViewer,
        close3DViewer,
        openCustomizationModal,
        closeCustomizationModal,
        openInvoiceModal,
        closeInvoiceModal,
        openIssueModal,
        closeIssueModal,
        openReviewModal,
        closeReviewModal,
        toggleDarkMode,
        addNotification,
        dismissNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
};
