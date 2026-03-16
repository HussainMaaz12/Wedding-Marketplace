// src/modules/reviews/review.service.ts
// Review system — Mongoose version

import { connectDB } from '@/lib/db'
import { Review, Booking, Vendor, AuditLog } from '@/models'

export async function createReview(
  customerId: string,
  input: {
    bookingId: string
    rating: number
    title?: string
    comment: string
    photos?: string[]
  }
) {
  await connectDB()
  const { bookingId, rating, title, comment, photos } = input

  const booking = await Booking.findOne({ _id: bookingId, customerId, status: 'COMPLETED' })
  if (!booking) throw new Error('Can only review after booking is completed')

  const existing = await Review.findOne({ bookingId })
  if (existing) throw new Error('You have already reviewed this booking')

  const { REVIEW_WINDOW_DAYS } = await import('@/config/constants')
  const daysSince = (Date.now() - booking.eventDate.getTime()) / (1000 * 60 * 60 * 24)
  if (daysSince > REVIEW_WINDOW_DAYS) {
    throw new Error(`Review window closed (${REVIEW_WINDOW_DAYS} days after event)`)
  }

  const review = await Review.create({
    bookingId,
    customerId,
    vendorId: booking.vendorId,
    rating,
    title,
    comment,
    photos: photos || [],
  })

  await updateVendorRating(booking.vendorId.toString())
  return review
}

export async function replyToReview(vendorUserId: string, reviewId: string, reply: string) {
  await connectDB()

  const vendor = await (await import('@/models')).Vendor.findOne({ userId: vendorUserId })
  if (!vendor) throw new Error('Vendor not found')

  const review = await Review.findOne({
    _id: reviewId,
    vendorId: vendor._id,
    vendorReply: { $exists: false },
  })
  if (!review) throw new Error('Review not found or already replied')

  return Review.findByIdAndUpdate(reviewId, {
    vendorReply: reply,
    vendorRepliedAt: new Date(),
  }, { new: true })
}

export async function getVendorReviews(vendorId: string, page = 1, limit = 10) {
  await connectDB()

  const skip = (page - 1) * limit

  const [reviews, total, ratingStats] = await Promise.all([
    Review.find({ vendorId, status: 'VISIBLE' })
      .populate('customerId', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Review.countDocuments({ vendorId, status: 'VISIBLE' }),

    Review.aggregate([
      { $match: { vendorId: new (require('mongoose').Types.ObjectId)(vendorId), status: 'VISIBLE' } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
    ]),
  ])

  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
    stars: star,
    count: ratingStats.find((r: any) => r._id === star)?.count || 0,
  }))

  return { reviews, total, ratingBreakdown }
}

export async function flagReview(reviewId: string, reportedById: string) {
  await connectDB()
  await Review.findByIdAndUpdate(reviewId, { status: 'FLAGGED' })
  await AuditLog.create({
    userId: reportedById,
    action: 'REVIEW_FLAGGED',
    entity: 'Review',
    entityId: reviewId,
  })
}

export async function adminHideReview(reviewId: string, adminId: string, reason: string) {
  await connectDB()

  const review = await Review.findByIdAndUpdate(
    reviewId,
    { status: 'HIDDEN', adminNote: reason },
    { new: true }
  )

  if (review) await updateVendorRating(review.vendorId.toString())

  await AuditLog.create({
    userId: adminId,
    action: 'REVIEW_HIDDEN',
    entity: 'Review',
    entityId: reviewId,
    details: { reason },
  })
}

async function updateVendorRating(vendorId: string) {
  const stats = await Review.aggregate([
    { $match: { vendorId: new (require('mongoose').Types.ObjectId)(vendorId), status: 'VISIBLE' } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ])

  const avg = stats[0]?.avg || 0
  const count = stats[0]?.count || 0

  await Vendor.findByIdAndUpdate(vendorId, {
    averageRating: Math.round(avg * 10) / 10,
    totalReviews: count,
  })
}