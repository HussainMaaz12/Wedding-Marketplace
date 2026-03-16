import { NextRequest, NextResponse } from 'next/server'
import { getFeaturedVendors } from '@/modules/search/search.service'
import { apiError } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = Math.min(Number(searchParams.get('limit')) || 6, 20)

    const vendors = await getFeaturedVendors(limit)

    return NextResponse.json({
      success: true,
      vendors,
    })
  } catch (error: any) {
    return NextResponse.json(apiError(error.message), { status: 500 })
  }
}