export type UserRole = 'customer' | 'restaurant_owner' | 'delivery_partner' | 'admin';

export interface Address {
  id: string;
  label: 'Home' | 'Work' | 'Other';
  street: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
  isDefault?: boolean;
  landmark?: string;
  apartment?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  addresses: Address[];
  favorites: string[]; // Restaurant IDs
  loyaltyPoints: number; // FoodVerse reward points
  walletBalance?: number;
  isGuest?: boolean;
}

export type ModelType = 'burger' | 'pizza' | 'donut' | 'noodles' | 'drink' | 'taco' | 'biryani' | 'samosa' | 'curry' | 'dosa' | 'gulabjamun';

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  image: string;
  banner: string;
  cuisines: string[];
  rating: number;
  reviewCount: number;
  deliveryTime: number; // in mins
  deliveryFee: number;
  minOrder: number;
  priceForTwo: number;
  isVegOnly?: boolean;
  dietaryPreferences?: string[]; // e.g. 'Vegan', 'Gluten-Free', 'Keto', 'High-Protein'
  isApproved: boolean;
  isPromoted?: boolean;
  openingHours: {
    open: string;
    close: string;
  };
  location: {
    address: string;
    city: string;
    coordinates: [number, number]; // [lat, lng]
  };
  ownerId?: string;
}

export interface ItemCustomization {
  variant?: { name: string; price: number };
  addOns: { name: string; price: number }[];
  spiceLevel: 'Mild' | 'Medium' | 'Fiery';
  removedIngredients: string[];
  specialInstructions?: string;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  allergens?: string[];
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  isVeg: boolean;
  isAvailable: boolean;
  isBestSeller?: boolean;
  isChefPick?: boolean;
  rating: number;
  ratingCount: number;
  image: string;
  has3DModel?: boolean;
  modelType?: ModelType;
  calories?: number;
  preparationTime?: string;
  ingredients?: string[];
  dietaryPreferences?: string[];
  nutrition?: NutritionInfo;
  availableVariants?: { name: string; price: number }[];
  availableAddOns?: { name: string; price: number }[];
  variants?: { id: string; name: string; priceDelta: number }[];
  addOns?: { id: string; name: string; price: number }[];
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  isVeg: boolean;
  image: string;
  specialInstructions?: string;
  modelType?: ModelType;
  customization?: ItemCustomization;
}

export type OrderStatus = 'placed' | 'accepted' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  restaurantId: string;
  restaurantName: string;
  restaurantLocation: [number, number];
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  packagingFee?: number;
  platformFee?: number;
  tipAmount?: number;
  discountAmount: number;
  loyaltyPointsEarned?: number;
  loyaltyPointsRedeemed?: number;
  loyaltyDiscount?: number;
  totalAmount: number;
  couponCode?: string;
  status: OrderStatus;
  paymentMethod: 'razorpay' | 'cod' | 'upi' | 'card' | 'wallet';
  paymentStatus: 'pending' | 'paid' | 'failed';
  deliveryPartnerId?: string;
  deliveryPartnerName?: string;
  deliveryPartnerPhone?: string;
  deliveryAddress: Address;
  deliveryInstructions?: string;
  scheduledFor?: string;
  currentLocation?: [number, number];
  createdAt: string;
  updatedAt?: string;
  estimatedDeliveryTime: string;
  statusTimeline: {
    status: OrderStatus;
    time: string;
    description: string;
  }[];
  cancellationReason?: string;
  refundAmount?: number;
  refundStatus?: 'none' | 'pending' | 'completed';
  supportTicket?: {
    id: string;
    issueType: string;
    description: string;
    status: 'open' | 'resolved';
    compensationGranted?: number;
    createdAt: string;
  };
  reviewSubmitted?: boolean;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  restaurantId: string;
  rating: number;
  foodRating?: number;
  deliveryRating?: number;
  packagingRating?: number;
  comment: string;
  date?: string;
  createdAt?: string;
  dishName?: string;
  photos?: string[];
  helpfulVotes?: number;
  ownerReply?: {
    author: string;
    text: string;
    date: string;
  } | string;
}

export interface Coupon {
  code: string;
  discountPercentage: number;
  maxDiscount: number;
  minOrder: number;
  description: string;
  expiryDate: string;
  category?: 'general' | 'bank' | 'first_order' | 'gold';
  bankName?: string;
  terms?: string[];
}

export interface CuisineCategory {
  id: string;
  name: string;
  image: string;
  iconName: string;
  modelType: ModelType;
  dishCount: number;
}

export interface FilterState {
  cuisine: string;
  rating: number;
  maxDeliveryTime: number;
  priceRange: string;
  isVeg: boolean | null;
  dietaryPreference: string; // 'all' or 'Vegan', 'Gluten-Free', 'Keto', etc.
  dietaryPreferences: string[]; // multi-select array
  onlyFavorites?: boolean;
  sortBy: 'rating' | 'deliveryTime' | 'costLowHigh' | 'costHighLow' | 'popular';
  searchQuery: string;
}
