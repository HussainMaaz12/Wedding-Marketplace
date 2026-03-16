// src/app/api/vendor/packages/route.ts
// GET  /api/vendor/packages — returns all packages for the current vendor
// POST /api/vendor/packages — creates a new package

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Vendor, Package } from '@/models'
import { apiSuccess, apiError } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(req)
    if (!session || session.role !== 'VENDOR') {
      return NextResponse.json(apiError('Vendor access only'), { status: 403 })
    }

    await connectDB()

    const vendor = await Vendor.findOne({ userId: session.id })
    if (!vendor) {
      return NextResponse.json(apiSuccess([], 'No vendor profile — create one first'))
    }

    const packages = await Package
      .find({ vendorId: vendor._id })
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json(apiSuccess(packages))

  } catch (error: any) {
    return NextResponse.json(
      apiError(error.message || 'Failed to fetch packages'),
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(req)
    if (!session || session.role !== 'VENDOR') {
      return NextResponse.json(apiError('Vendor access only'), { status: 403 })
    }

    await connectDB()

    const vendor = await Vendor.findOne({ userId: session.id })
    if (!vendor) {
      return NextResponse.json(apiError('Create a vendor profile first'), { status: 400 })
    }

    const { name, description, price, includes } = await req.json()

    if (!name?.trim()) {
      return NextResponse.json(apiError('Package name is required'), { status: 400 })
    }
    if (!price || price < 500) {
      return NextResponse.json(apiError('Price must be at least ₹500'), { status: 400 })
    }

    const pkg = await Package.create({
      vendorId: vendor._id,
      name: name.trim(),
      description: description?.trim() || '',
      price: Number(price),
      includes: includes || [],
      isActive: true,
    })

    return NextResponse.json(
      apiSuccess(pkg, 'Package created'),
      { status: 201 }
    )

  } catch (error: any) {
    return NextResponse.json(
      apiError(error.message || 'Failed to create package'),
      { status: 500 }
    )
  }
}
