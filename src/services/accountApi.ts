import type { User, Restaurant, MenuItem, Review, Coupon, Order, OrderStatus } from '../types';
import { firebaseAuth } from './firebaseAuth';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await firebaseAuth?.currentUser?.getIdToken();
  const response = await fetch(`${API_BASE}/api${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'The server could not complete your request.');
  return data as T;
}

// User & Profile
export async function loadAccountProfile(name?: string, phone?: string): Promise<User> {
  const result = await request<{ user: User }>('/profile/bootstrap', {
    method: 'POST',
    body: JSON.stringify({ name, phone }),
  });
  return result.user;
}

export async function saveAccountProfile(updates: Partial<User>): Promise<User> {
  const result = await request<{ user: User }>('/profile', {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
  return result.user;
}

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: User['role'];
  createdAt: string;
}

export async function getPlatformUsers(): Promise<PlatformUser[]> {
  const result = await request<{ users: PlatformUser[] }>('/users');
  return result.users;
}

export async function setPlatformUserRole(uid: string, role: Exclude<User['role'], 'admin'>) {
  return request(`/users/${encodeURIComponent(uid)}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
}

// Restaurants
export async function fetchRestaurants(): Promise<Restaurant[]> {
  const result = await request<{ restaurants: Restaurant[] }>('/restaurants');
  return result.restaurants;
}

export async function fetchRestaurant(id: string): Promise<Restaurant> {
  const result = await request<{ restaurant: Restaurant }>(`/restaurants/${encodeURIComponent(id)}`);
  return result.restaurant;
}

export async function saveRestaurant(data: Partial<Restaurant>): Promise<Restaurant> {
  const result = await request<{ restaurant: Restaurant }>('/restaurants', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return result.restaurant;
}

export async function updateRestaurantProfile(id: string, data: Partial<Restaurant>): Promise<Restaurant> {
  const result = await request<{ restaurant: Restaurant }>(`/restaurants/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return result.restaurant;
}

export async function setRestaurantApproval(id: string, isApproved: boolean): Promise<Restaurant> {
  const result = await request<{ restaurant: Restaurant }>(`/restaurants/${encodeURIComponent(id)}/approval`, {
    method: 'PATCH',
    body: JSON.stringify({ isApproved }),
  });
  return result.restaurant;
}

export async function setRestaurantOwner(id: string, ownerId: string): Promise<Restaurant> {
  const result = await request<{ restaurant: Restaurant }>(`/restaurants/${encodeURIComponent(id)}/owner`, {
    method: 'PATCH',
    body: JSON.stringify({ ownerId }),
  });
  return result.restaurant;
}

// Menus
export async function fetchMenuItems(): Promise<MenuItem[]> {
  const result = await request<{ menuItems: MenuItem[] }>('/menu');
  return result.menuItems;
}

export async function fetchRestaurantMenu(restaurantId: string): Promise<MenuItem[]> {
  const result = await request<{ menuItems: MenuItem[] }>(`/restaurants/${encodeURIComponent(restaurantId)}/menu`);
  return result.menuItems;
}

export async function saveMenuItem(restaurantId: string, item: Omit<MenuItem, 'id'>): Promise<MenuItem> {
  const result = await request<{ menuItem: MenuItem }>(`/restaurants/${encodeURIComponent(restaurantId)}/menu`, {
    method: 'POST',
    body: JSON.stringify(item),
  });
  return result.menuItem;
}

export async function modifyMenuItem(id: string, item: Partial<MenuItem>): Promise<MenuItem> {
  const result = await request<{ menuItem: MenuItem }>(`/menu/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(item),
  });
  return result.menuItem;
}

export async function removeMenuItem(id: string): Promise<{ success: boolean; deletedId: string }> {
  return request(`/menu/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

// Coupons
export async function fetchCoupons(): Promise<Coupon[]> {
  const result = await request<{ coupons: Coupon[] }>('/coupons');
  return result.coupons;
}

export async function saveCoupon(coupon: Coupon): Promise<Coupon> {
  const result = await request<{ coupon: Coupon }>('/coupons', {
    method: 'POST',
    body: JSON.stringify(coupon),
  });
  return result.coupon;
}

export async function removeCouponApi(code: string): Promise<{ success: boolean; deletedCode: string }> {
  return request(`/coupons/${encodeURIComponent(code)}`, { method: 'DELETE' });
}
export const removeCoupon = removeCouponApi;

// Reviews
export async function fetchReviews(restaurantId?: string): Promise<Review[]> {
  const path = restaurantId ? `/reviews?restaurantId=${encodeURIComponent(restaurantId)}` : '/reviews';
  const result = await request<{ reviews: Review[] }>(path);
  return result.reviews;
}

export async function postReview(review: Omit<Review, 'id' | 'date' | 'helpfulVotes'>): Promise<{ review: Review; updatedRestaurantRating: number }> {
  return request('/reviews', {
    method: 'POST',
    body: JSON.stringify(review),
  });
}

export async function voteReview(reviewId: string): Promise<Review> {
  const result = await request<{ review: Review }>(`/reviews/${encodeURIComponent(reviewId)}/helpful`, {
    method: 'POST',
  });
  return result.review;
}

export async function postOwnerReply(reviewId: string, replyText: string): Promise<Review> {
  const result = await request<{ review: Review }>(`/reviews/${encodeURIComponent(reviewId)}/reply`, {
    method: 'POST',
    body: JSON.stringify({ replyText }),
  });
  return result.review;
}

// Orders
export async function fetchOrders(): Promise<Order[]> {
  const result = await request<{ orders: Order[] }>('/orders');
  return result.orders;
}

export async function fetchOrderById(id: string): Promise<Order> {
  const result = await request<{ order: Order }>(`/orders/${encodeURIComponent(id)}`);
  return result.order;
}

export interface CreateOrderPayload {
  restaurantId: string;
  items: unknown[];
  deliveryAddress: unknown;
  paymentMethod: string;
  paymentStatus?: string;
  paymentId?: string;
  paymentVerified?: boolean;
  couponCode?: string;
  pointsRedeemed?: number;
  tipAmount?: number;
  deliveryInstructions?: string;
  scheduledFor?: string;
  idempotencyKey?: string;
}

export async function submitOrder(payload: CreateOrderPayload): Promise<Order> {
  const result = await request<{ order: Order }>('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return result.order;
}

export async function updateOrderStatusApi(orderId: string, status: OrderStatus, partnerLocation?: [number, number]): Promise<Order> {
  const result = await request<{ order: Order }>(`/orders/${encodeURIComponent(orderId)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, partnerLocation }),
  });
  return result.order;
}

export async function cancelOrderApi(orderId: string, reason: string): Promise<{ order: Order; refundAmount: number }> {
  return request(`/orders/${encodeURIComponent(orderId)}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export async function reportOrderIssueApi(orderId: string, issueType: string, description: string): Promise<{ ticket: unknown; compensation: number }> {
  return request(`/orders/${encodeURIComponent(orderId)}/issue`, {
    method: 'POST',
    body: JSON.stringify({ issueType, description }),
  });
}

// Delivery
export async function fetchAvailableDeliveries(): Promise<Order[]> {
  const result = await request<{ orders: Order[] }>('/delivery/available-orders');
  return result.orders;
}

export async function claimDeliveryApi(orderId: string): Promise<Order> {
  const result = await request<{ order: Order }>(`/orders/${encodeURIComponent(orderId)}/claim-delivery`, {
    method: 'POST',
  });
  return result.order;
}

export async function updateCourierLocationApi(orderId: string, coordinates: [number, number]) {
  return request(`/orders/${encodeURIComponent(orderId)}/location`, {
    method: 'PATCH',
    body: JSON.stringify({ coordinates }),
  });
}

// Payment Gateway (Razorpay)
export interface PaymentConfig {
  configured: boolean;
  keyId: string | null;
}

export async function fetchPaymentConfig(): Promise<PaymentConfig> {
  return request<PaymentConfig>('/payments/config');
}

export interface CreatePaymentOrderResult {
  configured: boolean;
  keyId?: string;
  razorpayOrderId?: string;
  amount: number;
  amountInPaise: number;
  currency: string;
  bill: unknown;
  error?: string;
}

export async function createPaymentOrderApi(payload: {
  restaurantId: string;
  items: unknown[];
  couponCode?: string;
  pointsRedeemed?: number;
  tipAmount?: number;
}): Promise<CreatePaymentOrderResult> {
  return request<CreatePaymentOrderResult>('/payments/create-order', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function verifyPaymentApi(payload: {
  orderId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): Promise<{ verified: boolean; order: Order }> {
  return request<{ verified: boolean; order: Order }>('/payments/verify', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// Backwards compatibility aliases
export const listPersistedOrders = fetchOrders;
export const persistOrder = (order: unknown) => request('/orders', { method: 'POST', body: JSON.stringify(order) });
export const updatePersistedOrderStatus = (orderId: string, status: string) => updateOrderStatusApi(orderId, status as OrderStatus);
