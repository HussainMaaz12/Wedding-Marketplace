// src/types/index.ts
// All TypeScript types used across the app
// Import with: import type { VendorWithDetails } from '@/types'

import type {
  IUser as User,
  IVendor as Vendor,
  ICategory as Category,
  IPackage as Package,
  IBooking as Booking,
  IPayment as Payment,
  IReview as Review,
  ICoupon as Coupon,
  INotification as Notification,
} from '@/models'

// ─────────────────────────────────────────────
// EXTENDED TYPES (MongoDB models + their relations)
// ─────────────────────────────────────────────

export type VendorWithDetails = Vendor & {
  user: Pick<User, '_id' | 'name' | 'email' | 'phone'>
  category: Category
  packages: Package[]
}

export type BookingWithDetails = Booking & {
  customer: Pick<User, '_id' | 'name' | 'email' | 'phone'>
  vendor: Vendor & {
    user: Pick<User, 'name'>
  }
  package?: Package | null
  payments: Payment[]
  review?: Review | null
}

export type ReviewWithAuthor = Review & {
  customer: Pick<User, '_id' | 'name' | 'avatar'>
  vendor: Pick<Vendor, '_id' | 'businessName' | 'slug'>
}

// ─────────────────────────────────────────────
// API RESPONSE TYPES
// ─────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data: T | null
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

// ─────────────────────────────────────────────
// FORM INPUT TYPES (what users submit in forms)
// ─────────────────────────────────────────────

export interface RegisterInput {
  name: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  role: 'CUSTOMER' | 'VENDOR'
}

export interface LoginInput {
  email: string
  password: string
}

export interface VendorProfileInput {
  businessName: string
  categoryId: string
  description: string
  city: string
  state: string
  address?: string
  businessPhone?: string
  businessEmail?: string
  website?: string
  startingPrice?: number
}

export interface PackageInput {
  name: string
  description?: string
  price: number
  includes: string[]
}

export interface BookingEnquiryInput {
  vendorId: string
  packageId?: string
  eventDate: string   // ISO date string
  eventType: string
  eventVenue?: string
  guestCount?: number
  specialRequests?: string
  couponCode?: string
}

export interface ReviewInput {
  bookingId: string
  rating: number
  title?: string
  comment: string
  photos?: string[]
}

// ─────────────────────────────────────────────
// SEARCH & FILTER TYPES
// ─────────────────────────────────────────────

export interface VendorSearchFilters {
  city?: string
  categorySlug?: string
  minPrice?: number
  maxPrice?: number
  minRating?: number
  eventDate?: string
  sortBy?: 'rating' | 'price_low' | 'price_high' | 'popular'
  page?: number
  limit?: number
}

// ─────────────────────────────────────────────
// SESSION / AUTH TYPES
// ─────────────────────────────────────────────

export interface SessionUser {
  id: string
  name: string
  email: string
  role: 'CUSTOMER' | 'VENDOR' | 'ADMIN'
  avatar?: string | null
  vendorId?: string | null  // Set if user is a vendor
}

// ─────────────────────────────────────────────
// DASHBOARD STATS TYPES
// ─────────────────────────────────────────────

export interface VendorDashboardStats {
  totalBookings: number
  pendingEnquiries: number
  confirmedBookings: number
  completedBookings: number
  totalEarnings: number
  pendingPayouts: number
  averageRating: number
  totalReviews: number
}

export interface AdminDashboardStats {
  totalVendors: number
  pendingVendors: number
  totalCustomers: number
  totalBookings: number
  totalRevenue: number
  platformCommission: number
  pendingPayouts: number
}
