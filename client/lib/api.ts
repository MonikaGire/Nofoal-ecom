import type { Product, Cart, PreOrderFormData, User } from '@/types';

const API_BASE = '/api';

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('nofoal_token') : null;
  const sessionId = typeof window !== 'undefined' ? getOrCreateSessionId() : '';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-session-id': sessionId,
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || `HTTP error ${res.status}`);
  }

  return data;
}

function getOrCreateSessionId(): string {
  let sessionId = localStorage.getItem('nofoal_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('nofoal_session_id', sessionId);
  }
  return sessionId;
}

// ===== PRODUCTS =====
export async function getProducts(): Promise<{ products: Product[] }> {
  return request('/products');
}

export async function getProductBySlug(slug: string): Promise<{ product: Product }> {
  return request(`/products/${slug}`);
}

// ===== PREORDER =====
export async function submitPreorder(data: PreOrderFormData): Promise<{ message: string; data: { paymentLinkUrl: string | null } }> {
  return request('/preorder', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ===== AUTH =====
export async function signup(name: string, email: string, password: string): Promise<{ token: string; user: User }> {
  return request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

export async function login(email: string, password: string): Promise<{ token: string; user: User }> {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function joinWaitlist(email: string): Promise<{ message: string }> {
  return request('/auth/waitlist', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function getMe(): Promise<{ user: User }> {
  return request('/auth/me');
}

// ===== CART =====
export async function getCart(): Promise<{ cart: Cart }> {
  return request('/cart');
}

export async function addToCart(productId: string, quantity = 1): Promise<{ cart: Cart }> {
  return request('/cart', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity }),
  });
}

export async function updateCartItem(productId: string, quantity: number): Promise<{ cart: Cart }> {
  return request(`/cart/${productId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  });
}

export async function removeFromCart(productId: string): Promise<{ cart: Cart }> {
  return request(`/cart/${productId}`, { method: 'DELETE' });
}

export async function clearCart(): Promise<void> {
  return request('/cart/clear', { method: 'DELETE' });
}

// ===== ORDERS =====
export interface OrderItemInput {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  coverImage?: string;
}

export interface CreateOrderData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  items: OrderItemInput[];
  totalAmount: number;
}

export async function createOrder(data: CreateOrderData): Promise<{
  success: boolean; order: any; orderId: string; shortId: string;
  razorpayOrderId: string; razorpayKey: string; amount: number;
}> {
  return request('/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function verifyPayment(data: {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): Promise<{ success: boolean; orderId: string; shortId: string }> {
  return request('/payment/verify', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getUserOrders(): Promise<{ success: boolean; orders: any[]; total: number }> {
  return request('/orders');
}

export async function getOrderById(id: string): Promise<{ success: boolean; order: any }> {
  return request(`/orders/${id}`);
}

export async function cancelOrder(id: string): Promise<{ success: boolean; order: any }> {
  return request(`/orders/${id}/cancel`, { method: 'POST' });
}

// ===== ADMIN =====
export async function adminGetPreorders(params?: { status?: string; page?: number }) {
  const cleaned: Record<string, string> = {};
  if (params?.status) cleaned.status = params.status;
  if (params?.page) cleaned.page = String(params.page);
  const qs = new URLSearchParams(cleaned).toString();
  return request(`/preorder${qs ? `?${qs}` : ''}`);
}

export async function adminUpdatePreorderStatus(id: string, status: string) {
  return request(`/preorder/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function adminGetOrders(params?: { status?: string; page?: number }) {
  const cleaned: Record<string, string> = {};
  if (params?.status) cleaned.status = params.status;
  if (params?.page) cleaned.page = String(params.page);
  const qs = new URLSearchParams(cleaned).toString();
  return request(`/orders${qs ? `?${qs}` : ''}`);
}

export async function adminUpdateOrderStatus(id: string, status: string, trackingNumber?: string) {
  return request(`/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, trackingNumber }),
  });
}

export async function adminCreateProduct(data: Partial<Product>) {
  return request('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function adminGetAllProducts(params?: { search?: string; category?: string; page?: number }) {
  const cleaned: Record<string, string> = {};
  if (params?.search) cleaned.search = params.search;
  if (params?.category) cleaned.category = params.category;
  if (params?.page) cleaned.page = String(params.page);
  const qs = new URLSearchParams(cleaned).toString();
  return request(`/products/admin/all${qs ? `?${qs}` : ''}`);
}

export async function adminUpdateProduct(id: string, data: Partial<Product>) {
  return request(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function adminDeleteProduct(id: string) {
  return request(`/products/${id}`, { method: 'DELETE' });
}

export async function adminPermanentDeleteProduct(id: string) {
  return request(`/products/${id}/permanent`, { method: 'DELETE' });
}

export async function adminGetDashboard() {
  return request('/analytics/dashboard');
}

export async function adminGetSalesAnalytics(period = '30d') {
  return request(`/analytics/sales?period=${period}`);
}

export async function adminGetCustomers(params?: { search?: string; page?: number; sort?: string }) {
  const cleaned: Record<string, string> = {};
  if (params?.search) cleaned.search = params.search;
  if (params?.page) cleaned.page = String(params.page);
  if (params?.sort) cleaned.sort = params.sort;
  const qs = new URLSearchParams(cleaned).toString();
  return request(`/customers${qs ? `?${qs}` : ''}`);
}

export async function adminGetCustomerById(id: string) {
  return request(`/customers/${id}`);
}

