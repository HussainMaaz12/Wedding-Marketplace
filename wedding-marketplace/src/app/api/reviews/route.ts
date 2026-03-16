import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Review, Booking, Vendor } from '@/models'
import { getServerSession } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const vendorId = searchParams.get('vendorId')
    
    if (!vendorId) {
       return NextResponse.json(apiError('vendorId is required'), { status: 400 })
    }

    const reviews = await Review.find({ vendorId, status: 'VISIBLE' })
      .sort({ createdAt: -1 })
      .populate('customerId', 'name avatar')
      .lean()

    return NextResponse.json(apiSuccess(reviews))

  } catch (error: any) {
    return NextResponse.json(apiError(error.message || 'Failed to fetch reviews'), { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const session = await getServerSession(req)
    
    if (!session || session.role !== 'CUSTOMER') {
      return NextResponse.json(apiError('Unauthorized. Only customers can leave reviews.'), { status: 403 })
    }

    const body = await req.json()
    const { bookingId, vendorId, rating, comment, title } = body

    if (!bookingId || !vendorId || !rating || !comment) {
      return NextResponse.json(apiError('Missing required fields'), { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(apiError('Rating must be between 1 and 5'), { status: 400 })
    }

    // Verify booking belongs to customer and is COMPLETED
    const booking = await Booking.findOne({ 
       _id: bookingId, 
       customerId: session.id,
       vendorId: vendorId 
    })

    if (!booking) {
       return NextResponse.json(apiError('Valid booking not found'), { status: 404 })
    }

    // Allow reviews for CONFIRMED bookings as well for testing ease, otherwise typically just COMPLETED
    if (booking.status !== 'COMPLETED' && booking.status !== 'CONFIRMED') {
        return NextResponse.json(apiError('Reviews can only be left for confirmed or completed bookings.'), { status: 400 })
    }

    // Check if review already exists for this booking
    const existingReview = await Review.findOne({ bookingId })
    if (existingReview) {
       return NextResponse.json(apiError('You have already reviewed this booking'), { status: 400 })
    }

    const review = await Review.create({
      bookingId,
      customerId: session.id,
      vendorId,
      rating,
      title,
      comment,
    })

    // Update Vendor's average rating and total reviews
    const vendorReviews = await Review.find({ vendorId, status: 'VISIBLE' })
    const totalReviews = vendorReviews.length
    const averageRating = totalReviews > 0 
       ? vendorReviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews 
       : rating

    await Vendor.findByIdAndUpdate(vendorId, {
       totalReviews,
       averageRating
    })

    return NextResponse.json(apiSuccess(review, 'Review submitted successfully!'), { status: 201 })

  } catch (error: any) {
    console.error('Review API Error:', error)
    return NextResponse.json(apiError(error.message || 'Failed to submit review'), { status: 500 })
  }
}
