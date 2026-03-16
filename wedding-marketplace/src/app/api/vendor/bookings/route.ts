import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { getServerSession } from '@/lib/auth'
import { getVendorBookings } from '@/modules/bookings/booking.service'
import { apiSuccess, apiError } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const session = await getServerSession(req)
    
    if (!session || session.role !== 'VENDOR') {
      return NextResponse.json(apiError('Unauthorized. Vendor access required.'), { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || undefined
    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 20

    const result = await getVendorBookings(session.id, status, page, limit)

    return NextResponse.json(apiSuccess(result))

  } catch (error: any) {
    console.error('Vendor Bookings API Error:', error)
    return NextResponse.json(apiError(error.message || 'Failed to fetch bookings'), { status: 500 })
  }
}
