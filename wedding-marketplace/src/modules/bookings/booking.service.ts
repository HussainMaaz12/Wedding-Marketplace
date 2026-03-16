// src/modules/bookings/booking.service.ts
// Booking flow — Mongoose version

import { connectDB } from '@/lib/db'
import { Booking, Vendor, Package, Coupon, CouponUsage, Payout, User } from '@/models'
import { calculateCommission, calculateAdvance, generateBookingNumber } from '@/lib/utils'
import { isDateAvailable } from '@/modules/vendors/vendor.service'
import { createNotification } from '@/modules/notifications/notification.service'
import { sendEmail } from '@/lib/email'
import type { BookingEnquiryInput, VendorResponseInput } from './booking.schema'

// ─────────────────────────────────────────────
// CREATE BOOKING ENQUIRY
// ─────────────────────────────────────────────

export async function createBookingEnquiry(customerId: string, input: BookingEnquiryInput) {
  await connectDB()

  const { vendorId, packageId, eventDate, couponCode, ...rest } = input

  // 1. Check vendor exists and is approved
  const vendor = await Vendor.findOne({ _id: vendorId })
  if (!vendor) throw new Error('Vendor not found or not available')

  // 2. Check date availability
  const available = await isDateAvailable(vendorId, eventDate)
  if (!available) throw new Error('Vendor is not available on this date')

  // 3. Check no duplicate booking
  const duplicate = await Booking.findOne({
    customerId,
    vendorId,
    eventDate: new Date(eventDate),
    status: { $nin: ['CANCELLED', 'REJECTED'] },
  })
  if (duplicate) throw new Error('You already have a booking with this vendor on this date')

  // 4. Get price
  let totalAmount = 0
  if (packageId) {
    const pkg = await Package.findOne({ _id: packageId, vendorId, isActive: true })
    if (!pkg) throw new Error('Package not found')
    totalAmount = pkg.price
  } else {
    totalAmount = vendor.startingPrice || 0
  }

  // 5. Apply coupon
  let discount = 0
  let couponData: any = null
  if (couponCode && totalAmount > 0) {
    couponData = await applyCoupon(couponCode, customerId, totalAmount)
    discount = couponData.discount
  }

  const finalAmount = totalAmount - discount
  const { commission, vendorEarning } = calculateCommission(finalAmount)
  const { advance, balance } = calculateAdvance(finalAmount)

  // 6. Create booking
  const booking = await Booking.create({
    bookingNumber: generateBookingNumber(),
    customerId,
    vendorId,
    packageId: packageId || undefined,
    eventDate: new Date(eventDate),
    totalAmount: finalAmount,
    advanceAmount: advance,
    balanceAmount: balance,
    commissionAmount: commission,
    vendorEarning,
    status: 'ENQUIRY',
    ...rest,
  })

  // 7. Record coupon usage
  if (couponData) {
    await CouponUsage.create({
      couponId: couponData.couponId,
      bookingId: booking._id,
      userId: customerId,
      discount,
    })
    await Coupon.findByIdAndUpdate(couponData.couponId, { $inc: { usageCount: 1 } })
  }

  // 8. Notify vendor
  await createNotification({
    userId: vendor.userId.toString(),
    title: 'New Booking Enquiry!',
    message: `You have a new enquiry for ${rest.eventType} on ${eventDate}`,
    type: 'BOOKING_ENQUIRY',
    link: `/vendor/bookings/${booking._id}`,
  })

  // 9. Send Email Notifications
  const customer = await User.findById(customerId)
  const vendorUser = await User.findById(vendor.userId)

  if (customer && vendorUser) {
    await Promise.all([
      sendEmail({
        to: vendorUser.email,
        subject: 'New Booking Enquiry - Wedding Marketplace',
        body: `Hello ${vendor.businessName},\n\nYou have received a new booking enquiry from ${customer.name} for their ${rest.eventType} on ${eventDate}.\n\nTotal Value: ₹${finalAmount}\n\nPlease review it in your Vendor Dashboard.`
      }),
      sendEmail({
        to: customer.email,
        subject: 'Enquiry Received - Wedding Marketplace',
        body: `Hello ${customer.name},\n\nYour enquiry has been successfully sent to ${vendor.businessName}. We will notify you once they review it.\n\nBooking Reference: ${booking.bookingNumber}`
      })
    ])
  }

  return booking
}

// ─────────────────────────────────────────────
// VENDOR RESPONDS TO ENQUIRY
// ─────────────────────────────────────────────

export async function respondToEnquiry(vendorUserId: string, input: VendorResponseInput) {
  await connectDB()

  const { bookingId, action, note, rejectionReason } = input

  // Find booking belonging to this vendor user
  const vendor = await Vendor.findOne({ userId: vendorUserId })
  if (!vendor) throw new Error('Vendor not found')

  const booking = await Booking.findOne({
    _id: bookingId,
    vendorId: vendor._id,
    status: 'ENQUIRY',
  }).populate('customerId', '_id name')

  if (!booking) throw new Error('Booking not found or already responded')

  const newStatus = action === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED'

  await Booking.findByIdAndUpdate(bookingId, {
    status: newStatus,
    vendorNote: note,
    rejectionReason: action === 'REJECT' ? rejectionReason : undefined,
  })

  const customer = booking.customerId as any

  await createNotification({
    userId: customer._id.toString(),
    title: action === 'ACCEPT' ? 'Booking Accepted!' : 'Booking Rejected',
    message: action === 'ACCEPT'
      ? 'Your enquiry was accepted! Complete payment to confirm your booking.'
      : `Your enquiry was rejected. ${rejectionReason || ''}`,
    type: action === 'ACCEPT' ? 'BOOKING_ACCEPTED' : 'BOOKING_REJECTED',
    link: `/bookings/${bookingId}`,
  })

  await sendEmail({
    to: customer.email,
    subject: `Booking ${action === 'ACCEPT' ? 'Accepted' : 'Declined'} - Wedding Marketplace`,
    body: `Hello ${customer.name},\n\n${vendor.businessName} has ${action === 'ACCEPT' ? 'accepted' : 'declined'} your booking enquiry.\n\n${action === 'ACCEPT' ? 'Please log in to your dashboard to pay the advance and confirm your booking.' : `Reason: ${rejectionReason || 'Not available'}`}`
  })

  return { message: `Booking ${newStatus.toLowerCase()} successfully` }
}

// ─────────────────────────────────────────────
// CONFIRM BOOKING (after payment)
// ─────────────────────────────────────────────

export async function confirmBooking(bookingId: string) {
  await connectDB()

  const booking = await Booking.findByIdAndUpdate(
    bookingId,
    { status: 'CONFIRMED' },
    { new: true }
  ).populate('vendorId customerId', '_id userId')

  if (!booking) throw new Error('Booking not found')

  // Increment vendor booking count
  await Vendor.findByIdAndUpdate(booking.vendorId, { $inc: { totalBookings: 1 } })

  const customer = booking.customerId as any
  const vendor = booking.vendorId as any

  await Promise.all([
    createNotification({
      userId: customer._id.toString(),
      title: 'Booking Confirmed!',
      message: 'Your booking is confirmed.',
      type: 'BOOKING_CONFIRMED',
      link: `/bookings/${bookingId}`,
    }),
    createNotification({
      userId: vendor.userId.toString(),
      title: 'Booking Confirmed!',
      message: 'Payment received. Booking is confirmed.',
      type: 'BOOKING_CONFIRMED',
      link: `/vendor/bookings/${bookingId}`,
    }),
  ])

  // Get users for email
  const customerUser = await User.findById(customer._id)
  const vendorUser = await User.findById(vendor.userId)

  if (customerUser && vendorUser) {
    await Promise.all([
      sendEmail({
        to: customerUser.email,
        subject: 'Payment Successful! Booking Confirmed',
        body: `Hello ${customerUser.name},\n\nWe have received your advance payment. Your booking with ${vendor.businessName} is now confirmed for ${booking.eventDate.toDateString()}.\n\nBooking Reference: ${booking.bookingNumber}`
      }),
      sendEmail({
        to: vendorUser.email,
        subject: 'Advance Received! Booking Confirmed',
        body: `Hello ${vendor.businessName},\n\nAdvance payment has been received from ${customerUser.name}. The booking is now confirmed.\n\nBooking Reference: ${booking.bookingNumber}`
      })
    ])
  }

  return booking
}

// ─────────────────────────────────────────────
// CANCEL BOOKING
// ─────────────────────────────────────────────

export async function cancelBooking(userId: string, bookingId: string, reason: string) {
  await connectDB()

  const vendor = await Vendor.findOne({ userId })

  const booking = await Booking.findOne({
    _id: bookingId,
    $or: [
      { customerId: userId },
      ...(vendor ? [{ vendorId: vendor._id }] : []),
    ],
    status: { $nin: ['COMPLETED', 'CANCELLED', 'REJECTED'] },
  }).populate('customerId vendorId', '_id userId')

  if (!booking) throw new Error('Booking not found or cannot be cancelled')

  await Booking.findByIdAndUpdate(bookingId, { status: 'CANCELLED' })

  const customer = booking.customerId as any
  const bookingVendor = booking.vendorId as any

  const notifyUserId =
    userId === customer._id.toString()
      ? bookingVendor.userId.toString()
      : customer._id.toString()

  await createNotification({
    userId: notifyUserId,
    title: 'Booking Cancelled',
    message: `Booking was cancelled. Reason: ${reason}`,
    type: 'BOOKING_CANCELLED',
    link: `/bookings/${bookingId}`,
  })

  return { message: 'Booking cancelled successfully' }
}

// ─────────────────────────────────────────────
// GET CUSTOMER BOOKINGS
// ─────────────────────────────────────────────

export async function getCustomerBookings(customerId: string, page = 1, limit = 10) {
  await connectDB()

  const skip = (page - 1) * limit

  const [bookings, total] = await Promise.all([
    Booking.find({ customerId })
      .populate('vendorId', 'businessName coverImage slug')
      .populate('packageId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Booking.countDocuments({ customerId }),
  ])

  return { bookings, total }
}

// ─────────────────────────────────────────────
// GET VENDOR BOOKINGS
// ─────────────────────────────────────────────

export async function getVendorBookings(
  vendorUserId: string,
  status?: string,
  page = 1,
  limit = 10
) {
  await connectDB()

  const vendor = await Vendor.findOne({ userId: vendorUserId })
  if (!vendor) throw new Error('Vendor not found')

  const skip = (page - 1) * limit
  const query: any = { vendorId: vendor._id }
  if (status) query.status = status

  const [bookings, total] = await Promise.all([
    Booking.find(query)
      .populate('customerId', 'name email phone')
      .populate('packageId', 'name price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Booking.countDocuments(query),
  ])

  return { bookings, total }
}

// ─────────────────────────────────────────────
// APPLY COUPON (internal helper)
// ─────────────────────────────────────────────

async function applyCoupon(code: string, userId: string, totalAmount: number) {
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true })
  if (!coupon) throw new Error('Invalid coupon code')

  const now = new Date()
  if (now < coupon.validFrom || now > coupon.validUntil) throw new Error('Coupon has expired')

  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    throw new Error('Coupon has reached its usage limit')
  }

  if (coupon.minOrderAmount && totalAmount < coupon.minOrderAmount) {
    throw new Error(`Minimum amount for this coupon is ₹${coupon.minOrderAmount}`)
  }

  if (coupon.perUserLimit) {
    const userCount = await CouponUsage.countDocuments({ couponId: coupon._id, userId })
    if (userCount >= coupon.perUserLimit) throw new Error('You have already used this coupon')
  }

  let discount = 0
  if (coupon.type === 'PERCENTAGE') {
    discount = Math.round((totalAmount * coupon.value) / 100)
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount)
  } else {
    discount = coupon.value
  }

  return { couponId: coupon._id, discount }
}