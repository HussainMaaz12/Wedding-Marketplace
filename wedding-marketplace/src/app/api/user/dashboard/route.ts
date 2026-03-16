import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Booking } from '@/models'
import { getServerSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(req)
    if (!session || session.role !== 'CUSTOMER') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const customerId = session.id

    // Aggregate booking stats for customer
    const bookings = await Booking.find({ customerId })
    
    let totalSpent = 0
    let upcomingEvents = 0
    let pendingEnquiries = 0

    const now = new Date()

    bookings.forEach(booking => {
      if (booking.status === 'CONFIRMED' || booking.status === 'COMPLETED') {
        totalSpent += (booking.advanceAmount || 0) + (booking.balanceAmount || 0)
      }
      if (booking.status === 'CONFIRMED' && new Date(booking.eventDate) >= now) {
        upcomingEvents++
      }
      if (booking.status === 'ENQUIRY' || booking.status === 'ACCEPTED') {
        pendingEnquiries++
      }
    })

    const stats = {
      totalBookings: bookings.length,
      totalSpent,
      upcomingEvents,
      pendingEnquiries,
    }

    // Recent activity (last 3 bookings)
    const recentActivity = await Booking.find({ customerId })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('vendorId', 'businessName slug')
      .lean()

    return NextResponse.json({
      success: true,
      data: {
        stats,
        recentActivity,
      }
    })

  } catch (error: any) {
    console.error('Customer dashboard error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to load dashboard data' },
      { status: 500 }
    )
  }
}
