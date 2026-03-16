// src/modules/vendors/vendor.service.ts
// Vendor business logic — Mongoose version

import { connectDB } from '@/lib/db'
import { Vendor, Package, Availability, Booking } from '@/models'
import { generateSlug } from '@/lib/utils'
import type { VendorProfileInput, PackageInput, AvailabilityInput } from './vendor.schema'

// ─────────────────────────────────────────────
// CREATE VENDOR PROFILE
// ─────────────────────────────────────────────

export async function createVendorProfile(userId: string, input: VendorProfileInput) {
  await connectDB()

  const existing = await Vendor.findOne({ userId })
  if (existing) throw new Error('Vendor profile already exists')

  let slug = generateSlug(input.businessName)
  const slugExists = await Vendor.findOne({ slug })
  if (slugExists) slug = `${slug}-${Date.now().toString().slice(-4)}`

  const vendor = await Vendor.create({
    userId,
    slug,
    ...input,
    status: 'PENDING',
  })

  return vendor.populate(['categoryId'])
}

// ─────────────────────────────────────────────
// UPDATE VENDOR PROFILE
// ─────────────────────────────────────────────

export async function updateVendorProfile(
  vendorId: string,
  userId: string,
  input: Partial<VendorProfileInput>
) {
  await connectDB()

  const vendor = await Vendor.findOneAndUpdate(
    { _id: vendorId, userId },   // Must own it
    { $set: input },
    { new: true }                // Return updated document
  )

  if (!vendor) throw new Error('Vendor not found or unauthorized')
  return vendor
}

// ─────────────────────────────────────────────
// GET VENDOR BY SLUG (public profile)
// ─────────────────────────────────────────────

export async function getVendorBySlug(slug: string) {
  await connectDB()

  const vendor = await Vendor.findOne({ slug, status: 'APPROVED' })
    .populate('userId', 'name')
    .populate('categoryId')

  if (!vendor) throw new Error('Vendor not found')

  const [packages, reviews] = await Promise.all([
    Package.find({ vendorId: vendor._id, isActive: true }).sort({ price: 1 }),

    // Import Review model inline to avoid circular deps
    (await import('@/models')).Review
      .find({ vendorId: vendor._id, status: 'VISIBLE' })
      .populate('customerId', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(10),
  ])

  return { ...vendor.toObject(), packages, reviews }
}

// ─────────────────────────────────────────────
// GET VENDOR DASHBOARD
// ─────────────────────────────────────────────

export async function getVendorDashboard(userId: string) {
  await connectDB()

  const vendor = await Vendor.findOne({ userId })
  if (!vendor) {
    return {
      vendorId: null,
      status: 'PENDING',
      totalBookings: 0,
      pendingEnquiries: 0,
      confirmedBookings: 0,
      completedBookings: 0,
      averageRating: 0,
      totalReviews: 0,
      pendingPayouts: 0,
      needsProfileSetup: true
    }
  }

  const vendorId = vendor._id

  const [
    totalBookings,
    pendingEnquiries,
    confirmedBookings,
    completedBookings,
    payoutAgg,
  ] = await Promise.all([
    Booking.countDocuments({ vendorId }),
    Booking.countDocuments({ vendorId, status: 'ENQUIRY' }),
    Booking.countDocuments({ vendorId, status: 'CONFIRMED' }),
    Booking.countDocuments({ vendorId, status: 'COMPLETED' }),
    (await import('@/models')).Payout.aggregate([
      { $match: { vendorId, status: 'PENDING' } },
      { $group: { _id: null, total: { $sum: '$netAmount' } } },
    ]),
  ])

  return {
    vendorId: vendorId.toString(),
    status: vendor.status,
    totalBookings,
    pendingEnquiries,
    confirmedBookings,
    completedBookings,
    averageRating: vendor.averageRating,
    totalReviews: vendor.totalReviews,
    pendingPayouts: payoutAgg[0]?.total || 0,
  }
}

// ─────────────────────────────────────────────
// ADD PACKAGE
// ─────────────────────────────────────────────

export async function addPackage(vendorId: string, userId: string, input: PackageInput) {
  await connectDB()

  const vendor = await Vendor.findOne({ _id: vendorId, userId })
  if (!vendor) throw new Error('Unauthorized')

  const count = await Package.countDocuments({ vendorId, isActive: true })
  if (count >= 10) throw new Error('Maximum 10 packages allowed')

  return Package.create({ vendorId, ...input })
}

// ─────────────────────────────────────────────
// DELETE PACKAGE (soft delete)
// ─────────────────────────────────────────────

export async function deletePackage(packageId: string, userId: string) {
  await connectDB()

  const pkg = await Package.findById(packageId).populate('vendorId')
  if (!pkg) throw new Error('Package not found')

  const vendor = pkg.vendorId as any
  if (vendor.userId.toString() !== userId) throw new Error('Unauthorized')

  // Soft delete — keeps existing bookings intact
  return Package.findByIdAndUpdate(packageId, { isActive: false })
}

// ─────────────────────────────────────────────
// UPDATE PORTFOLIO IMAGES
// ─────────────────────────────────────────────

export async function updatePortfolioImages(vendorId: string, userId: string, images: string[]) {
  await connectDB()

  const { MAX_PORTFOLIO_IMAGES } = await import('@/config/constants')
  if (images.length > MAX_PORTFOLIO_IMAGES) {
    throw new Error(`Maximum ${MAX_PORTFOLIO_IMAGES} images allowed`)
  }

  const vendor = await Vendor.findOneAndUpdate(
    { _id: vendorId, userId },
    { $set: { portfolioImages: images } },
    { new: true }
  )

  if (!vendor) throw new Error('Unauthorized')
  return vendor
}

// ─────────────────────────────────────────────
// UPDATE AVAILABILITY
// ─────────────────────────────────────────────

export async function updateAvailability(
  vendorId: string,
  userId: string,
  input: AvailabilityInput
) {
  await connectDB()

  const vendor = await Vendor.findOne({ _id: vendorId, userId })
  if (!vendor) throw new Error('Unauthorized')

  // Upsert each date
  const ops = input.dates.map((dateStr) =>
    Availability.findOneAndUpdate(
      { vendorId, date: new Date(dateStr) },
      { isBlocked: input.isBlocked, note: input.note },
      { upsert: true, new: true }
    )
  )

  return Promise.all(ops)
}

// ─────────────────────────────────────────────
// CHECK DATE AVAILABILITY
// ─────────────────────────────────────────────

export async function isDateAvailable(vendorId: string, date: string): Promise<boolean> {
  await connectDB()

  const [blocked, confirmedBooking] = await Promise.all([
    Availability.findOne({ vendorId, date: new Date(date), isBlocked: true }),
    Booking.findOne({
      vendorId,
      eventDate: new Date(date),
      status: { $in: ['CONFIRMED', 'ACCEPTED'] },
    }),
  ])

  return !blocked && !confirmedBooking
}