import type { User } from '../types';
import { firebaseAuth } from './firebaseAuth';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

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
  if (!response.ok) throw new Error(data.error || 'The account service could not complete the request.');
  return data as T;
}

export async function loadAccountProfile(name?: string, phone?: string): Promise<User> {
  const result = await request<{ user: User }>('/profile/bootstrap', { method: 'POST', body: JSON.stringify({ name, phone }) });
  return result.user;
}

export async function saveAccountProfile(updates: Partial<User>): Promise<User> {
  const result = await request<{ user: User }>('/profile', { method: 'PATCH', body: JSON.stringify(updates) });
  return result.user;
}

export async function listPersistedOrders() {
  const result = await request<{ orders: unknown[] }>('/orders');
  return result.orders;
}

export async function persistOrder(order: unknown) {
  return request('/orders', { method: 'POST', body: JSON.stringify(order) });
}

export async function updatePersistedOrderStatus(orderId: string, status: string) {
  return request(`/orders/${encodeURIComponent(orderId)}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
}

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: User['role'];
  createdAt: string;
}

export async function getPlatformUsers() {
  const result = await request<{ users: PlatformUser[] }>('/users');
  return result.users;
}

export async function setPlatformUserRole(uid: string, role: Exclude<User['role'], 'admin'>) {
  return request(`/users/${encodeURIComponent(uid)}/role`, { method: 'PATCH', body: JSON.stringify({ role }) });
}
