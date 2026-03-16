// src/models/Review.ts
// Customer reviews for vendors — only allowed after booking is COMPLETED

import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IReview extends Document {
  _id: mongoose.Types.ObjectId
  bookingId: mongoose.Types.ObjectId
  customerId: mongoose.Types.ObjectId
  vendorId: mongoose.Types.ObjectId
  rating: number          // 1–5
  title?: string
  comment: string
  photos: string[]
  status: 'VISIBLE' | 'HIDDEN' | 'FLAGGED'
  adminNote?: string
  vendorReply?: string
  vendorRepliedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const ReviewSchema = new Schema<IReview>(
  {
    bookingId:  { type: Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User',    required: true },
    vendorId:   { type: Schema.Types.ObjectId, ref: 'Vendor',  required: true },
    rating: {
      type: Number,
      required: true,
      min: [1, 'Minimum rating is 1'],
      max: [5, 'Maximum rating is 5'],
    },
    title:   String,
    comment: { type: String, required: true },
    photos:  [String],
    status: {
      type: String,
      enum: ['VISIBLE', 'HIDDEN', 'FLAGGED'],
      default: 'VISIBLE',
    },
    adminNote:       String,
    vendorReply:     String,
    vendorRepliedAt: Date,
  },
  { timestamps: true }
)

ReviewSchema.index({ vendorId: 1, status: 1 })    // Fetch vendor reviews
ReviewSchema.index({ customerId: 1 })

export const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema)