// src/models/Coupon.ts
// Discount coupons — PERCENTAGE or FIXED amount off

import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ICoupon extends Document {
  _id: mongoose.Types.ObjectId
  code: string          // "WEDDING20"
  type: 'PERCENTAGE' | 'FIXED'
  value: number         // 20 for 20% off  OR  500 for ₹500 off
  minOrderAmount?: number
  maxDiscount?: number  // Cap for percentage coupons
  usageLimit?: number
  usageCount: number
  perUserLimit?: number
  isActive: boolean
  validFrom: Date
  validUntil: Date
  createdAt: Date
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    type: { type: String, enum: ['PERCENTAGE', 'FIXED'], required: true },
    value: { type: Number, required: true, min: 0 },
    minOrderAmount: Number,
    maxDiscount:    Number,
    usageLimit:     Number,
    usageCount:     { type: Number, default: 0 },
    perUserLimit:   Number,
    isActive:       { type: Boolean, default: true },
    validFrom:      { type: Date, required: true },
    validUntil:     { type: Date, required: true },
  },
  { timestamps: true }
)

export const Coupon: Model<ICoupon> =
  mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', CouponSchema)