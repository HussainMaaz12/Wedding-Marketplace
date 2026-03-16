import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { getServerSession } from '@/lib/auth'
import { respondToEnquiry } from '@/modules/bookings/booking.service'
import { apiSuccess, apiError } from '@/lib/utils'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const session = await getServerSession(req)
    
    if (!session || session.role !== 'VENDOR') {
      return NextResponse.json(apiError('Unauthorized. Vendor access required.'), { status: 403 })
    }

    const { id } = await params // bookingId
    const body = await req.json()
    const { action, note, rejectionReason } = body

    if (!['ACCEPT', 'REJECT'].includes(action)) {
      return NextResponse.json(apiError('Invalid action. Must be ACCEPT or REJECT.'), { status: 400 })
    }

    const result = await respondToEnquiry(session.id, {
      bookingId: id,
      action,
      note,
      rejectionReason
    })

    return NextResponse.json(apiSuccess(result))

  } catch (error: any) {
    console.error('Vendor Booking Response API Error:', error)
    return NextResponse.json(apiError(error.message || 'Failed to update booking'), { status: 400 })
  }
}
