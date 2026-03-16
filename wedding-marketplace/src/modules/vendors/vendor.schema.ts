// src/modules/vendors/vendor.schema.ts
// Validation for vendor-related forms

import { z } from 'zod'

// ─────────────────────────────────────────────
// VENDOR PROFILE SETUP SCHEMA
// ─────────────────────────────────────────────

export const vendorProfileSchema = z.object({
  businessName: z
    .string()
    .min(3, 'Business name must be at least 3 characters')
    .max(100, 'Business name too long'),

  categoryId: z
    .string()
    .min(1, 'Please select a category'),

  description: z
    .string()
    .min(50, 'Description must be at least 50 characters')
    .max(2000, 'Description too long'),

  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  address: z.string().optional(),

  businessPhone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit mobile number')
    .optional()
    .or(z.literal('')),

  businessEmail: z
    .string()
    .email('Enter valid email')
    .optional()
    .or(z.literal('')),

  website: z
    .string()
    .url('Enter valid URL (with https://)')
    .optional()
    .or(z.literal('')),

  startingPrice: z
    .number()
    .min(1000, 'Starting price must be at least ₹1,000')
    .max(10000000, 'Price too high')
    .optional(),
})

// ─────────────────────────────────────────────
// PACKAGE SCHEMA
// ─────────────────────────────────────────────

export const packageSchema = z.object({
  name: z
    .string()
    .min(3, 'Package name required')
    .max(100),

  description: z.string().max(500).optional(),

  price: z
    .number()
    .min(500, 'Minimum price is ₹500'),

  includes: z
    .array(z.string().min(1))
    .min(1, 'Add at least one inclusion')
    .max(20, 'Maximum 20 inclusions'),
})

// ─────────────────────────────────────────────
// AVAILABILITY UPDATE SCHEMA
// ─────────────────────────────────────────────

export const availabilitySchema = z.object({
  dates: z.array(z.string()),  // Array of ISO date strings
  isBlocked: z.boolean(),
  note: z.string().max(100).optional(),
})

export type VendorProfileInput = z.infer<typeof vendorProfileSchema>
export type PackageInput = z.infer<typeof packageSchema>
export type AvailabilityInput = z.infer<typeof availabilitySchema>