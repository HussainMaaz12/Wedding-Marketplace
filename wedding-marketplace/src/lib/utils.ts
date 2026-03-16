// src/lib/utils.ts
// Shared utility functions used across the app

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// ─────────────────────────────────────────────
// CSS CLASS HELPER
// Combines Tailwind classes safely
// Usage: cn('text-red-500', isActive && 'font-bold')
// ─────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─────────────────────────────────────────────
// PRICE FORMATTING
// Converts raw rupee value to ₹ format
// Usage: formatPrice(25000) → "₹25,000"
// ─────────────────────────────────────────────
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

// ─────────────────────────────────────────────
// DATE FORMATTING
// Usage: formatDate(new Date()) → "24 Jan 2025"
// ─────────────────────────────────────────────
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

// ─────────────────────────────────────────────
// SLUG GENERATOR
// Converts name to URL-friendly string
// Usage: generateSlug("Raj Photography") → "raj-photography"
// ─────────────────────────────────────────────
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')   // Remove special characters
    .replace(/\s+/g, '-')           // Replace spaces with hyphens
    .replace(/-+/g, '-')            // Remove duplicate hyphens
    .trim()
}

// ─────────────────────────────────────────────
// CALCULATE COMMISSION
// Usage: calculateCommission(50000) → { commission: 5000, vendorEarning: 45000 }
// ─────────────────────────────────────────────
export function calculateCommission(totalAmount: number) {
  const commissionPercentage = Number(process.env.COMMISSION_PERCENTAGE) || 10
  const commission = Math.round((totalAmount * commissionPercentage) / 100)
  const vendorEarning = totalAmount - commission

  return {
    commission,
    vendorEarning,
    commissionPercentage,
  }
}

// ─────────────────────────────────────────────
// CALCULATE ADVANCE PAYMENT
// Usage: calculateAdvance(50000) → { advance: 15000, balance: 35000 }
// ─────────────────────────────────────────────
export function calculateAdvance(totalAmount: number) {
  const advancePercentage = Number(process.env.ADVANCE_PAYMENT_PERCENTAGE) || 30
  const advance = Math.round((totalAmount * advancePercentage) / 100)
  const balance = totalAmount - advance

  return {
    advance,
    balance,
    advancePercentage,
  }
}

// ─────────────────────────────────────────────
// BOOKING NUMBER GENERATOR
// Creates human-readable booking ID
// Usage: generateBookingNumber() → "WC-2024-ABC12"
// ─────────────────────────────────────────────
export function generateBookingNumber(): string {
  const year = new Date().getFullYear()
  const random = Math.random().toString(36).substring(2, 7).toUpperCase()
  return `WC-${year}-${random}`
}

// ─────────────────────────────────────────────
// PAGINATION HELPER
// Usage: getPaginationData(page, limit, total)
// ─────────────────────────────────────────────
export function getPaginationData(page: number, limit: number, total: number) {
  const totalPages = Math.ceil(total / limit)
  const skip = (page - 1) * limit

  return {
    skip,
    take: limit,
    totalPages,
    currentPage: page,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  }
}

// ─────────────────────────────────────────────
// TRUNCATE TEXT
// Usage: truncate("Long text here...", 50) → "Long text..."
// ─────────────────────────────────────────────
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.substring(0, length).trim() + '...'
}

// ─────────────────────────────────────────────
// VALIDATE RAZORPAY PAYMENT SIGNATURE
// Must verify payment is legitimate before confirming booking
// ─────────────────────────────────────────────
import crypto from 'crypto'

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET!
  const body = `${orderId}|${paymentId}`
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex')

  return expectedSignature === signature
}

// ─────────────────────────────────────────────
// API RESPONSE HELPERS
// Standardized response format for all API routes
// ─────────────────────────────────────────────
export function apiSuccess<T>(data: T, message?: string) {
  return {
    success: true,
    message: message || 'Success',
    data,
  }
}

export function apiError(message: string, statusCode: number = 400) {
  return {
    success: false,
    message,
    data: null,
  }
}