// src/app/api/vendor/packages/[id]/route.ts
// PUT    /api/vendor/packages/:id — updates a package
// DELETE /api/vendor/packages/:id — soft-deletes a package

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Vendor, Package } from '@/models'
import { apiSuccess, apiError } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(req)
    if (!session || session.role !== 'VENDOR') {
      return NextResponse.json(apiError('Vendor access only'), { status: 403 })
    }

    await connectDB()

    const vendor = await Vendor.findOne({ userId: session.id })
    if (!vendor) {
      return NextResponse.json(apiError('No vendor profile'), { status: 400 })
    }

    const { id } = await params
    const pkg = await Package.findOne({ _id: id, vendorId: vendor._id })
    if (!pkg) {
      return NextResponse.json(apiError('Package not found'), { status: 404 })
    }

    const { name, description, price, includes, isActive } = await req.json()

    if (name !== undefined && !name?.trim()) {
      return NextResponse.json(apiError('Package name cannot be empty'), { status: 400 })
    }
    if (price !== undefined && price < 500) {
      return NextResponse.json(apiError('Price must be at least ₹500'), { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name.trim()
    if (description !== undefined) updateData.description = description.trim()
    if (price !== undefined) updateData.price = Number(price)
    if (includes !== undefined) updateData.includes = includes
    if (isActive !== undefined) updateData.isActive = isActive

    const updated = await Package.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )

    return NextResponse.json(apiSuccess(updated, 'Package updated'))

  } catch (error: any) {
    return NextResponse.json(
      apiError(error.message || 'Failed to update package'),
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(req)
    if (!session || session.role !== 'VENDOR') {
      return NextResponse.json(apiError('Vendor access only'), { status: 403 })
    }

    await connectDB()

    const vendor = await Vendor.findOne({ userId: session.id })
    if (!vendor) {
      return NextResponse.json(apiError('No vendor profile'), { status: 400 })
    }

    const { id } = await params
    const pkg = await Package.findOne({ _id: id, vendorId: vendor._id })
    if (!pkg) {
      return NextResponse.json(apiError('Package not found'), { status: 404 })
    }

    // Soft delete — set isActive to false
    await Package.findByIdAndUpdate(id, { $set: { isActive: false } })

    return NextResponse.json(apiSuccess(null, 'Package deleted'))

  } catch (error: any) {
    return NextResponse.json(
      apiError(error.message || 'Failed to delete package'),
      { status: 500 }
    )
  }
}
