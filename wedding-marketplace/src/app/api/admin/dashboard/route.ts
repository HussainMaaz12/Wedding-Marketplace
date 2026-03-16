import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Booking, Vendor, User } from '@/models'
import { getServerSession } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const session = await getServerSession(req)
    
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(apiError('Unauthorized. Admin access required.'), { status: 403 })
    }

    const totalUsers = await User.countDocuments({ role: 'CUSTOMER' })
    const totalVendors = await Vendor.countDocuments()
    
    // Revenue metrics
    const bookings = await Booking.find()
    
    let totalGMV = 0 // Gross merchandise value
    let totalPlatformRevenue = 0 // Commission earned
    let totalBookings = bookings.length

    bookings.forEach(booking => {
      if (booking.status === 'COMPLETED' || booking.status === 'CONFIRMED') {
        const amount = booking.totalAmount || 0
        totalGMV += amount
        totalPlatformRevenue += booking.commissionAmount || (amount * 0.1) // fallback 10%
      }
    })

    const stats = {
      totalUsers,
      totalVendors,
      totalBookings,
      totalGMV,
      totalPlatformRevenue,
    }

    return NextResponse.json(apiSuccess({ stats }))

  } catch (error: any) {
    console.error('Admin Dashboard API Error:', error)
    return NextResponse.json(apiError(error.message || 'Failed to fetch admin dashboard data'), { status: 500 })
  }
}
