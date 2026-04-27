export interface AccSpec {
  key: string;
  value: string;
  modalContent: string;
}

export interface KeyElement {
  tag: string;
  title: string;
  description: string;
  images: string[];
}

export interface Product {
  _id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  coverImage: string;
  centerImage?: string;
  images: string[];
  specs: AccSpec[];
  keyElements: KeyElement[];
  inventory: number;
  isActive: boolean;
  category: string;
  shippingDate: string;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  coverImage: string;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

export interface PreOrderFormData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  product_name: string;
  product_price: number;
  quantity: number;
  total_amount: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface Order {
  _id: string;
  customerName: string;
  customerEmail: string;
  items: CartItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface PreOrder {
  _id: string;
  name: string;
  email: string;
  phone: string;
  productName: string;
  totalAmount: number;
  quantity: number;
  status: string;
  paymentLinkUrl?: string;
  createdAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  code?: string;
  data?: T;
}

// ===== ADMIN TYPES =====

export interface DashboardMetrics {
  revenue: { today: number; month: number; year: number };
  orders: { total: number; today: number; month: number };
  preorders: { total: number; pending: number };
  customers: { total: number; newThisMonth: number };
  products: { total: number; lowStock: number };
}

export interface RevenueChartPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface OrderStatusCount {
  _id: string;
  count: number;
}

export interface TopProduct {
  _id: string;
  productName: string;
  totalSold: number;
  totalRevenue: number;
}

export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  isActive?: boolean;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
}

export interface Coupon {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscount?: number;
  minPurchaseAmount: number;
  usageLimit?: number;
  usagePerCustomer: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  createdAt: string;
}
