// src/models/Vendor.ts
// Extended profile for vendor users
// One vendor per user account

import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IVendor extends Document {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  businessName: string
  slug: string
  categoryId: mongoose.Types.ObjectId
  description?: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'

  // Location
  city: string
  state: string
  address?: string
  latitude?: number
  longitude?: number

  // Contact
  businessPhone?: string
  businessEmail?: string
  website?: string

  // Media
  coverImage?: string
  portfolioImages: string[]

  // Pricing
  startingPrice?: number

  // Stats (updated automatically)
  totalBookings: number
  averageRating: number
  totalReviews: number

  // Platform flags
  isFeatured: boolean
  isVerified: boolean
  verifiedAt?: Date

  // Admin notes
  rejectionReason?: string

  createdAt: Date
  updatedAt: Date
}

const VendorSchema = new Schema<IVendor>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,         // One vendor profile per user
    },
    businessName:  { type: String, required: true, trim: true },
    slug:          { type: String, required: true, unique: true, lowercase: true },
    categoryId:    { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    description:   { type: String },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'],
      default: 'PENDING',
    },

    // Location
    city:      { type: String, required: true },
    state:     { type: String, required: true },
    address:   String,
    latitude:  Number,
    longitude: Number,

    // Contact
    businessPhone: String,
    businessEmail: String,
    website:       String,

    // Media
    coverImage:      String,
    portfolioImages: [String],  // Array of image URLs

    // Pricing
    startingPrice: Number,

    // Stats
    totalBookings: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalReviews:  { type: Number, default: 0 },

    // Platform
    isFeatured:   { type: Boolean, default: false },
    isVerified:   { type: Boolean, default: false },
    verifiedAt:   Date,

    rejectionReason: String,
  },
  { timestamps: true }
)

// Index for fast search queries
VendorSchema.index({ city: 1, status: 1 })            // Search by city
VendorSchema.index({ categoryId: 1, status: 1 })      // Search by category
VendorSchema.index({ averageRating: -1 })              // Sort by rating
VendorSchema.index({ isFeatured: -1, totalBookings: -1 }) // Featured first

export const Vendor: Model<IVendor> =
  mongoose.models.Vendor || mongoose.model<IVendor>('Vendor', VendorSchema)