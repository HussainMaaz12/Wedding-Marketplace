// src/models/CouponUsage.ts
// Tracks who used which coupon to prevent re-use

import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ICouponUsage extends Document {
  couponId: mongoose.Types.ObjectId
  bookingId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  discount: number   // Actual discount amount applied in ₹
  usedAt: Date
}

const CouponUsageSchema = new Schema<ICouponUsage>({
  couponId:  { type: Schema.Types.ObjectId, ref: 'Coupon',  required: true },
  bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
  userId:    { type: Schema.Types.ObjectId, ref: 'User',    required: true },
  discount:  { type: Number, required: true },
  usedAt:    { type: Date, default: Date.now },
})

CouponUsageSchema.index({ couponId: 1, userId: 1 })   // Check per-user usage

export const CouponUsage: Model<ICouponUsage> =
  mongoose.models.CouponUsage ||
  mongoose.model<ICouponUsage>('CouponUsage', CouponUsageSchema)