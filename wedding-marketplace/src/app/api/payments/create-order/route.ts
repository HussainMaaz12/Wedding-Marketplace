import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { getServerSession } from '@/lib/auth'
import { Booking, Payment } from '@/models'
import { razorpay } from '@/lib/razorpay'
import { apiSuccess, apiError } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(req)
    if (!session) {
      return NextResponse.json(apiError('Please login first'), { status: 401 })
    }

    await connectDB()

    const { bookingId } = await req.json()
    if (!bookingId) {
      return NextResponse.json(apiError('Booking ID is required'), { status: 400 })
    }

    // 1. Fetch Booking and verify ownership & status
    const booking = await Booking.findOne({
      _id: bookingId,
      customerId: session.id,
      status: 'ACCEPTED'
    })

    if (!booking) {
      return NextResponse.json(apiError('Booking not found or not in ACCEPTED state'), { status: 404 })
    }

    if (!booking.advanceAmount || booking.advanceAmount <= 0) {
      return NextResponse.json(apiError('Advance amount is invalid'), { status: 400 })
    }

    // Razorpay amount is in paise (smallest currency unit, e.g. multiply by 100 for INR)
    const amountInPaise = Math.round(booking.advanceAmount * 100)

    // 2. Create Order on Razorpay
    const orderOptions = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_booking_${booking._id.toString()}`,
      payment_capture: 1 // Auto capture
    }

    const order = await razorpay.orders.create(orderOptions)

    // 3. Create or Update existing Pending Payment record in our DB
    let payment = await Payment.findOne({
      bookingId: booking._id,
      paymentType: 'ADVANCE',
      status: 'PENDING'
    })

    if (payment) {
      // Update existing pending payment with new order ID
      payment.razorpayOrderId = order.id
      payment.amount = booking.advanceAmount
      await payment.save()
    } else {
      // Create new payment record
      payment = await Payment.create({
        bookingId: booking._id,
        razorpayOrderId: order.id,
        amount: booking.advanceAmount,
        paymentType: 'ADVANCE',
        status: 'PENDING'
      })
    }

    // 4. Return Order details to frontend
    return NextResponse.json(apiSuccess({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    }))

  } catch (error: any) {
    console.error('Create Order Error:', error)
    return NextResponse.json(apiError(error.message || 'Failed to create payment order'), { status: 500 })
  }
}
