// src/config/constants.ts
// All fixed values used across the app
// Change values here — they update everywhere automatically

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'WeddingConnect'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// ─────────────────────────────────────────────
// BUSINESS RULES
// ─────────────────────────────────────────────

export const COMMISSION_PERCENTAGE = Number(process.env.COMMISSION_PERCENTAGE) || 10
export const ADVANCE_PAYMENT_PERCENTAGE = Number(process.env.ADVANCE_PAYMENT_PERCENTAGE) || 30

// How many days after event completion before vendor gets paid
export const PAYOUT_DELAY_DAYS = 7

// How many days customer has to leave a review after event
export const REVIEW_WINDOW_DAYS = 30

// ─────────────────────────────────────────────
// PAGINATION
// ─────────────────────────────────────────────

export const DEFAULT_PAGE_SIZE = 12
export const MAX_PAGE_SIZE = 50

// ─────────────────────────────────────────────
// FILE UPLOADS
// ─────────────────────────────────────────────

export const MAX_PORTFOLIO_IMAGES = 20
export const MAX_IMAGE_SIZE_MB = 5
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// ─────────────────────────────────────────────
// VENDOR CATEGORIES
// These are your default categories - can be managed from admin later
// ─────────────────────────────────────────────

export const DEFAULT_CATEGORIES = [
  { name: 'Wedding Photography', slug: 'wedding-photography', icon: '📸' },
  { name: 'Wedding Videography', slug: 'wedding-videography', icon: '🎥' },
  { name: 'Catering', slug: 'catering', icon: '🍽️' },
  { name: 'Decoration & Florist', slug: 'decoration-florist', icon: '💐' },
  { name: 'Makeup Artist', slug: 'makeup-artist', icon: '💄' },
  { name: 'Mehendi Artist', slug: 'mehendi-artist', icon: '🌿' },
  { name: 'Wedding Band / DJ', slug: 'band-dj', icon: '🎶' },
  { name: 'Wedding Venue', slug: 'wedding-venue', icon: '🏛️' },
  { name: 'Wedding Planner', slug: 'wedding-planner', icon: '📋' },
  { name: 'Invitation Cards', slug: 'invitation-cards', icon: '💌' },
]

// ─────────────────────────────────────────────
// EVENT TYPES
// ─────────────────────────────────────────────

export const EVENT_TYPES = [
  'Wedding',
  'Engagement',
  'Reception',
  'Sangeet',
  'Mehendi',
  'Birthday Party',
  'Corporate Event',
  'Baby Shower',
  'Anniversary',
  'Other',
]

// ─────────────────────────────────────────────
// INDIAN STATES (for location filtering)
// ─────────────────────────────────────────────

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
  'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh',
]

// ─────────────────────────────────────────────
// BOOKING STATUS LABELS (for display)
// ─────────────────────────────────────────────

export const BOOKING_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  ENQUIRY:   { label: 'Enquiry Sent',   color: 'blue' },
  ACCEPTED:  { label: 'Accepted',       color: 'yellow' },
  CONFIRMED: { label: 'Confirmed',      color: 'green' },
  COMPLETED: { label: 'Completed',      color: 'purple' },
  CANCELLED: { label: 'Cancelled',      color: 'gray' },
  REJECTED:  { label: 'Rejected',       color: 'red' },
}

// ─────────────────────────────────────────────
// NOTIFICATION TYPES
// ─────────────────────────────────────────────

export const NOTIFICATION_TYPES = {
  BOOKING_ENQUIRY:    'BOOKING_ENQUIRY',
  BOOKING_ACCEPTED:   'BOOKING_ACCEPTED',
  BOOKING_REJECTED:   'BOOKING_REJECTED',
  BOOKING_CONFIRMED:  'BOOKING_CONFIRMED',
  BOOKING_COMPLETED:  'BOOKING_COMPLETED',
  BOOKING_CANCELLED:  'BOOKING_CANCELLED',
  PAYMENT_RECEIVED:   'PAYMENT_RECEIVED',
  REVIEW_RECEIVED:    'REVIEW_RECEIVED',
  VENDOR_APPROVED:    'VENDOR_APPROVED',
  VENDOR_REJECTED:    'VENDOR_REJECTED',
  PAYOUT_PROCESSED:   'PAYOUT_PROCESSED',
} as const
