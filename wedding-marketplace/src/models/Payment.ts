// src/models/Payment.ts
// Each payment attempt linked to a booking
// One booking can have 2 payments: advance + balance

import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IPayment extends Document {
  _id: mongoose.Types.ObjectId
  bookingId: mongoose.Types.ObjectId
  razorpayOrderId?: string
  razorpayPaymentId?: string
  razorpaySignature?: string
  amount: number
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED'
  paymentType: 'ADVANCE' | 'BALANCE'
  failureReason?: string
  refundId?: string
  refundAmount?: number
  paidAt?: Date
  createdAt: Date
  updatedAt: Date
}

const PaymentSchema = new Schema<IPayment>(
  {
    bookingId:           { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
    razorpayOrderId:     { type: String, sparse: true },   // sparse = unique but allows nulls
    razorpayPaymentId:   { type: String, sparse: true },
    razorpaySignature:   String,
    amount:              { type: Number, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED'],
      default: 'PENDING',
    },
    paymentType: {
      type: String,
      enum: ['ADVANCE', 'BALANCE'],
      required: true,
    },
    failureReason: String,
    refundId:      String,
    refundAmount:  Number,
    paidAt:        Date,
  },
  { timestamps: true }
)

PaymentSchema.index({ bookingId: 1 })
PaymentSchema.index({ razorpayOrderId: 1 }, { sparse: true })

export const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema)