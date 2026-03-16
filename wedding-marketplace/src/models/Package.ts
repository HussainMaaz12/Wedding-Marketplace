// src/models/Package.ts
// Service packages offered by vendors
// e.g., "Basic ₹25,000" or "Premium ₹75,000"

import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IPackage extends Document {
  _id: mongoose.Types.ObjectId
  vendorId: mongoose.Types.ObjectId
  name: string
  description?: string
  price: number
  includes: string[]   // ["8 hours", "2 photographers", "500 photos"]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const PackageSchema = new Schema<IPackage>(
  {
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    name:        { type: String, required: true, trim: true },
    description: { type: String },
    price: {
      type: Number,
      required: true,
      min: [500, 'Minimum price is ₹500'],
    },
    includes: [String],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

PackageSchema.index({ vendorId: 1 })

export const Package: Model<IPackage> =
  mongoose.models.Package || mongoose.model<IPackage>('Package', PackageSchema)