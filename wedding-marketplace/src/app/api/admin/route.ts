// src/app/api/admin/route.ts
// Admin panel API — vendor approvals, stats, moderation

import { NextRequest, NextResponse } from 'next/server'
import {
  getAdminStats,
  getPendingVendors,
  approveVendor,
  rejectVendor,
  suspendVendor,
  toggleFeaturedVendor,
  processVendorPayout,
  createCoupon,
} from '@/modules/admin/admin.service'
import { apiSuccess, apiError } from '@/lib/utils'
import { getServerSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(req)
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(apiError('Admin access required'), { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const page = Number(searchParams.get('page')) || 1

    if (type === 'stats') {
      const stats = await getAdminStats(session.id)
      return NextResponse.json(apiSuccess(stats))
    }

    if (type === 'pending-vendors') {
      const data = await getPendingVendors(session.id, page)
      return NextResponse.json(apiSuccess(data))
    }

    return NextResponse.json(apiError('Invalid type parameter'), { status: 400 })

  } catch (error: any) {
    return NextResponse.json(apiError(error.message), { status: 400 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(req)
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(apiError('Admin access required'), { status: 403 })
    }

    const body = await req.json()
    const { action, vendorId, payoutId, reason, utrNumber, coupon } = body

    switch (action) {
      case 'approve-vendor':
        const approved = await approveVendor(session.id, vendorId)
        return NextResponse.json(apiSuccess(approved))

      case 'reject-vendor':
        if (!reason) return NextResponse.json(apiError('Reason required'), { status: 400 })
        const rejected = await rejectVendor(session.id, vendorId, reason)
        return NextResponse.json(apiSuccess(rejected))

      case 'suspend-vendor':
        if (!reason) return NextResponse.json(apiError('Reason required'), { status: 400 })
        await suspendVendor(session.id, vendorId, reason)
        return NextResponse.json(apiSuccess(null, 'Vendor suspended'))

      case 'toggle-featured':
        const toggled = await toggleFeaturedVendor(session.id, vendorId)
        return NextResponse.json(apiSuccess(toggled))

      case 'process-payout':
        if (!payoutId || !utrNumber) {
          return NextResponse.json(apiError('payoutId and utrNumber required'), { status: 400 })
        }
        const payout = await processVendorPayout(session.id, payoutId, utrNumber)
        return NextResponse.json(apiSuccess(payout))

      case 'create-coupon':
        if (!coupon) return NextResponse.json(apiError('Coupon data required'), { status: 400 })
        const newCoupon = await createCoupon(session.id, coupon)
        return NextResponse.json(apiSuccess(newCoupon, 'Coupon created'), { status: 201 })

      default:
        return NextResponse.json(apiError('Invalid action'), { status: 400 })
    }

  } catch (error: any) {
    return NextResponse.json(apiError(error.message), { status: 400 })
  }
}