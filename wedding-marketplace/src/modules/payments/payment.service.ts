// src/modules/payments/payment.service.ts
// Razorpay payment logic — Mongoose version

import Razorpay from 'razorpay'
import { connectDB } from '@/lib/db'
import { Booking, Payment, Payout, Vendor, AuditLog } from '@/models'
import { verifyRazorpaySignature, calculateCommission } from '@/lib/utils'
import { confirmBooking } from '@/modules/bookings/booking.service'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret',
})

// ─────────────────────────────────────────────
// CREATE RAZORPAY ORDER
// ─────────────────────────────────────────────

export async function createPaymentOrder(
  bookingId: string,
  customerId: string,
  paymentType: 'ADVANCE' | 'BALANCE'
) {
  await connectDB()

  const booking = await Booking.findOne({ _id: bookingId, customerId })
  if (!booking) throw new Error('Booking not found')
  if (booking.status !== 'ACCEPTED') throw new Error('Booking must be accepted before payment')

  const amount = paymentType === 'ADVANCE' ? booking.advanceAmount! : booking.balanceAmount!
  if (!amount || amount <= 0) throw new Error('Invalid payment amount')

  // Razorpay needs amount in PAISE (multiply rupees by 100)
  const razorpayOrder = await razorpay.orders.create({
    amount: amount * 100,
    currency: 'INR',
    receipt: `booking_${bookingId}_${paymentType}`,
    notes: { bookingId, customerId, paymentType },
  })

  const payment = await Payment.create({
    bookingId,
    razorpayOrderId: razorpayOrder.id,
    amount,
    status: 'PENDING',
    paymentType,
  })

  return {
    paymentId: payment._id.toString(),
    razorpayOrderId: razorpayOrder.id,
    amount,
    currency: 'INR',
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  }
}

// ─────────────────────────────────────────────
// VERIFY PAYMENT
// MUST verify signature — anyone can fake success on frontend
// ─────────────────────────────────────────────

export async function verifyPayment(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
) {
  await connectDB()

  // 1. Verify Razorpay signature
  const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)
  if (!isValid) throw new Error('Payment verification failed. Possible fraud attempt.')

  // 2. Find payment record
  const payment = await Payment.findOne({ razorpayOrderId })
  if (!payment) throw new Error('Payment record not found')
  if (payment.status === 'PAID') return payment.toObject() // Already processed

  // 3. Mark as paid
  await Payment.findByIdAndUpdate(payment._id, {
    status: 'PAID',
    razorpayPaymentId,
    razorpaySignature,
    paidAt: new Date(),
  })

  // 4. Confirm booking if advance payment
  if (payment.paymentType === 'ADVANCE') {
    await confirmBooking(payment.bookingId.toString())
  }

  // 5. Complete booking and schedule payout if balance payment
  if (payment.paymentType === 'BALANCE') {
    await Booking.findByIdAndUpdate(payment.bookingId, { status: 'COMPLETED' })
    await scheduleVendorPayout(payment.bookingId.toString())
  }

  return { message: 'Payment verified successfully' }
}

// ─────────────────────────────────────────────
// SCHEDULE VENDOR PAYOUT
// ─────────────────────────────────────────────

async function scheduleVendorPayout(bookingId: string) {
  const booking = await Booking.findById(bookingId)
  if (!booking) return

  const { commission, vendorEarning } = calculateCommission(booking.totalAmount)
  const { PAYOUT_DELAY_DAYS } = await import('@/config/constants')

  const scheduledAt = new Date()
  scheduledAt.setDate(scheduledAt.getDate() + PAYOUT_DELAY_DAYS)

  await Payout.create({
    vendorId: booking.vendorId,
    bookingId,
    grossAmount: booking.totalAmount,
    commissionAmount: commission,
    netAmount: vendorEarning,
    status: 'PENDING',
    scheduledAt,
  })
}

// ─────────────────────────────────────────────
// PROCESS REFUND
// ─────────────────────────────────────────────

export async function processRefund(paymentId: string, amount: number, adminId: string) {
  await connectDB()

  const payment = await Payment.findById(paymentId)
  if (!payment) throw new Error('Payment not found')
  if (payment.status !== 'PAID') throw new Error('Only paid payments can be refunded')
  if (!payment.razorpayPaymentId) throw new Error('No Razorpay payment ID found')

  const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
    amount: amount * 100,
    notes: { reason: 'Customer refund', adminId },
  })

  await Payment.findByIdAndUpdate(paymentId, {
    status: amount === payment.amount ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
    refundId: refund.id,
    refundAmount: amount,
  })

  await AuditLog.create({
    userId: adminId,
    action: 'PAYMENT_REFUNDED',
    entity: 'Payment',
    entityId: paymentId,
    details: { refundAmount: amount, refundId: refund.id },
  })

  return { message: `Refund of ₹${amount} initiated successfully` }
}