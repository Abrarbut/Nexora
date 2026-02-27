import { Role, VendorStatus, ProductStatus, SubOrderStatus, PayoutStatus } from "@prisma/client";

// ─── User Types ──────────────────────────────────────

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: Role;
  createdAt: Date;
}

// ─── Vendor Types ────────────────────────────────────

export interface VendorProfileData {
  id: string;
  storeName: string;
  slug: string;
  description: string | null;
  logo: string | null;
  banner: string | null;
  status: VendorStatus;
  commissionRate: number;
  createdAt: Date;
}

// ─── Product Types ───────────────────────────────────

export interface ProductData {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  status: ProductStatus;
  rating: number;
  categoryId: string;
  vendorId: string;
  createdAt: Date;
  category?: CategoryData;
  vendor?: VendorProfileData;
}

// ─── Category Types ──────────────────────────────────

export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  commissionRate: number | null;
}

// ─── Order Types ─────────────────────────────────────

export interface OrderData {
  id: string;
  total: number;
  shippingAddress: Record<string, string>;
  stripePaymentIntentId: string | null;
  createdAt: Date;
  subOrders: SubOrderData[];
}

export interface SubOrderData {
  id: string;
  status: SubOrderStatus;
  subtotal: number;
  vendorEarnings: number;
  platformFee: number;
  createdAt: Date;
  items: OrderItemData[];
  vendor?: VendorProfileData;
}

export interface OrderItemData {
  id: string;
  quantity: number;
  priceAtPurchase: number;
  product?: ProductData;
}

// ─── Review Types ────────────────────────────────────

export interface ReviewData {
  id: string;
  rating: number;
  comment: string;
  sentiment: string | null;
  sentimentScore: number | null;
  vendorReply: string | null;
  createdAt: Date;
  user?: SafeUser;
}

// ─── Cart Types ──────────────────────────────────────

export interface CartItem {
  productId: string;
  quantity: number;
  title: string;
  price: number;
  image: string;
  vendorId: string;
  vendorName: string;
}

// ─── Payout Types ────────────────────────────────────

export interface PayoutData {
  id: string;
  amount: number;
  status: PayoutStatus;
  stripeTransferId: string | null;
  createdAt: Date;
  vendor?: VendorProfileData;
}

// ─── API Response Types ──────────────────────────────

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
