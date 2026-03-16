// src/modules/bookings/booking.schema.ts

import { z } from 'zod'

export const bookingEnquirySchema = z.object({
  vendorId: z.string().min(1, 'Vendor ID required'),

  packageId: z.string().optional(),

  eventDate: z
    .string()
    .refine((date) => {
      const d = new Date(date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return d >= today
    }, 'Event date must be in the future'),

  eventType: z.string().min(1, 'Event type is required'),

  eventVenue: z.string().max(200).optional(),

  guestCount: z
    .number()
    .min(1)
    .max(10000)
    .optional(),

  specialRequests: z.string().max(1000).optional(),

  couponCode: z.string().optional(),
})

export const vendorResponseSchema = z.object({
  bookingId: z.string().min(1),
  action: z.enum(['ACCEPT', 'REJECT']),
  note: z.string().max(500).optional(),
  rejectionReason: z.string().max(500).optional(),
})

export const cancelBookingSchema = z.object({
  bookingId: z.string().min(1),
  reason: z.string().min(10, 'Please provide a reason').max(500),
})

export type BookingEnquiryInput = z.infer<typeof bookingEnquirySchema>
export type VendorResponseInput = z.infer<typeof vendorResponseSchema>
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>