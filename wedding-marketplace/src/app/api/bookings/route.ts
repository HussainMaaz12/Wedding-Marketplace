// src/app/api/bookings/route.ts
// GET  /api/bookings → Get customer's bookings
// POST /api/bookings → Create new booking enquiry

import { NextRequest, NextResponse } from 'next/server'
import { bookingEnquirySchema } from '@/modules/bookings/booking.schema'
import {
  createBookingEnquiry,
  getCustomerBookings,
} from '@/modules/bookings/booking.service'
import { apiSuccess, apiError } from '@/lib/utils'
import { getServerSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(req)
    if (!session) {
      return NextResponse.json(apiError('Please login first'), { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 10

    const result = await getCustomerBookings(session.id, page, limit)

    return NextResponse.json(apiSuccess(result))

  } catch (error: any) {
    return NextResponse.json(apiError(error.message), { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(req)
    if (!session) {
      return NextResponse.json(apiError('Please login first'), { status: 401 })
    }

    if (session.role !== 'CUSTOMER') {
      return NextResponse.json(apiError('Only customers can create bookings'), { status: 403 })
    }

    const body = await req.json()

    const validation = bookingEnquirySchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        apiError(validation.error.issues[0].message),
        { status: 400 }
      )
    }

    const booking = await createBookingEnquiry(session.id, validation.data)

    return NextResponse.json(
      apiSuccess(booking, 'Enquiry sent successfully!'),
      { status: 201 }
    )

  } catch (error: any) {
    return NextResponse.json(apiError(error.message), { status: 400 })
  }
}