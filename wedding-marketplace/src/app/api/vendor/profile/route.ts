// src/app/api/vendor/profile/route.ts
// GET  /api/vendor/profile — returns current vendor's profile
// PUT  /api/vendor/profile — updates vendor profile

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Vendor, Category } from '@/models'
import { generateSlug, apiSuccess, apiError } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(req)
    if (!session) {
      return NextResponse.json(apiError('Not authenticated'), { status: 401 })
    }
    if (session.role !== 'VENDOR') {
      return NextResponse.json(apiError('Vendor access only'), { status: 403 })
    }

    await connectDB()

    const vendor = await Vendor
      .findOne({ userId: session.id })
      .populate('categoryId', 'name slug icon')
      .lean()

    if (!vendor) {
      // No vendor profile yet — return empty so the form shows blank
      return NextResponse.json(apiSuccess(null, 'No vendor profile found'))
    }

    return NextResponse.json(apiSuccess(vendor))

  } catch (error: any) {
    return NextResponse.json(
      apiError(error.message || 'Failed to fetch profile'),
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(req)
    if (!session) {
      return NextResponse.json(apiError('Not authenticated'), { status: 401 })
    }
    if (session.role !== 'VENDOR') {
      return NextResponse.json(apiError('Vendor access only'), { status: 403 })
    }

    await connectDB()

    const body = await req.json()
    const {
      businessName, categoryId, description,
      city, state, address,
      businessPhone, businessEmail, website,
      startingPrice, coverImage, portfolioImages,
    } = body

    // Validate required fields
    if (!businessName?.trim()) {
      return NextResponse.json(apiError('Business name is required'), { status: 400 })
    }
    if (!categoryId) {
      return NextResponse.json(apiError('Category is required'), { status: 400 })
    }
    if (!city?.trim()) {
      return NextResponse.json(apiError('City is required'), { status: 400 })
    }
    if (!state?.trim()) {
      return NextResponse.json(apiError('State is required'), { status: 400 })
    }

    // Verify category exists
    const category = await Category.findById(categoryId)
    if (!category) {
      return NextResponse.json(apiError('Invalid category'), { status: 400 })
    }

    // Check if vendor profile exists
    let vendor = await Vendor.findOne({ userId: session.id })

    const profileData = {
      businessName: businessName.trim(),
      categoryId,
      description: description?.trim() || '',
      city: city.trim(),
      state: state.trim(),
      address: address?.trim() || '',
      businessPhone: businessPhone?.trim() || '',
      businessEmail: businessEmail?.trim() || '',
      website: website?.trim() || '',
      startingPrice: startingPrice ? Number(startingPrice) : undefined,
      coverImage: coverImage || '',
      portfolioImages: portfolioImages || [],
    }

    if (vendor) {
      // Update existing vendor
      vendor = await Vendor.findByIdAndUpdate(
        vendor._id,
        { $set: profileData },
        { new: true, runValidators: true }
      )
    } else {
      // Create new vendor profile
      const slug = generateSlug(businessName) + '-' + Date.now().toString(36)
      vendor = await Vendor.create({
        userId: session.id,
        slug,
        status: 'PENDING',
        ...profileData,
      })
    }

    return NextResponse.json(
      apiSuccess(vendor, vendor ? 'Profile updated' : 'Profile created'),
      { status: 200 }
    )

  } catch (error: any) {
    return NextResponse.json(
      apiError(error.message || 'Failed to update profile'),
      { status: 500 }
    )
  }
}
