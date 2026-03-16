import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { getServerSession } from '@/lib/auth'
import { Booking, Payment } from '@/models'
import crypto from 'crypto'
import { apiSuccess, apiError } from '@/lib/utils'
import { confirmBooking } from '@/modules/bookings/booking.service'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(req)
    if (!session) {
      return NextResponse.json(apiError('Please login first'), { status: 401 })
    }

    await connectDB()

    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      bookingId 
    } = await req.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
      return NextResponse.json(apiError('Missing required payment verification details'), { status: 400 })
    }

    // 1. Validate Signature
    const secret = process.env.RAZORPAY_KEY_SECRET || ''
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex')

    if (generated_signature !== razorpay_signature) {
      // Signature mismatch - Log failed attempt
      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { 
          status: 'FAILED', 
          failureReason: 'Signature mismatch during verification' 
        }
      )
      return NextResponse.json(apiError('Payment verification failed! Invalid signature.'), { status: 400 })
    }

    // 2. Mark Payment as PAID
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'PAID',
        paidAt: new Date(),
      },
      { new: true }
    )

    if (!payment) {
      return NextResponse.json(apiError('Payment record not found'), { status: 404 })
    }

    // 3. Trigger Booking Confirmation Service
    // This handles updating Booking to CONFIRMED and sending notifications
    await confirmBooking(bookingId)

    return NextResponse.json(apiSuccess({
      message: 'Payment verified successfully. Booking is now confirmed!',
      paymentId: payment._id
    }))

  } catch (error: any) {
    console.error('Payment Verification Error:', error)
    return NextResponse.json(apiError(error.message || 'Failed to verify payment'), { status: 500 })
  }
}
