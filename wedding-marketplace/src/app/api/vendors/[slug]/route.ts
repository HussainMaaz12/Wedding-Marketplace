// src/app/api/vendors/[slug]/route.ts
// GET /api/vendors/[slug] — Public vendor profile and packages

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Vendor, Package } from '@/models'
import '@/models/Category' // Ensure registered
import { apiSuccess, apiError } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB()
    const { slug } = await params

    const vendor = await Vendor.findOne({ 
      slug,
      status: { $in: ['PENDING', 'APPROVED'] } 
    })
      .populate('categoryId', 'name slug icon description')
      .select('-userId -__v') // Hide internal user ID
      .lean()

    if (!vendor) {
      return NextResponse.json(apiError('Vendor not found'), { status: 404 })
    }

    // Fetch active packages for this vendor
    const packages = await Package.find({
      vendorId: vendor._id,
      isActive: true
    })
    .sort({ price: 1 }) // Sort cheapest first
    .select('-vendorId -isActive -__v')
    .lean()

    return NextResponse.json(apiSuccess({
      vendor,
      packages
    }))

  } catch (error: any) {
    console.error('Vendor slug API Error:', error)
    return NextResponse.json(
      apiError(error.message || 'Failed to fetch vendor profile'),
      { status: 500 }
    )
  }
}
