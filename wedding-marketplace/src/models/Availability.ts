// src/models/Availability.ts
// Tracks blocked dates for vendors (holidays, other bookings, etc.)

import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IAvailability extends Document {
  vendorId: mongoose.Types.ObjectId
  date: Date
  isBlocked: boolean
  note?: string
  createdAt: Date
}

const AvailabilitySchema = new Schema<IAvailability>(
  {
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
    date:      { type: Date, required: true },
    isBlocked: { type: Boolean, default: true },
    note:      String,
  },
  { timestamps: true }
)

// Compound unique index: vendor can't have same date twice
AvailabilitySchema.index({ vendorId: 1, date: 1 }, { unique: true })

export const Availability: Model<IAvailability> =
  mongoose.models.Availability ||
  mongoose.model<IAvailability>('Availability', AvailabilitySchema)