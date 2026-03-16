// src/models/Payout.ts
// Payout records for vendor earnings
// Tracks when vendors withdraw their earnings from the platform

import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IPayout extends Document {
  _id: mongoose.Types.ObjectId
  vendorId: mongoose.Types.ObjectId
  bookingId?: mongoose.Types.ObjectId
  amount?: number
  grossAmount?: number
  commissionAmount?: number
  netAmount?: number
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  razorpayPayoutId?: string
  utrNumber?: string
  failureReason?: string
  requestedAt: Date
  scheduledAt?: Date
  processedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const PayoutSchema = new Schema<IPayout>(
  {
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking' },
    amount: { type: Number },
    grossAmount: { type: Number },
    commissionAmount: { type: Number },
    netAmount: { type: Number },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED'],
      default: 'PENDING',
    },
    razorpayPayoutId: String,
    utrNumber: String,
    failureReason: String,
    requestedAt: { type: Date, default: Date.now },
    scheduledAt: Date,
    processedAt: Date,
  },
  { timestamps: true }
)

PayoutSchema.index({ vendorId: 1 })
PayoutSchema.index({ status: 1 })

export const Payout: Model<IPayout> =
  mongoose.models.Payout || mongoose.model<IPayout>('Payout', PayoutSchema)
