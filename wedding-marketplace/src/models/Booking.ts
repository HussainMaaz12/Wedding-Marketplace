// src/models/Booking.ts
// Core transaction record — every booking between customer and vendor

import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IBooking extends Document {
  _id: mongoose.Types.ObjectId
  bookingNumber: string
  customerId: mongoose.Types.ObjectId
  vendorId: mongoose.Types.ObjectId
  packageId?: mongoose.Types.ObjectId

  // Event details
  eventDate: Date
  eventType: string
  eventVenue?: string
  guestCount?: number
  specialRequests?: string

  // Pricing
  totalAmount: number
  advanceAmount?: number
  balanceAmount?: number
  commissionAmount?: number
  vendorEarning?: number

  // Status flow: ENQUIRY → ACCEPTED → CONFIRMED → COMPLETED
  status: 'ENQUIRY' | 'ACCEPTED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'REJECTED'

  vendorNote?: string
  rejectionReason?: string

  createdAt: Date
  updatedAt: Date
}

const BookingSchema = new Schema<IBooking>(
  {
    bookingNumber: { type: String, unique: true },
    customerId:    { type: Schema.Types.ObjectId, ref: 'User',    required: true },
    vendorId:      { type: Schema.Types.ObjectId, ref: 'Vendor',  required: true },
    packageId:     { type: Schema.Types.ObjectId, ref: 'Package' },

    eventDate:       { type: Date, required: true },
    eventType:       { type: String, required: true },
    eventVenue:      String,
    guestCount:      Number,
    specialRequests: String,

    totalAmount:      { type: Number, default: 0 },
    advanceAmount:    Number,
    balanceAmount:    Number,
    commissionAmount: Number,
    vendorEarning:    Number,

    status: {
      type: String,
      enum: ['ENQUIRY', 'ACCEPTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'REJECTED'],
      default: 'ENQUIRY',
    },

    vendorNote:      String,
    rejectionReason: String,
  },
  { timestamps: true }
)

BookingSchema.index({ customerId: 1, createdAt: -1 })   // Customer's booking list
BookingSchema.index({ vendorId: 1, status: 1 })          // Vendor's booking list by status
BookingSchema.index({ eventDate: 1, vendorId: 1 })       // Check date availability

export const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema)