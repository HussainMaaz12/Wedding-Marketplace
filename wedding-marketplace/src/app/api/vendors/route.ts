// src/app/api/vendors/route.ts
// GET /api/vendors — Public search & filtering endpoint

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Vendor } from '@/models'
// Need to import Category to ensure it's registered for populate
import '@/models/Category'
import { apiSuccess, apiError } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    
    // Parse filters
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const city = searchParams.get('city')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const sort = searchParams.get('sort') || 'newest'

    // Build query
    // For now we allow PENDING as well so the user can test without an admin panel
    // In production, this should ideally be { status: 'APPROVED' }
    const query: any = { 
      status: { $in: ['PENDING', 'APPROVED'] }
    }

    if (search) {
      query.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ]
    }

    if (category) {
      query.categoryId = category
    }

    if (city) {
      query.city = { $regex: new RegExp(`^${city}$`, 'i') }
    }

    if (minPrice || maxPrice) {
      query.startingPrice = {}
      if (minPrice) query.startingPrice.$gte = Number(minPrice)
      if (maxPrice) query.startingPrice.$lte = Number(maxPrice)
    }

    // Build sort
    let sortObj: any = {}
    switch (sort) {
      case 'price_asc':
        sortObj = { startingPrice: 1 }
        break
      case 'price_desc':
        sortObj = { startingPrice: -1 }
        break
      case 'rating':
        sortObj = { averageRating: -1, totalReviews: -1 }
        break
      case 'newest':
      default:
        sortObj = { createdAt: -1 }
        break
    }

    const vendors = await Vendor.find(query)
      .populate('categoryId', 'name slug icon')
      .sort(sortObj)
      .select('-__v -updatedAt -userId -businessEmail -businessPhone -address') // Hide private fields
      .lean()

    return NextResponse.json(apiSuccess(vendors))

  } catch (error: any) {
    console.error('Vendors Search API Error:', error)
    return NextResponse.json(
      apiError(error.message || 'Failed to fetch vendors'),
      { status: 500 }
    )
  }
}
