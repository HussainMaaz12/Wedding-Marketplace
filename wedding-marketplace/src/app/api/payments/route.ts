// src/app/api/payments/route.ts
// POST /api/payments/order  → Create Razorpay order
// POST /api/payments/verify → Verify payment after user pays

import { NextRequest, NextResponse } from 'next/server'
import { createPaymentOrder, verifyPayment } from '@/modules/payments/payment.service'
import { apiSuccess, apiError } from '@/lib/utils'
import { getServerSession } from '@/lib/auth'

// Create payment order
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(req)
    if (!session) {
      return NextResponse.json(apiError('Please login first'), { status: 401 })
    }

    const body = await req.json()
    const { bookingId, paymentType, action } = body

    if (action === 'create-order') {
      if (!bookingId || !paymentType) {
        return NextResponse.json(apiError('bookingId and paymentType required'), { status: 400 })
      }

      const order = await createPaymentOrder(bookingId, session.id, paymentType)
      return NextResponse.json(apiSuccess(order))
    }

    if (action === 'verify') {
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = body
      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return NextResponse.json(apiError('Missing payment verification data'), { status: 400 })
      }

      const payment = await verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature)
      return NextResponse.json(apiSuccess(payment, 'Payment verified successfully'))
    }

    return NextResponse.json(apiError('Invalid action'), { status: 400 })

  } catch (error: any) {
    return NextResponse.json(apiError(error.message), { status: 400 })
  }
}