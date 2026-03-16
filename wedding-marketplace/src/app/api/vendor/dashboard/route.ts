import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Booking, Vendor } from '@/models'
import { getServerSession } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const session = await getServerSession(req)

    // 1. Verify session and role
    if (!session || session.role !== 'VENDOR') {
      return NextResponse.json(apiError('Unauthorized. Vendor access required.'), { status: 403 })
    }

    // 2. Find the vendor profile using the User's ID (session.id)
    const vendor = await Vendor.findOne({ userId: session.id })

    // 3. Graceful fallback: If the vendor just registered and has no profile,
    // we return empty stats instead of throwing a 404 error.
    if (!vendor) {
      return NextResponse.json(apiSuccess({
        stats: {
          totalBookings: 0,
          totalRevenue: 0,
          averageRating: 0,
          totalReviews: 0,
          pendingEnquiries: 0,
          upcomingEvents: 0,
        },
        recentEnquiries: [],
        needsProfileSetup: true // Tells the frontend they need to complete their profile
      }))
    }

    // 4. If vendor exists, use their actual vendor _id for the rest of the calculations
    const vendorId = vendor._id

    const bookings = await Booking.find({ vendorId })

    let totalRevenue = 0
    let pendingEnquiries = 0
    let upcomingEvents = 0

    const now = new Date()

    bookings.forEach(booking => {
      // Calculate revenue from COMPLETED or CONFIRMED bookings where money is received
      if (booking.status === 'COMPLETED' || booking.status === 'CONFIRMED') {
        totalRevenue += booking.vendorEarning || (booking.totalAmount - (booking.commissionAmount || 0))
      }
      if (booking.status === 'ENQUIRY') {
        pendingEnquiries++
      }
      if (booking.status === 'CONFIRMED' && new Date(booking.eventDate) >= now) {
        upcomingEvents++
      }
    })

    const stats = {
      totalBookings: vendor.totalBookings || bookings.length,
      totalRevenue,
      averageRating: vendor.averageRating || 0,
      totalReviews: vendor.totalReviews || 0,
      pendingEnquiries,
      upcomingEvents,
    }

    // Get 5 most recent pending enquiries to show at a glance
    const recentEnquiries = await Booking.find({ vendorId, status: 'ENQUIRY' })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('customerId', 'name')
      .lean()

    return NextResponse.json(apiSuccess({
      stats,
      recentEnquiries,
      needsProfileSetup: false
    }))

  } catch (error: any) {
    console.error('Vendor Dashboard API Error:', error)
    return NextResponse.json(apiError(error.message || 'Failed to fetch dashboard data'), { status: 500 })
  }
}